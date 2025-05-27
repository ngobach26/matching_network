"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Clock, User, Car, CreditCard } from "lucide-react"
import type { Ride, Driver, Vehicle } from "@/lib/api-client"
import { useState } from "react"
import { paymentAPI } from "@/lib/api-client"

interface Props {
  handlePayWithVNPAY: () => void
  isPaying: boolean
  ride: Ride
  driver: Driver
  onStartTrip: () => void
}

export function StepDriverInfo({ ride, driver, onStartTrip, handlePayWithVNPAY, isPaying }: Props) {
  const statusLabel = {
    accepted: "Driver Accepted",
    arrived: "Driver Arrived",
    picked_up: "Picked Up",
    ongoing: "In Transit",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  const statusColor = {
    accepted: "bg-blue-500",
    arrived: "bg-purple-500",
    picked_up: "bg-indigo-500",
    ongoing: "bg-orange-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Driver Information</CardTitle>
            <CardDescription>Your driver is on the way</CardDescription>
          </div>
          <Badge className={statusColor[ride.status as keyof typeof statusColor]}>
            {statusLabel[ride.status as keyof typeof statusLabel]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium">Driver #{ride.driver_id}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>
                {driver.rating_average.toFixed(1)} ({Math.floor(Math.random() * 100) + 20} rides)
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ride ID</span>
            <span className="font-medium">{ride._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vehicle</span>
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-1 text-orange-500" />
              <span className="font-medium">
                {driver.vehicle.color} {driver.vehicle.model} ({driver.vehicle.plate_number})
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">
              {ride.estimated_distance ? `${ride.estimated_distance.toFixed(1)} km` : "Calculating..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ETA</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-orange-500" />
              <span className="font-medium">
                {ride.estimated_duration ? `${ride.estimated_duration.toFixed(1)} min` : "3 minutes"}
              </span>
            </div>
          </div>
        </div>

        {ride.status === "arrived" && (
          <div className="bg-purple-50 p-3 rounded-md text-sm text-purple-700">
            <strong>Your driver has arrived at the pickup location!</strong>
            <p>Please meet your driver at the pickup point.</p>
          </div>
        )}

        {(ride.status === "picked_up" || ride.status === "ongoing") && (
          <div className="bg-indigo-50 p-3 rounded-md text-sm text-indigo-700">
            <strong>You're on your way to your destination!</strong>
            <p>Enjoy your ride.</p>
          </div>
        )}

        {/* VNPAY payment button */}
        <div className="mt-4">
          <Button
            onClick={handlePayWithVNPAY}
            disabled={isPaying}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {isPaying ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={onStartTrip}
          disabled={ride.status !== "arrived"}
        >
          {ride.status === "arrived" ? "Confirm Pickup" : "Waiting for Driver to Arrive"}
        </Button>
      </CardFooter>
    </Card>
  )
}
