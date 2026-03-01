/**
 * Generate a SHA-256 browser fingerprint from stable browser characteristics.
 * Used to uniquely identify a visitor without requiring login.
 */
export async function generateFingerprint(): Promise<string> {
  const data = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    navigator.platform ?? "",
    navigator.hardwareConcurrency?.toString() ?? "",
    // @ts-ignore — deviceMemory is not in all TS lib defs
    (navigator as any).deviceMemory?.toString() ?? "",
  ].join("|")

  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
