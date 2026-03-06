import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Valid action types
const VALID_TYPES = [
  "welcome_popup_submitted",
  "welcome_popup_hidden",
  "banner_dismissed",
  "guestbook_submitted",
] as const;
type ActionType = (typeof VALID_TYPES)[number];

/**
 * Buat Supabase client server-side.
 * Prioritaskan service role key agar bisa bypass RLS.
 * Fallback ke anon key jika service role key tidak tersedia.
 */
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Ambil IP pengunjung dari request headers.
 * Mendukung: Vercel (x-forwarded-for), Nginx (x-real-ip), lokal (remote addr).
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * Periksa apakah IP adalah private/lokal (tidak berguna sebagai identifier unik).
 */
function isPrivateIP(ip: string): boolean {
  return (
    ip === "unknown" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  );
}

/**
 * GET /api/visitor-check?type=<action_type>&fp=<browser_fingerprint>
 *
 * Strategi pengecekan (berurutan, berhenti di yang pertama cocok):
 *   1. Jika `fp` (browser fingerprint) diberikan → query by fingerprint.
 *      Ini akurat per-perangkat/browser, tidak terpengaruh shared IP.
 *   2. Fallback ke IP address jika fingerprint tidak ada.
 *
 * Response: { checked: boolean }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ActionType | null;
  const fp   = searchParams.get("fp") ?? "";

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Parameter 'type' tidak valid." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();

  try {
    // ── Prioritas 1: fingerprint (akurat per perangkat) ──────────────────────
    if (fp) {
      const { data, error } = await supabase
        .from("visitor_ip_log")
        .select("id")
        .eq("browser_fingerprint", fp)
        .eq("action_type", type)
        .maybeSingle();

      if (error) throw error;

      // Jika sudah tercatat di visitor_ip_log → langsung kembalikan.
      if (data) return NextResponse.json({ checked: true });

      // ── Fallback: untuk guestbook_submitted, cek langsung tabel guestbook ──
      // Ini menangani kasus di mana insert ke visitor_ip_log pernah gagal
      // (RLS / error jaringan) tapi entry guestbook berhasil tersimpan.
      if (type === "guestbook_submitted") {
        const { data: gbData, error: gbError } = await supabase
          .from("guestbook")
          .select("id")
          .eq("browser_fingerprint", fp)
          .maybeSingle();

        if (gbError) throw gbError;

        if (gbData) {
          // Backfill visitor_ip_log agar cek berikutnya lebih cepat (fire-and-forget)
          void supabase
            .from("visitor_ip_log")
            .upsert(
              { browser_fingerprint: fp, action_type: type, ip_address: getClientIP(req) !== "unknown" ? getClientIP(req) : null },
              { onConflict: "browser_fingerprint,action_type", ignoreDuplicates: true }
            )
          return NextResponse.json({ checked: true });
        }
      }

      // ── Fallback: IP address (kasus fp baru karena localStorage dihapus) ───
      // Fingerprint tidak ditemukan di DB, tapi IP mungkin pernah tercatat
      // saat submit sebelumnya dengan fp yang berbeda.
      const ip = getClientIP(req);
      if (!isPrivateIP(ip)) {
        const { data: ipData } = await supabase
          .from("visitor_ip_log")
          .select("id")
          .eq("ip_address", ip)
          .eq("action_type", type)
          .maybeSingle();

        if (ipData) return NextResponse.json({ checked: true, matchedBy: "ip" });
      }

      return NextResponse.json({ checked: false });
    }

    // ── Prioritas 2: IP address (fallback jika fp tidak diberikan sama sekali) ─
    const ip = getClientIP(req);
    if (isPrivateIP(ip)) {
      return NextResponse.json({ checked: false });
    }

    const { data, error } = await supabase
      .from("visitor_ip_log")
      .select("id")
      .eq("ip_address", ip)
      .eq("action_type", type)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ checked: !!data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[visitor-check] GET error:", msg);
    // Fail-open: jangan blok user jika DB error
    return NextResponse.json({ checked: false });
  }
}

/**
 * POST /api/visitor-check
 * Body: { type: <action_type>, fingerprint?: string }
 *
 * Menyimpan catatan aksi pengunjung.
 * Jika fingerprint diberikan → upsert by (browser_fingerprint, action_type).
 * IP address selalu disimpan sebagai metadata tambahan.
 *
 * Response: { success: boolean }
 */
export async function POST(req: NextRequest) {
  let body: { type?: string; fingerprint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const type = body?.type as ActionType | undefined;
  const fp   = body?.fingerprint ?? "";

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Field 'type' tidak valid." },
      { status: 400 }
    );
  }

  const ip = getClientIP(req);
  const supabase = getSupabaseServer();

  try {
    if (fp) {
      // Upsert by fingerprint — idempotent, tidak duplikat per perangkat
      const { error } = await supabase.from("visitor_ip_log").upsert(
        { browser_fingerprint: fp, action_type: type, ip_address: ip !== "unknown" ? ip : null },
        { onConflict: "browser_fingerprint,action_type", ignoreDuplicates: true }
      );
      if (error) throw error;
    } else {
      // Fallback: simpan by IP saja (tanpa fingerprint, mode development/fallback)
      if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
        return NextResponse.json({ success: true, skipped: true });
      }
      const { error } = await supabase.from("visitor_ip_log").insert(
        { ip_address: ip, action_type: type }
      );
      // Abaikan duplicate error (23505) — sudah tercatat sebelumnya
      if (error && error.code !== "23505") throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[visitor-check] POST error:", msg);
    return NextResponse.json(
      { success: false, error: "Gagal mencatat." },
      { status: 500 }
    );
  }
}
