import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY ?? "";
const NOTION_DB_ID = process.env.NOTION_WATCHREAD_DB_ID ?? "12056271e05f80739ef0f0b34d8e1f23";

// 1. UBAH DI SINI: Paksa API untuk dinamis dan tidak menggunakan cache bawaan Vercel
export const dynamic = "force-dynamic";

export async function GET() {
  if (!NOTION_API_KEY) {
    return NextResponse.json({ items: [], error: "No Notion API key" }, { status: 200 });
  }

  try {
    const allItems: unknown[] = [];
    let cursor: string | undefined = undefined;

    do {
      const body: Record<string, unknown> = { page_size: 100 };
      if (cursor) body.start_cursor = cursor;

      const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        // 2. UBAH DI SINI: Matikan cache untuk request fetch ini
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ items: [], error: err }, { status: 200 });
      }

      const data = await res.json();
      allItems.push(...(data.results ?? []));
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const items = allItems.map((page: unknown) => {
      const p = page as Record<string, unknown>;
      const props = p.properties as Record<string, any>;

      // Helper untuk mengambil data Notion
      const getTitle = (prop: any) => {
        if (!prop) return "";
        const arr = prop.title || prop.rich_text;
        if (arr?.length) return arr.map((t: any) => t.plain_text).join("");
        return "";
      };
      
      const getSelect = (prop: any) => prop?.select?.name ?? null;
      
      const getMultiSelect = (prop: any) => {
        if (prop?.multi_select) return prop.multi_select.map((s: any) => s.name);
        if (prop?.select) return [prop.select.name];
        return [];
      };

      const getDate = (prop: any) => prop?.date?.start ?? null;

      // Pemetaan kolom
      const title = getTitle(props["Name"]) || "Untitled";
      const progress = getTitle(props["Episode"]); 
      const categoryRaw = getSelect(props["Category"]);
      const statusRaw = getSelect(props["Status"]); 
      const tagsRaw = getMultiSelect(props["Tags"]); 
      const adultRaw = getSelect(props["Adult"]); 
      const lastSeen = getDate(props["Last Seen"]);
      const createdTime = p.created_time as string;

      // Normalisasi Kategori
      const normalizeCategory = (c: string | null): string => {
        if (!c) return "Movie";
        const lower = c.toLowerCase();
        if (lower.includes("movie")) return "Movie";
        if (lower.includes("anime")) return "Anime";
        if (lower.includes("manhwa")) return "Manhwa";
        if (lower.includes("donghua")) return "Donghua";
        if (lower.includes("manga")) return "Manga";
        if (lower.includes("cartoon")) return "Cartoon";
        return "Movie";
      };

      const category = normalizeCategory(categoryRaw);

      // Normalisasi Status Pintar (Tanpa Paused)
      const normalizeStatus = (): string => {
        const s = (statusRaw || "").toLowerCase();
        const t = tagsRaw.join(" ").toLowerCase();

        // Jika eksplisit belum ditonton atau akan ditonton
        if (s === "not watched" || t.includes("will watch") || t.includes("soon")) {
          return "plan_to_watch";
        }
        
        // Jika sedang ditonton
        if (s === "watched") {
          // Ongoing dan Waiting Confirmation masuk ke Sedang Tonton/Baca
          if (t.includes("ongoing") || t.includes("waiting confirmation")) {
            return (category === "Manga" || category === "Manhwa") ? "reading" : "watching";
          }
          if (t.includes("end")) {
            return "completed";
          }
          return "completed"; // Default kalau "Watched" tapi ga ada tag
        }

        return "plan_to_watch";
      };

      return {
        id: p.id as string,
        title,
        category,
        status: normalizeStatus(),
        progress: progress || null,
        raw_tags: tagsRaw, 
        is_adult: adultRaw === "True", 
        created_time: lastSeen || createdTime, 
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[notion-watchread]", err);
    return NextResponse.json({ items: [], error: String(err) }, { status: 200 });
  }
}