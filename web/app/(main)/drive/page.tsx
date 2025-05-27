"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DriverForm } from "@/components/role-forms/driver-form"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchDriverProfile, createDriverProfile } from "@/lib/redux/slices/driverSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { DriverDashboard } from "@/components/dashboards/driver-dashboard"

export default function DrivePage() {
  const { isAuthenticated, isLoading, userProfile } = useAuth()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isRegistered, status, error } = useAppSelector((state) => state.driver)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch driver profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      dispatch(fetchDriverProfile())
    }
  }, [isAuthenticated, userProfile, dispatch])

  

  const handleDriverFormSubmit = async (formData: any) => {
    if (!userProfile?.id) return

    try {
      await dispatch(
        createDriverProfile({
          driverData: formData,
          vehicleData: formData.vehicle,
        }),
      ).unwrap()
    } catch (error) {
      console.error("Error creating driver profile:", error)
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading driver dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {isRegistered ? (
        <DriverDashboard />
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Become a Driver</CardTitle>
              <CardDescription>Complete your driver profile to start accepting rides</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm mb-4">{error}</div>}
              <DriverForm onSubmit={handleDriverFormSubmit} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
