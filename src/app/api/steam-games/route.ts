import { NextResponse } from "next/server";

export async function GET() {
  const STEAM_API_KEY = process.env.STEAM_API_KEY ?? process.env.NEXT_PUBLIC_STEAM_API_KEY ?? "";
  const STEAM_ID = process.env.NEXT_PUBLIC_STEAM_ID ?? "";

  if (!STEAM_API_KEY) {
    // Return mock data when API key is not set
    return NextResponse.json({
      response: {
        game_count: 0,
        games: [],
      },
    });
  }

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
    if (!res.ok) {
      return NextResponse.json(
        { error: "Steam API error", status: res.status },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
