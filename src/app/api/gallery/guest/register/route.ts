import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/gallery/guest/register
 * Mendaftarkan pengunjung baru sebagai tamu Gallery Tamu.
 * Satu fingerprint hanya bisa daftar satu kali.
 *
 * Body JSON:
 *   { name: string, fingerprint: string, avatarUrl?: string }
 *
 * Returns:
 *   { guest: GalleryGuestData, alreadyExists: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, fingerprint, avatarUrl } = body as {
      name: string
      fingerprint: string
      avatarUrl?: string | null
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 })
    }
    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint tidak valid" }, { status: 400 })
    }

    // Get IP from headers
    const headersList = await headers()
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null

    // Cek apakah fingerprint sudah terdaftar
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from("gallery_guests")
      .select("id, name, avatar_url, album_count, photo_count, created_at")
      .eq("browser_fingerprint", fingerprint)
      .maybeSingle()

    if (checkErr) {
      console.error("[gallery/guest/register] check error:", checkErr.message)
      return NextResponse.json({ error: checkErr.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({
        guest: {
          id: existing.id,
          name: existing.name,
          avatarUrl: existing.avatar_url,
          albumCount: existing.album_count,
          photoCount: existing.photo_count,
          createdAt: existing.created_at,
        },
        alreadyExists: true,
      })
    }

    // Insert tamu baru
    const { data: guest, error: insertErr } = await supabaseAdmin
      .from("gallery_guests")
      .insert({
        name: name.trim(),
        avatar_url: avatarUrl || null,
        browser_fingerprint: fingerprint,
        ip_address: ip,
        album_count: 0,
        photo_count: 0,
      })
      .select("id, name, avatar_url, album_count, photo_count, created_at")
      .single()

    if (insertErr) {
      console.error("[gallery/guest/register] insert error:", insertErr.message)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        avatarUrl: guest.avatar_url,
        albumCount: guest.album_count,
        photoCount: guest.photo_count,
        createdAt: guest.created_at,
      },
      alreadyExists: false,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("[gallery/guest/register] error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
