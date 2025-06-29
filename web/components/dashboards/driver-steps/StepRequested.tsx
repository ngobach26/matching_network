"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, User, AlertCircle, Loader2, Clock, Route } from "lucide-react"
import type { Ride, RideDetail } from "@/lib/api-client"
import Map from "@/components/map"
import { useState, useEffect } from "react"

interface StepRequestedProps {
  ride: RideDetail | null
  currentLocation: { lat: number; lng: number }
  isLoadingRequest: boolean
  isProcessingDecision: boolean
  decisionError: string | null
  onAccept: () => void
  onDecline: () => void
}

export function StepRequested({
  ride,
  isLoadingRequest,
  isProcessingDecision,
  decisionError,
  currentLocation,
  onAccept,
  onDecline,
}: StepRequestedProps) {
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

  // Format currency function
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Simulate getting route info
  useEffect(() => {
    if (ride?.ride.estimated_distance) {
      const estimatedDistance = `${ride.ride.estimated_distance.toFixed(1)} km`
      const estimatedDuration = `${Math.round(ride.ride.estimated_distance * 3)} min`

      setRouteInfo({
        distance: estimatedDistance,
        duration: estimatedDuration,
      })
    }
  }, [ride])

  if (isLoadingRequest) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
            <p className="text-center text-muted-foreground">Loading ride request details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-500">
      <CardHeader>
        <CardTitle>New Ride Request</CardTitle>
        <CardDescription>You have a new ride request</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {decisionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{decisionError}</AlertDescription>
          </Alert>
        )}

        {ride && (
          <>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">{ride.rider?.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Badge className="bg-orange-500">{ride.ride.status}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Map with pickup and dropoff locations */}
            <div className="w-full h-[200px] rounded-md overflow-hidden">
              <Map
                center={[ride.ride.pickup_location.coordinate.lng, ride.ride.pickup_location.coordinate.lat]}
                zoom={13}
                markers={[
                  {
                    position: [currentLocation.lng, currentLocation.lat],
                    type: "current",
                  },
                  {
                    position: [ride.ride.pickup_location.coordinate.lng, ride.ride.pickup_location.coordinate.lat],
                    type: "start",
                  },
                  {
                    position: [ride.ride.dropoff_location.coordinate.lng, ride.ride.dropoff_location.coordinate.lat],
                    type: "des",
                  },
                ]}
                route={{
                  origin: [ride.ride.pickup_location.coordinate.lng, ride.ride.pickup_location.coordinate.lat],
                  destination: [ride.ride.dropoff_location.coordinate.lng, ride.ride.dropoff_location.coordinate.lat],
                }}
              />
            </div>

            {routeInfo && (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <div className="flex items-center">
                  <Route className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm font-medium">Distance: {routeInfo.distance}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm font-medium">ETA: {routeInfo.duration}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Pickup</span>
                  <p className="font-medium">
                    {ride.ride.pickup_location.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Destination</span>
                  <p className="font-medium">
                    {ride.ride.dropoff_location.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Earning</span>
              <span className="font-medium">{formatCurrency(ride.ride.fare.driver_earnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{ride.ride.estimated_distance?.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested at</span>
              <span className="font-medium">{new Date(ride.ride.created_at).toLocaleTimeString()}</span>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onDecline}
          disabled={isProcessingDecision}
        >
          {isProcessingDecision ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Decline"
          )}
        </Button>
        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={onAccept} disabled={isProcessingDecision}>
          {isProcessingDecision ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Accept"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
