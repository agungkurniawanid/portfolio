import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/reset-visitor
 *
 * Developer-only endpoint untuk mereset records pengunjung di database.
 * Berguna saat testing/development tanpa harus akses Supabase Dashboard.
 *
 * Auth: Header "x-reset-secret" harus cocok dengan env DEV_RESET_SECRET.
 *
 * Body:
 *   fp?                  - fingerprint browser yang ingin di-reset
 *   ip?                  - IP address yang ingin di-reset
 *   scope?               - "banner" | "welcome_popup" | "guestbook" | "gallery" | "all" (default: "all")
 *   includeGuestbook?    - hapus juga entry di tabel guestbook (default: false)
 *   includeGalleryGuests? - hapus juga entry di tabel gallery_guests (default: false)
 *
 * Response: { success: boolean, deleted: { visitorLogs: number, guestbookEntries: number, galleryGuestEntries: number } }
 */

const SCOPE_ACTION_MAP: Record<string, string[]> = {
  banner: ["banner_dismissed"],
  welcome_popup: ["welcome_popup_submitted", "welcome_popup_hidden"],
  guestbook: ["guestbook_submitted"],
  gallery: ["gallery_guest_registered"],
  all: ["banner_dismissed", "welcome_popup_submitted", "welcome_popup_hidden", "guestbook_submitted", "gallery_guest_registered"],
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const resetSecret = process.env.DEV_RESET_SECRET;
  if (!resetSecret) {
    return NextResponse.json(
      { error: "DEV_RESET_SECRET tidak dikonfigurasi di environment." },
      { status: 503 }
    );
  }

  const reqSecret = req.headers.get("x-reset-secret");
  if (reqSecret !== resetSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: {
    fp?: string;
    ip?: string;
    scope?: string;
    includeGuestbook?: boolean;
    includeGalleryGuests?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { fp, ip, scope = "all", includeGuestbook = false, includeGalleryGuests = false } = body;

  if (!fp && !ip) {
    return NextResponse.json(
      { error: "Minimal satu dari 'fp' atau 'ip' harus diberikan." },
      { status: 400 }
    );
  }

  const actionTypes = SCOPE_ACTION_MAP[scope];
  if (!actionTypes) {
    return NextResponse.json(
      { error: "scope tidak valid. Gunakan: banner | welcome_popup | guestbook | gallery | all" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();
  const result = { visitorLogs: 0, guestbookEntries: 0, galleryGuestEntries: 0 };

  try {
    // ── Hapus visitor_ip_log ─────────────────────────────────────────────────
    let query = supabase
      .from("visitor_ip_log")
      .delete()
      .in("action_type", actionTypes);

    if (fp) {
      query = query.eq("browser_fingerprint", fp);
    }
    if (ip) {
      query = query.eq("ip_address", ip);
    }

    const { data, error } = await query.select("id");
    if (error) throw error;
    result.visitorLogs = data?.length ?? 0;

    // ── Opsional: hapus entry guestbook ──────────────────────────────────────
    // Hanya dilakukan jika includeGuestbook=true DAN scope mencakup guestbook
    if (includeGuestbook && actionTypes.includes("guestbook_submitted")) {
      if (fp) {
        const { data, error } = await supabase
          .from("guestbook")
          .delete()
          .eq("browser_fingerprint", fp)
          .select("id");

        if (error) throw error;
        result.guestbookEntries += data?.length ?? 0;
      }
    }

    // ── Opsional: hapus entry gallery_guests ─────────────────────────────────
    // Hanya dilakukan jika includeGalleryGuests=true DAN scope mencakup gallery
    if (includeGalleryGuests && actionTypes.includes("gallery_guest_registered")) {
      if (fp) {
        const { data, error } = await supabase
          .from("gallery_guests")
          .delete()
          .eq("browser_fingerprint", fp)
          .select("id");

        if (error) throw error;
        result.galleryGuestEntries += data?.length ?? 0;
      }
    }

    return NextResponse.json({
      success: true,
      deleted: result,
      message: `Reset selesai. Hapus ${result.visitorLogs} visitor log(s)${
        result.guestbookEntries > 0
          ? ` dan ${result.guestbookEntries} guestbook entry`
          : ""
      }${
        result.galleryGuestEntries > 0
          ? ` dan ${result.galleryGuestEntries} gallery guest entry`
          : ""
      }.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[reset-visitor] error:", msg);
    return NextResponse.json(
      { success: false, error: "Gagal reset: " + msg },
      { status: 500 }
    );
  }
}
