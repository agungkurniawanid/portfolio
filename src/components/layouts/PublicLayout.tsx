"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/layouts/Header"
import GuestbookBanner from "@/components/GuestbookBanner"
import WelcomePopup from "@/components/WelcomePopup"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const isAuthRoute = pathname?.startsWith("/xhub")

  if (isDashboard || isAuthRoute) return <>{children}</>

  return (
    <>
      <GuestbookBanner />
      <Header />
      <WelcomePopup />
      {children}
    </>
  )
}
