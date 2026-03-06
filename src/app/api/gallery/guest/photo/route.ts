import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PhotoInput {
  imageUrl: string
  thumbnailUrl?: string
  title: string
  description?: string
  location?: string
  date?: string
  width?: number
  height?: number
}

/**
 * POST /api/gallery/guest/photo
 * Menyimpan data foto yang sudah diupload tamu ke Supabase Storage.
 *
 * Body JSON:
 *   {
 *     guestId: number,
 *     guestName: string,
 *     albumSlug: string,
 *     albumName: string,
 *     albumCategory: string,
 *     photos: PhotoInput[],
 *   }
 *
 * Returns:
 *   { count: number, photos: { id }[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guestId, guestName, albumSlug, albumName, albumCategory, photos } = body as {
      guestId: number
      guestName: string
      albumSlug: string
      albumName: string
      albumCategory: string
      photos: PhotoInput[]
    }

    if (!guestId) {
      return NextResponse.json({ error: "guestId wajib diisi" }, { status: 400 })
    }
    if (!albumSlug) {
      return NextResponse.json({ error: "albumSlug wajib diisi" }, { status: 400 })
    }
    if (!photos?.length) {
      return NextResponse.json({ error: "Minimal 1 foto diperlukan" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    const rows = photos.map((p) => ({
      title: p.title?.trim() || albumName,
      description: p.description?.trim() || "",
      location: p.location?.trim() || "",
      date: p.date || today,
      category: albumCategory,
      album: albumName,
      album_slug: albumSlug,
      device: "Guest Upload",
      image_url: p.imageUrl,
      thumbnail_url: p.thumbnailUrl || p.imageUrl,
      width: p.width || 1200,
      height: p.height || 800,
      is_featured: false,
      tags: [],
      owner_type: "guest",
      is_approved: true, // auto-approved: langsung tampil di gallery tamu
      uploader_name: guestName,
      guest_id: guestId,
    }))

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("gallery_photos")
      .insert(rows)
      .select("id")

    if (insertErr) {
      console.error("[gallery/guest/photo] insert error:", insertErr.message)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Update cover album ke foto pertama jika belum ada cover
    const firstPhotoUrl = photos[0]?.imageUrl
    if (firstPhotoUrl) {
      const { data: albumData } = await supabaseAdmin
        .from("gallery_albums")
        .select("cover_url, photo_count")
        .eq("slug", albumSlug)
        .maybeSingle()

      const newCount = (albumData?.photo_count || 0) + photos.length
      await supabaseAdmin
        .from("gallery_albums")
        .update({
          photo_count: newCount,
          ...(albumData?.cover_url === "" ? { cover_url: firstPhotoUrl } : {}),
        })
        .eq("slug", albumSlug)
    }

    // Update photo_count pada gallery_guests
    const { count: totalPhotos } = await supabaseAdmin
      .from("gallery_photos")
      .select("*", { count: "exact", head: true })
      .eq("guest_id", guestId)

    await supabaseAdmin
      .from("gallery_guests")
      .update({ photo_count: totalPhotos || 0 })
      .eq("id", guestId)

    return NextResponse.json({
      count: inserted?.length || 0,
      photos: inserted,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    console.error("[gallery/guest/photo] error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
