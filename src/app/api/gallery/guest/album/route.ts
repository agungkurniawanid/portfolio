import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { insertNotification } from "@/lib/notificationUtils"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/gallery/guest/album
 * Membuat album baru untuk tamu.
 *
 * Body JSON:
 *   {
 *     guestId: number,
 *     guestName: string,
 *     name: string,
 *     category: string,
 *     description?: string,
 *     coverUrl?: string,
 *   }
 *
 * Returns:
 *   { album: { slug, name, description, category, coverUrl, period, photoCount, ownerType, guestId } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guestId, guestName, name, category, description, coverUrl } = body as {
      guestId: number
      guestName: string
      name: string
      category: string
      description?: string
      coverUrl?: string
    }

    if (!guestId) {
      return NextResponse.json({ error: "guestId wajib diisi" }, { status: 400 })
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama album wajib diisi" }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: "Kategori wajib dipilih" }, { status: 400 })
    }

    // Buat slug unik: guest-{id}-{album-name-slugified}-{timestamp}
    const nameSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40)

    const slug = `guest-${guestId}-${nameSlug}-${Date.now()}`
    const period = new Date().getFullYear().toString()

    const { data: album, error: insertErr } = await supabaseAdmin
      .from("gallery_albums")
      .insert({
        slug,
        name: name.trim(),
        description: description?.trim() || `Album oleh ${guestName}`,
        category,
        cover_url: coverUrl || "",
        period,
        photo_count: 0,
        owner_type: "guest",
        guest_id: guestId,
      })
      .select("slug, name, description, category, cover_url, period, photo_count, owner_type, guest_id")
      .single()

    if (insertErr) {
      console.error("[gallery/guest/album] insert error:", insertErr.message)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Update album_count on gallery_guests
    const { count } = await supabaseAdmin
      .from("gallery_albums")
      .select("*", { count: "exact", head: true })
      .eq("guest_id", guestId)
      .eq("owner_type", "guest")

    await supabaseAdmin
      .from("gallery_guests")
      .update({ album_count: count || 0 })
      .eq("id", guestId)

    // ── Notification ──────────────────────────────────────────────────────────
    await insertNotification(supabaseAdmin, {
      type: "gallery_guest_album",
      title: `Album Baru dari ${guestName}`,
      content: `${guestName} membuat album baru "${album.name}" dalam kategori ${album.category}.`,
      target_url: `/dashboard/gallery?view=albums&search=${encodeURIComponent(album.name)}`,
    })

    return NextResponse.json({
      album: {
        slug: album.slug,
        name: album.name,
        description: album.description,
        category: album.category,
        coverUrl: album.cover_url,
        period: album.period,
        photoCount: album.photo_count,
        ownerType: album.owner_type,
        guestId: album.guest_id,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("[gallery/guest/album] error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
