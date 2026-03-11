"use client"

import { SidebarProvider, useSidebar } from "./SidebarContext"
import DashboardSidebar from "./DashboardSidebar"

function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar()

  return (
    <div className="dark flex h-screen overflow-hidden bg-[#070e0e] text-gray-100">
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto min-w-0 scrollbar-none">
        {children}
      </main>
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
