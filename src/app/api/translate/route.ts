import { NextRequest, NextResponse } from "next/server"

const FETCH_TIMEOUT = 8_000

/**
 * Google Translate unofficial endpoint (client=gtx, no API key needed).
 * Returns: [ [ ["translated","original",...], ... ], null, "detected-lang", ... ]
 */
async function tryGoogle(
  text: string,
  source: string,
  target: string
): Promise<string | null> {
  const sl = source === "auto" ? "auto" : source
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${sl}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const res = await fetch(url, { signal: controller.signal })

    if (!res.ok) {
      console.warn(`[translate] Google returned HTTP ${res.status}`)
      return null
    }

    const data = (await res.json()) as Array<unknown>

    // data[0] is an array of translation chunks: each chunk[0] is translated segment
    const chunks = data[0] as Array<[string, ...unknown[]]>
    const translated = chunks.map((c) => c[0]).join("")
    return translated || null
  } catch (err) {
    console.warn("[translate] Google failed:", err instanceof Error ? err.message : err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * MyMemory fallback (free, no API key needed).
 */
async function tryMyMemory(
  text: string,
  source: string,
  target: string
): Promise<string | null> {
  const sl = source === "auto" ? "autodetect" : source
  const url =
    `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(text)}&langpair=${sl}|${target}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      console.warn(`[translate] MyMemory returned HTTP ${res.status}`)
      return null
    }

    const data = (await res.json()) as {
      responseData: { translatedText: string }
      responseStatus: number
    }

    // 200 = OK, 206 = partial match — both contain valid translated text
    if (data.responseStatus !== 200 && data.responseStatus !== 206) {
      console.warn(`[translate] MyMemory status ${data.responseStatus}`)
      return null
    }

    return data.responseData?.translatedText || null
  } catch (err) {
    console.warn("[translate] MyMemory failed:", err instanceof Error ? err.message : err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(request: NextRequest) {
  let text = ""

  try {
    const body = (await request.json()) as {
      text: string
      source: string
      target: string
    }

    text = body.text ?? ""
    const source = body.source ?? "auto"
    const target = body.target ?? "en"

    if (!text.trim()) {
      return NextResponse.json({ translatedText: text })
    }

    // Skip if source and target are identical
    if (source !== "auto" && source === target) {
      return NextResponse.json({ translatedText: text, skipped: true })
    }

    // 1. Try Google Translate (most reliable, no key needed)
    const google = await tryGoogle(text, source, target)
    if (google) return NextResponse.json({ translatedText: google })

    // 2. Try MyMemory as fallback
    const mymemory = await tryMyMemory(text, source, target)
    if (mymemory) return NextResponse.json({ translatedText: mymemory })

    // 3. All providers failed — return original text
    console.error("[translate] All providers failed")
    return NextResponse.json({
      translatedText: text,
      error: "All translation providers unavailable",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed"
    console.error("[translate] route error:", message)
    return NextResponse.json({ translatedText: text, error: message })
  }
}
