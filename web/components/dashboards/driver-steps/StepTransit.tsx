"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation, AlertCircle, Loader2, Clock, Route } from "lucide-react"
import type { Ride, RideDetail } from "@/lib/api-client"
import Map from "@/components/map"
import { useState, useEffect } from "react"

interface StepTransitProps {
  ride: RideDetail | null
  currentLocation: { lat: number; lng: number }
  rideStatus: string | null
  rideStatusError: string | null
  isUpdatingRideStatus: boolean
  onStartRide: () => void
  onCompleteRide: () => void
  onCancelRide: () => void
}

export function StepTransit({
  ride,
  rideStatus,
  currentLocation,
  rideStatusError,
  isUpdatingRideStatus,
  onStartRide,
  onCompleteRide,
  onCancelRide,
}: StepTransitProps) {
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

  // Simulate getting route info from the map component
  useEffect(() => {
    if (ride) {
      const estimatedDistance = ride.ride.estimated_distance
        ? `${ride.ride.estimated_distance.toFixed(1)} km`
        : "Calculating..."

      const estimatedDuration = ride.ride.estimated_duration ? `${ride.ride.estimated_duration} min` : "Calculating..."

      setRouteInfo({
        distance: estimatedDistance,
        duration: estimatedDuration,
      })
    }
  }, [ride])

  // Get status badge color
  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "picked_up":
        return "bg-indigo-500"
      case "ongoing":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get human-readable status
  const getStatusText = (status: string | null) => {
    switch (status) {
      case "picked_up":
        return "Rider Picked Up"
      case "ongoing":
        return "Ride in Progress"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-screen">
      {/* MAP COLUMN - sửa lại giống StepPickup */}
      <div className="w-full md:w-3/5">
        <div className="relative w-full h-[300px] md:h-full rounded-lg overflow-hidden border">
          {ride && (
            <Map
              center={[currentLocation.lng, currentLocation.lat]}
              zoom={14}
              markers={[
                {
                  position: [currentLocation.lng, currentLocation.lat],
                  type: "current",
                },
                {
                  position: [ride.ride.dropoff_location.coordinate.lng, ride.ride.dropoff_location.coordinate.lat],
                  type: "des",
                },
              ]}
              route={{
                origin: [currentLocation.lng, currentLocation.lat],
                destination: [ride.ride.dropoff_location.coordinate.lng, ride.ride.dropoff_location.coordinate.lat],
              }}
            />
          )}
        </div>
      </div>

      {/* Right column: Info & actions */}
      <div className="w-full md:w-2/5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">In Transit</h2>
            <p className="text-sm text-muted-foreground">Navigate to the destination</p>
          </div>
          <Badge className={getStatusBadgeColor(rideStatus)}>{getStatusText(rideStatus)}</Badge>
        </div>

        {rideStatusError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{rideStatusError}</AlertDescription>
          </Alert>
        )}

        {routeInfo && (
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="flex items-center">
              <Route className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Distance: {routeInfo.distance}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">
                ETA: {parseFloat(routeInfo.duration).toFixed(1)} min
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <Navigation className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <span className="text-sm text-muted-foreground">Destination</span>
            <p className="font-medium">
              {ride
                ? ride.ride.dropoff_location.name
                : "Loading destination..."}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">ETA to destination</span>
          <span className="font-medium">
            {routeInfo ? `${parseFloat(routeInfo.duration).toFixed(1)} min` : "Calculating..."}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Distance remaining</span>
          <span className="font-medium">{routeInfo?.distance || "Calculating..."}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Fare</span>
          <span className="font-medium">
            {ride?.ride.fare.total_fare
              ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ride.ride.fare.total_fare)
              : "Calculating..."}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Driver Earning</span>
          <span className="font-medium">
            {ride?.ride.fare.driver_earnings
              ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ride.ride.fare.driver_earnings)
              : "Calculating..."}
          </span>
        </div>

        {rideStatus === "picked_up" && (
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={onStartRide}
            disabled={isUpdatingRideStatus}
          >
            {isUpdatingRideStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Start Ride"
            )}
          </Button>
        )}
        {rideStatus === "ongoing" && (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={onCompleteRide}
            disabled={isUpdatingRideStatus}
          >
            {isUpdatingRideStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Complete Ride"
            )}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onCancelRide}
          disabled={isUpdatingRideStatus}
        >
          Cancel Ride
        </Button>
      </div>
    </div>
  )
}
