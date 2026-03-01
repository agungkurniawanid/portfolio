import { create } from "zustand"

export const BANNER_HEIGHT = 40 // px

interface BannerState {
  visible: boolean
  initialized: boolean
  init: () => void
  dismiss: () => void
}

export const useBannerStore = create<BannerState>((set) => ({
  visible: false,
  initialized: false,
  init: () => {
    if (typeof window === "undefined") return
    const dismissed = localStorage.getItem("guestbook_banner_dismissed") === "true"
    const submitted = localStorage.getItem("guestbook_submitted") === "true"
    set({ visible: !dismissed && !submitted, initialized: true })
  },
  dismiss: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestbook_banner_dismissed", "true")
    }
    set({ visible: false })
  },
}))
