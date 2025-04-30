"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, User, Car, DollarSign } from "lucide-react"

export function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [hasRideRequest, setHasRideRequest] = useState(false)
  const [rideStatus, setRideStatus] = useState<"idle" | "requested" | "pickup" | "transit" | "completed">("idle")

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable)

    if (!isAvailable) {
      // Simulate receiving a ride request after some time
      setTimeout(() => {
        setHasRideRequest(true)
        setRideStatus("requested")
      }, 3000)
    } else {
      setHasRideRequest(false)
      setRideStatus("idle")
    }
  }

  const handleAcceptRide = () => {
    setRideStatus("pickup")
  }

  const handleDeclineRide = () => {
    setHasRideRequest(false)
    setRideStatus("idle")
  }

  const handlePickupRider = () => {
    setRideStatus("transit")
  }

  const handleCompleteRide = () => {
    setRideStatus("completed")

    // Reset after some time
    setTimeout(() => {
      setHasRideRequest(false)
      setRideStatus("idle")
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Driver Dashboard</CardTitle>
              <CardDescription>Manage your availability and rides</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="available" checked={isAvailable} onCheckedChange={handleToggleAvailability} />
              <Label htmlFor="available">Available</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge className={isAvailable ? "bg-green-500" : "bg-gray-500"}>
                {isAvailable ? "Online" : "Offline"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Today's Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <DollarSign className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-xl font-bold">$45</span>
                    <span className="text-xs text-muted-foreground">Earnings</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Car className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-xl font-bold">3</span>
                    <span className="text-xs text-muted-foreground">Rides</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-xl font-bold">1.5h</span>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasRideRequest && rideStatus === "requested" && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle>New Ride Request</CardTitle>
            <CardDescription>You have a new ride request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Sarah Thompson</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>4.9 rating</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Pickup</span>
                  <p className="font-medium">123 Main St, Downtown</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Destination</span>
                  <p className="font-medium">456 Park Ave, Uptown</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated fare</span>
              <span className="font-medium">$12.75</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">2.8 miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated time</span>
              <span className="font-medium">10 minutes</span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeclineRide}
            >
              Decline
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleAcceptRide}>
              Accept
            </Button>
          </CardFooter>
        </Card>
      )}

      {rideStatus === "pickup" && (
        <Card>
          <CardHeader>
            <CardTitle>Pickup Rider</CardTitle>
            <CardDescription>Navigate to the pickup location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <span className="text-sm text-muted-foreground">Pickup</span>
                <p className="font-medium">123 Main St, Downtown</p>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">ETA to pickup</span>
              <span className="font-medium">3 minutes</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Sarah Thompson</h3>
                <div className="text-sm text-muted-foreground">
                  <span>Waiting at pickup location</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handlePickupRider}>
              Confirm Pickup
            </Button>
          </CardFooter>
        </Card>
      )}

      {rideStatus === "transit" && (
        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
            <CardDescription>Navigate to the destination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Navigation className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <span className="text-sm text-muted-foreground">Destination</span>
                <p className="font-medium">456 Park Ave, Uptown</p>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">ETA to destination</span>
              <span className="font-medium">7 minutes</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance remaining</span>
              <span className="font-medium">1.9 miles</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCompleteRide}>
              Complete Ride
            </Button>
          </CardFooter>
        </Card>
      )}

      {rideStatus === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Ride Completed</CardTitle>
            <CardDescription>Ride has been successfully completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fare earned</span>
              <span className="font-medium">$12.75</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trip duration</span>
              <span className="font-medium">15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">2.8 miles</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
