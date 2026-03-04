import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 300;

export async function GET() {
  const { data, error } = await supabase
    .from("mobile_games")
    .select("*")
    .eq("status", "playing")
    .order("title");

  if (error) {
    return NextResponse.json({ games: [], error: error.message }, { status: 200 });
  }
  return NextResponse.json({ games: data ?? [] });
}
