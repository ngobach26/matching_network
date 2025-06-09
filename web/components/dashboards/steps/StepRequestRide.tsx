"use client"

// components/steps/StepRequestRide.tsx

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapIcon, MapPin, Navigation, Loader2, RefreshCw } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Fare, FareEstimateResponse, RideType } from "@/lib/api-client"

interface Props {
  pickup: string
  destination: string
  pickupSuggestions: any[]
  destinationSuggestions: any[]
  onPickupChange: (value: string) => void
  onDestinationChange: (value: string) => void
  onSelectPickupSuggestion: (item: any) => void
  onSelectDestinationSuggestion: (item: any) => void
  onOpenPickupMap: () => void
  onOpenDropoffMap: () => void
  fareEstimate: FareEstimateResponse | null
  isFetchingEstimate: boolean
  selectedRideType: string
  onRideTypeChange: (value: RideType) => void
  onSubmit: () => void
  rideStatus: string
  isConnected: boolean
  matchError: string | null
  routeInfo: { distance: number; duration: number }
}

export function StepRequestRide({
  pickup,
  destination,
  pickupSuggestions,
  destinationSuggestions,
  onPickupChange,
  onDestinationChange,
  onSelectPickupSuggestion,
  onSelectDestinationSuggestion,
  onOpenPickupMap,
  onOpenDropoffMap,
  fareEstimate,
  isFetchingEstimate,
  selectedRideType,
  onRideTypeChange,
  onSubmit,
  rideStatus,
  routeInfo,
  matchError,
}: Props) {
  return (
    <div className="relative">
      {/* Loading Overlay */}
      {rideStatus === "searching" && (
        <div className="absolute inset-0 bg-white/70 z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
          <p className="text-sm text-muted-foreground">Looking for a driver nearby...</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request a Ride</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {matchError && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm mb-4">{matchError}</div>}

          <div className="space-y-2 relative">
            <Label htmlFor="pickup">Pickup Location</Label>
            <div className="flex gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div className="relative flex-1">
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => onPickupChange(e.target.value)}
                  placeholder="Enter pickup location"
                  disabled={rideStatus !== "idle" && rideStatus !== "failed"}
                  className="w-full"
                />
                {pickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md mt-1 shadow-sm max-h-60 overflow-y-auto">
                    {pickupSuggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => onSelectPickupSuggestion(item)}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenPickupMap}
                disabled={rideStatus !== "idle" && rideStatus !== "failed"}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="destination">Destination</Label>
            <div className="flex gap-2">
              <Navigation className="h-5 w-5 text-muted-foreground" />
              <div className="relative flex-1">
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => onDestinationChange(e.target.value)}
                  placeholder="Enter destination"
                  disabled={rideStatus !== "idle" && rideStatus !== "failed"}
                  className="w-full"
                />
                {destinationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md mt-1 shadow-sm max-h-60 overflow-y-auto">
                    {destinationSuggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => onSelectDestinationSuggestion(item)}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenDropoffMap}
                disabled={rideStatus !== "idle" && rideStatus !== "failed"}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {isFetchingEstimate && (
            <div className="w-full flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500 mr-2" />
              <span>Calculating fare...</span>
            </div>
          )}

          {fareEstimate && !isFetchingEstimate && pickup && destination && (
            <div className="w-full space-y-4">
              <h3 className="font-medium">Select Ride Type</h3>
              <RadioGroup
                value={selectedRideType}
                onValueChange={onRideTypeChange}
                className="space-y-3"
              >
                {(Object.entries(fareEstimate) as [RideType, Fare][]).map(([type, value]) => (
                  <div
                    key={type}
                    className={`flex items-center justify-between rounded-lg border p-4 ${selectedRideType === type ? "border-orange-500 bg-orange-50" : ""
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={type} id={`${type}-option`} />
                      <Label htmlFor={`${type}-option`} className="font-medium capitalize">
                        {type}
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {value.total_fare.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: value.currency ?? "VND",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {type === "bike" ? "Fastest" : type === "car" ? "Comfortable" : "Luxury"}
                      </div>
                    </div>
                  </div>
                ))}

              </RadioGroup>

              <div className="flex justify-between text-sm">
                <span>Estimated distance:</span>
                <span className="font-medium">{routeInfo.distance.toFixed(1)} km</span>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={onSubmit}
            disabled={rideStatus !== "idle"}
          >
            {rideStatus === "failed" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            ) : (
              "Find Driver"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
