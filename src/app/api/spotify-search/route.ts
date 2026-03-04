import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";

let _tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null;
  if (_tokenCache && Date.now() < _tokenCache.exp) return _tokenCache.token;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) return null;
  const data = await res.json();
  _tokenCache = { token: data.access_token, exp: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ track_id: null }, { status: 200 });
  }

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json(
      { track_id: null, error: "Spotify credentials not configured" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return NextResponse.json({ track_id: null }, { status: 200 });

    const data = await res.json();
    const track = data.tracks?.items?.[0];
    if (!track) return NextResponse.json({ track_id: null }, { status: 200 });

    return NextResponse.json({
      track_id: track.id as string,
      track_name: track.name as string,
      artist: (track.artists as Array<{ name: string }>)?.[0]?.name ?? "",
      embed_url: `https://open.spotify.com/embed/track/${track.id}`,
    });
  } catch (err) {
    return NextResponse.json({ track_id: null, error: String(err) }, { status: 200 });
  }
}
