import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar spans full width */}
      <Topbar />

      {/* Content area with sidebar and main content */}
      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar is rendered inside the Sidebar component */}
        <div className="md:hidden">
          <Sidebar />
        </div>

        {/* Main content - full width on mobile */}
        <main className="flex-1 overflow-auto w-full">{children}</main>
      </div>
    </div>
  )
}
