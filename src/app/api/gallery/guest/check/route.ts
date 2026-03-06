import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/gallery/guest/check?fp=<fingerprint>
 * Cek apakah user sudah terdaftar sebagai guest.
 *
 * Urutan pengecekan (triple layer):
 *   0. Guest ID (dari cookie) — paling reliable
 *   1. Browser fingerprint (SHA-256) — akurat, berbasis kombinasi browser/device
 *   2. IP address — backup layer via visitor_ip_log (tracking terpusat)
 *
 * IP disimpan di visitor_ip_log (bukan gallery_guests) sehingga
 * bisa di-reset via dev-reset bersama fitur lainnya.
 */
export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get("fp") ?? ""
  const idParam = req.nextUrl.searchParams.get("id") ?? ""

  // Ambil IP dari request headers (server-side only)
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null

  // ── Layer 0: cek by guest ID (paling reliable, dari cookie) ──────────────
  if (idParam) {
    const { data: byId } = await supabaseAdmin
      .from("gallery_guests")
      .select("id, name, avatar_url, album_count, photo_count, created_at")
      .eq("id", idParam)
      .maybeSingle()

    if (byId) {
      return NextResponse.json({
        guest: {
          id: byId.id,
          name: byId.name,
          avatarUrl: byId.avatar_url,
          albumCount: byId.album_count,
          photoCount: byId.photo_count,
          createdAt: byId.created_at,
        },
        matchedBy: "id",
      })
    }
  }

  // ── Layer 1: cek by fingerprint ──────────────────────────────────────────
  if (fp) {
    const { data: byFp } = await supabaseAdmin
      .from("gallery_guests")
      .select("id, name, avatar_url, album_count, photo_count, created_at")
      .eq("browser_fingerprint", fp)
      .maybeSingle()

    if (byFp) {
      return NextResponse.json({
        guest: {
          id: byFp.id,
          name: byFp.name,
          avatarUrl: byFp.avatar_url,
          albumCount: byFp.album_count,
          photoCount: byFp.photo_count,
          createdAt: byFp.created_at,
        },
        matchedBy: "fingerprint",
      })
    }
  }

  // ── Layer 2: cek by IP address via visitor_ip_log ────────────────────────
  // Hanya berlaku jika IP bukan private/local (127.x, 192.168.x, ::1, dsb.)
  // Ambil fingerprint dari visitor_ip_log → lalu lookup profil di gallery_guests
  const isPrivateIp = !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")

  if (!isPrivateIp) {
    const { data: logEntry } = await supabaseAdmin
      .from("visitor_ip_log")
      .select("browser_fingerprint")
      .eq("ip_address", ip)
      .eq("action_type", "gallery_guest_registered")
      .maybeSingle()

    if (logEntry?.browser_fingerprint) {
      const { data: byIp } = await supabaseAdmin
        .from("gallery_guests")
        .select("id, name, avatar_url, album_count, photo_count, created_at")
        .eq("browser_fingerprint", logEntry.browser_fingerprint)
        .maybeSingle()

      if (byIp) {
        return NextResponse.json({
          guest: {
            id: byIp.id,
            name: byIp.name,
            avatarUrl: byIp.avatar_url,
            albumCount: byIp.album_count,
            photoCount: byIp.photo_count,
            createdAt: byIp.created_at,
          },
          matchedBy: "ip",
        })
      }
    }
  }

  // ── Belum terdaftar ───────────────────────────────────────────────────────
  return NextResponse.json({ guest: null, matchedBy: null })
}
