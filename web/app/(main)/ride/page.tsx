"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { RiderDashboard } from "@/components/dashboards/rider-dashboard"
import Map from "@/components/map"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function RidePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
      <div className="p-4 md:p-8">
        <RiderDashboard />
      </div>
  )
}
