"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DriverForm } from "@/components/role-forms/driver-form"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchDriverProfile } from "@/lib/redux/slices/driverSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Info, AlertTriangle, Ban } from "lucide-react"
import { DriverDashboard } from "@/components/dashboards/driver-dashboard"

export default function DrivePage() {
  const { isAuthenticated, isLoading, userProfile } = useAuth()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { driverProfile, status, error } = useAppSelector((state) => state.driver)

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

  // Chưa có driver profile -> hiển thị form đăng ký
  if (!driverProfile) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Become a Driver</CardTitle>
              <CardDescription>Complete your driver profile to start accepting rides</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm mb-4">{error}</div>}
              <DriverForm />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Nếu status là pending -> chờ admin duyệt
  if (driverProfile.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Info className="w-5 h-5" /> Waiting for Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Your driver profile has been submitted.<br />
              Please wait while an admin reviews your application.
            </p>
            <p className="text-muted-foreground text-sm">
              You will receive a notification once your profile is reviewed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nếu status là info_required
  if (driverProfile.status === "info_required") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" /> Additional Information Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Your driver application requires additional information or documents.<br />
              Please contact the admin or check your email for further instructions.
            </p>
            <p className="text-muted-foreground text-sm">
              After providing the requested information, your profile will be re-evaluated.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nếu status là inactive hoặc rejected
  if (driverProfile.status === "inactive" || driverProfile.status === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" /> Profile Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverProfile.status === "inactive" ? (
              <p>
                Your driver account is currently <span className="font-semibold text-orange-600">inactive</span>.<br />
                Please contact admin for more details or support.
              </p>
            ) : (
              <p>
                Your driver application has been <span className="font-semibold text-red-600">rejected</span>.<br />
                Please contact admin if you have any questions.
              </p>
            )}
            <p className="text-muted-foreground text-sm mt-2">
              Email: <a href="mailto:support@yourapp.com" className="underline">support@yourapp.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nếu status là active
  if (driverProfile.status === "active") {
    return <DriverDashboard />
  }

  // Fallback: Unexpected status
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unknown driver status. Please contact admin.</p>
        </CardContent>
      </Card>
    </div>
  )
}
