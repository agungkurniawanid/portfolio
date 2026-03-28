"use client"

import { SidebarProvider, useSidebar } from "./SidebarContext"
import DashboardSidebar from "./DashboardSidebar"
import DashboardNotificationBell from "./DashboardNotificationBell"
import { Toaster } from "sonner"

function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar()

  return (
    <div className="dark flex h-screen overflow-hidden bg-[#070e0e] text-gray-100">
      <Toaster richColors style={{ zIndex: 999 }} />
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Global Top Bar with Notification Bell ── */}
        <div className="shrink-0 flex items-center justify-end px-4 md:px-6 py-2.5 border-b border-white/[0.05] bg-[#070e0e]/80 backdrop-blur-sm relative z-20">
          <DashboardNotificationBell />
        </div>

        <main className="flex-1 overflow-y-auto min-w-0 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  )
}
