import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 300;

export async function GET() {
  // Fetch tracks
  const { data: tracks, error: tracksErr } = await supabase
    .from("music_tracks")
    .select("*")
    .order("id");

  // Fetch albums with their track relations
  const { data: albums, error: albumsErr } = await supabase
    .from("custom_albums")
    .select("*, custom_album_tracks(position, music_tracks(*))")
    .order("id");

  if (tracksErr || albumsErr) {
    return NextResponse.json(
      { tracks: [], albums: [], error: tracksErr?.message ?? albumsErr?.message },
      { status: 200 }
    );
  }

  // Normalise album tracks
  const normalisedAlbums = (albums ?? []).map((album) => {
    const albumTracks = (
      (album.custom_album_tracks as Array<{ position: number; music_tracks: unknown }>) ?? []
    )
      .sort((a, b) => a.position - b.position)
      .map((at) => at.music_tracks);
    return { ...album, custom_album_tracks: undefined, tracks: albumTracks };
  });

  return NextResponse.json({ tracks: tracks ?? [], albums: normalisedAlbums });
}
