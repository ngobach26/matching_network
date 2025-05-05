"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Clock, Star, User } from "lucide-react"

export function RiderDashboard() {
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [searching, setSearching] = useState(false)
  const [driverFound, setDriverFound] = useState(false)
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "pickup" | "transit" | "completed">("idle")

  const handleFindDriver = () => {
    if (!pickup || !destination) return

    setSearching(true)
    setRideStatus("searching")

    // Simulate API call to find a driver
    setTimeout(() => {
      setSearching(false)
      setDriverFound(true)
      setRideStatus("pickup")
    }, 2000)
  }

  const handleStartTrip = () => {
    setRideStatus("transit")

    // Simulate trip completion after some time
    setTimeout(() => {
      setRideStatus("completed")
    }, 5000)
  }

  const handleNewRide = () => {
    setRideStatus("idle")
    setDriverFound(false)
    setPickup("")
    setDestination("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request a Ride</CardTitle>
          <CardDescription>Enter your pickup location and destination</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <div className="flex gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                id="pickup"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup location"
                disabled={rideStatus !== "idle"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <div className="flex gap-2">
              <Navigation className="h-5 w-5 text-muted-foreground" />
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                disabled={rideStatus !== "idle"}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {rideStatus === "idle" && (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleFindDriver}
              disabled={!pickup || !destination}
            >
              Find Driver
            </Button>
          )}

          {rideStatus === "searching" && (
            <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled>
              Searching for Drivers...
            </Button>
          )}

          {rideStatus === "pickup" && (
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleStartTrip}>
              Start Trip
            </Button>
          )}

          {rideStatus === "transit" && (
            <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled>
              In Transit...
            </Button>
          )}

          {rideStatus === "completed" && (
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleNewRide}>
              Request New Ride
            </Button>
          )}
        </CardFooter>
      </Card>

      {driverFound && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
            <CardDescription>Your driver is on the way</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Michael Johnson</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>4.8 (120 rides)</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <span className="text-sm font-medium">Toyota Camry (White)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">License Plate</span>
                <span className="text-sm font-medium">ABC 123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ETA</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-orange-500" />
                  <span className="text-sm font-medium">3 minutes</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Contact Driver
            </Button>
          </CardFooter>
        </Card>
      )}

      {rideStatus === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Ride Completed</CardTitle>
            <CardDescription>Thank you for riding with us!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trip Fare</span>
                <span className="font-medium">$15.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">3.2 miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">12 minutes</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Rate your driver</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 text-gray-300 hover:text-yellow-500 cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
