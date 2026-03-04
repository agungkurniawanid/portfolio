import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "finished" | "wishlist" | "favorite" | null

  let query = supabase.from("books").select("*").order("created_at", { ascending: false });
  if (status && ["finished", "wishlist", "favorite"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ books: [], error: error.message }, { status: 200 });
  }
  return NextResponse.json({ books: data ?? [] });
}
