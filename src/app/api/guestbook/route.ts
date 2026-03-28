import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { insertNotification } from "@/lib/notificationUtils";

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
  let body: {
    browser_fingerprint?: string;
    name?: string;
    city?: string;
    profession?: string;
    message?: string;
    mood?: string;
    rating?: number;
    card_color?: string;
    avatar_url?: string | null;
    referral_source?: string;
    contact?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { browser_fingerprint, name, city, profession, message, mood, rating } = body;

  if (!browser_fingerprint || !name || !city || !profession || !message || !mood || !rating) {
    return NextResponse.json({ error: "Field wajib tidak lengkap." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        browser_fingerprint,
        name,
        city,
        profession,
        message,
        mood,
        rating,
        card_color: body.card_color ?? "#6366f1",
        avatar_url: body.avatar_url ?? null,
        referral_source: body.referral_source ?? null,
        contact: body.contact ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // ── Notification ──────────────────────────────────────────────────────────
    await insertNotification(supabase, {
      type: "guestbook_entry",
      title: `Buku Tamu Baru: ${name}`,
      content: `${name} dari ${city} (${profession}) memberikan ulasan ${rating}★: "${message?.slice(0, 80)}${(message?.length ?? 0) > 80 ? "..." : ""}"`,
      target_url: `/dashboard/guestbook?search=${encodeURIComponent(name)}`,
    });

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[guestbook] POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
