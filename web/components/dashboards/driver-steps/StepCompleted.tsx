"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { Ride } from "@/lib/api-client"

interface StepCompletedProps {
  ride: Ride | null
  onNewRide: () => void
}

export function StepCompleted({ ride, onNewRide }: StepCompletedProps) {
  // Format currency function
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ride Completed</CardTitle>
            <CardDescription>Ride has been successfully completed</CardDescription>
          </div>
          <div className="text-green-500">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-md text-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-700">Ride Successfully Completed!</p>
          <p className="text-sm text-green-600">Thank you for providing a safe ride.</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fare earned</span>
            <span className="font-medium">
              {ride?.fare.driver_earnings ? formatCurrency(ride?.fare.driver_earnings) : formatCurrency(12750)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trip duration</span>
            <span className="font-medium">
              {ride?.estimated_duration ? `${ride.estimated_duration.toFixed(1)} minutes` : "15 minutes"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">
              {ride?.estimated_distance ? `${ride.estimated_distance.toFixed(1)} km` : "2.8 km"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onNewRide} className="w-full bg-orange-500 hover:bg-orange-600">
          Accept New Rides
        </Button>
      </CardFooter>
    </Card>
  )
}
