"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Car, Clock, DollarSign, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRoleContext } from "@/context/role-context"
import Map from "@/components/map"
import { useEffect, useState } from "react"

interface StepIdleProps {
  isAvailable: boolean
  onToggleAvailability: () => void
  isUpdating: boolean
  connectionStatus: "disconnected" | "connecting" | "connected"
  connectionError: string | null
  locationError: string | null
  currentLocation: { lat: number; lng: number } | null
  lastLocationUpdate: Date | null
  waitingForRequests: boolean
  todaySummary: {
    earnings: string
    rides: number
    onlineHours: string
  }
}

export function StepIdle({
  isAvailable,
  onToggleAvailability,
  isUpdating,
  connectionStatus,
  connectionError,
  locationError,
  currentLocation,
  lastLocationUpdate,
  waitingForRequests,
  todaySummary,
}: StepIdleProps) {
  const { getRoleData } = useRoleContext()
  const driverData = getRoleData("driver")

  // Default map center (fallback if user location is not available)
  const defaultCenter = [105.854444, 21.028511] // Ho Chi Minh City coordinates

  // State to track if we've attempted to get user location
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false)

  // Try to get user location on component mount, regardless of availability status
  useEffect(() => {
    if (!currentLocation && !hasAttemptedLocation) {
      setHasAttemptedLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This will be handled by the parent component
        },
        (error) => {
          console.error("Error getting initial location:", error)
        },
        { timeout: 10000 },
      )
    }
  }, [currentLocation, hasAttemptedLocation])

  return (
    <div className="space-y-4">
      {/* Map Container with Availability Toggle */}
      <div className="relative">
        {/* Map as the most prominent element - always visible */}
        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
          <Map
            center={currentLocation ? [currentLocation.lng, currentLocation.lat] : [defaultCenter[1], defaultCenter[0]]}
            zoom={14}
            markers={
              currentLocation
                ? [
                    {
                      position: [currentLocation.lng, currentLocation.lat],
                      type: "driver",
                    },
                  ]
                : []
            }
          />
        </div>

        {/* Availability toggle positioned at the top right of the map */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md flex items-center space-x-2 z-10">
          <Switch id="available" checked={isAvailable} onCheckedChange={onToggleAvailability} disabled={isUpdating} />
          <Label htmlFor="available" className="font-medium">
            {isAvailable ? "Available" : "Offline"}
          </Label>
          <Badge className={isAvailable ? "bg-green-500 ml-2" : "bg-gray-500 ml-2"}>
            {isAvailable ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Location Error Alert */}
      {locationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Vehicle Info and Today's Summary in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Information - Compact */}
        {driverData && driverData.vehicle && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Car className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-medium">Your Vehicle</div>
                  <div className="text-sm text-muted-foreground">
                    {driverData.vehicle.model} • {driverData.vehicle.plate_number}
                    {driverData.vehicle.color && ` • ${driverData.vehicle.color}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-xl font-bold">{todaySummary.earnings}</span>
                <span className="text-xs text-muted-foreground">Earnings</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Car className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-xl font-bold">{todaySummary.rides}</span>
                <span className="text-xs text-muted-foreground">Rides</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-xl font-bold">{todaySummary.onlineHours}</span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
