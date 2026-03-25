import type { Metadata } from "next"
import DashboardShell from "@/components/dashboard/DashboardShell"

export const metadata: Metadata = {
  title: "Dev Dashboard — Blog Manager",
  description: "Internal developer dashboard",
  robots: "noindex, nofollow",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
