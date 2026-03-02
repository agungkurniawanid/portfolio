"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

// Dark background matches --base-background: 193, 20%, 9% in globals.css
const THEME_COLORS = {
  dark: "#111c20",
  light: "#ffffff",
}

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const color =
      resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "theme-color"
      document.head.appendChild(meta)
    }
    meta.content = color
  }, [resolvedTheme])

  return null
}
