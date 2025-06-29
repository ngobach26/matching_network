"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, userProfile } = useAuth()
  const router = useRouter()

  // Xác định trạng thái loading:
  const loading = isLoading || !userProfile

  useEffect(() => {
    if (!loading) {
      // Khi đã xác thực xong
      if (!isAuthenticated || !userProfile.roles.includes("admin")) {
        // Không có quyền admin -> redirect NGAY
        router.replace("/dashboard")
      }
    }
    // eslint-disable-next-line
  }, [loading, isAuthenticated, userProfile, router])

  // CHỈ render loading cho tới khi xác thực xong
  if (loading || !isAuthenticated || !userProfile.roles.includes("admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Chỉ render layout nếu ĐÃ xác thực xong, profile có role admin
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
