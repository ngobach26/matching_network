"use client"

// components/steps/StepTransit.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Ride } from "@/lib/api-client"
import { Loader2, Clock, Route, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  handlePayWithVNPAY: () => void
  isPaying: boolean
  isPayed: boolean
  ride: Ride | null
  onComplete: () => void
}

export function StepTransit({ ride, onComplete, handlePayWithVNPAY, isPaying,isPayed }: Props) {
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

  // Simulate getting route info from the map component
  useEffect(() => {
    if (ride) {
      const estimatedDistance = ride.estimated_distance
        ? `${ride.estimated_distance.toFixed(1)} km`
        : "Calculating..."

      const estimatedDuration = ride.estimated_duration ? `${ride.estimated_duration} min` : "Calculating..."

      setRouteInfo({
        distance: estimatedDistance,
        duration: estimatedDuration,
      })
    }
  }, [ride])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>In Transit</CardTitle>
            <CardDescription>Your ride is in progress</CardDescription>
          </div>
          <Badge className="bg-orange-500">In Transit</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
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

        <div className="text-center text-sm text-muted-foreground">
          {ride?.estimated_duration
            ? `Estimated duration: ${ride.estimated_duration.toFixed(1)} minutes`
            : "Enjoy your ride!"}
        </div>
      </CardContent>
      {/* VNPAY payment button */}
      <div className="mt-4">
        <Button
          onClick={handlePayWithVNPAY}
          disabled={isPayed}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {isPayed ? "Payment completed" : "Pay with VNPAY"}
        </Button>
      </div>
    </Card>
  )
}
