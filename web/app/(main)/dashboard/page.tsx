"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, ArrowRight, BarChart, User, Clock, MapPin, DollarSign } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"

export default function DashboardPage() {
  const { isAuthenticated, isLoading, userProfile } = useAuth()
  const router = useRouter()
  const { isRegistered: isDriverRegistered } = useAppSelector((state) => state.driver)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {userProfile?.name || "User"}!</h1>
        <p className="text-gray-500 mt-1">Manage your rides and driving activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Car className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle>Ride</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Request rides to your destination</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-0">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-1.5 rounded-full">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Select destination</h3>
                  <p className="text-xs text-gray-500">Choose where you want to go</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Get matched</h3>
                  <p className="text-xs text-gray-500">Connect with nearby drivers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Pay securely</h3>
                  <p className="text-xs text-gray-500">Easy and secure payments</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              {"Ready to ride"}
            </Badge>
            <Button onClick={() => router.push("/ride")} className="bg-orange-500 hover:bg-orange-600">
              <span>Request Ride</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle>Drive</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Accept ride requests and earn</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-0">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Accept requests</h3>
                  <p className="text-xs text-gray-500">Receive ride requests from riders</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-cyan-100 p-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Flexible schedule</h3>
                  <p className="text-xs text-gray-500">Drive whenever you want</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-1.5 rounded-full">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Earn money</h3>
                  <p className="text-xs text-gray-500">Get paid for every completed ride</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
            <Badge
              variant="outline"
              className={
                isDriverRegistered
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }
            >
              {isDriverRegistered ? "Ready to drive" : "Setup required"}
            </Badge>
            <Button onClick={() => router.push("/drive")} className="bg-orange-500 hover:bg-orange-600">
              <span>Start Driving</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recent Rides</h3>
              <Button variant="link" className="text-orange-500 p-0 h-auto" onClick={() => router.push("/ride")}>
                View all
              </Button>
            </div>
            <p className="text-sm text-gray-500">No recent rides found</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Driving Stats</h3>
              <Button variant="link" className="text-orange-500 p-0 h-auto" onClick={() => router.push("/drive")}>
                View all
              </Button>
            </div>
            {isDriverRegistered ? (
              <p className="text-sm text-gray-500">No stats available yet</p>
            ) : (
              <p className="text-sm text-gray-500">Complete your driver profile to view stats</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Account Settings</h3>
              <Button variant="link" className="text-orange-500 p-0 h-auto" onClick={() => router.push("/settings")}>
                Edit
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <p>{userProfile?.name || "User"}</p>
              <p>{userProfile?.email || ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
