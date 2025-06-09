"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, User, AlertCircle, Loader2, MessageCircle } from "lucide-react"
import type { Ride } from "@/lib/api-client"
import Map from "@/components/map"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ChatBox from "@/components/message/chat-box"

interface StepPickupProps {
  ride: Ride | null
  currentLocation: { lat: number; lng: number }
  rideStatus: string | null
  rideStatusError: string | null
  isUpdatingRideStatus: boolean
  onArriveAtPickup: () => void
  onPickupRider: () => void
  onCancelRide: () => void

  // Chat props:
  messages: any[]
  onSendMessage: (msg: string) => void
  myAvatar: string
  theirAvatar: string
  theirName: string
}

export function StepPickup({
  ride,
  rideStatus,
  rideStatusError,
  isUpdatingRideStatus,
  currentLocation,
  onArriveAtPickup,
  onPickupRider,
  onCancelRide,
  messages,
  onSendMessage,
  myAvatar,
  theirAvatar,
  theirName,
}: StepPickupProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left column: Map */}
      <div className="w-full md:w-3/5">
        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border">
          {ride ? (
            <Map
              center={[currentLocation.lng, currentLocation.lat]}
              zoom={13}
              markers={[
                {
                  position: [currentLocation.lng, currentLocation.lat],
                  type: "driver",
                },
                {
                  position: [
                    ride.pickup_location.coordinate.lng,
                    ride.pickup_location.coordinate.lat,
                  ],
                  type: "pickup",
                },
              ]}
              route={{
                origin: [currentLocation.lng, currentLocation.lat],
                destination: [
                  ride.pickup_location.coordinate.lng,
                  ride.pickup_location.coordinate.lat,
                ],
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Chưa có chuyến đi được chọn
            </div>
          )}
        </div>
      </div>


      {/* Right column: Info + actions */}
      <div className="w-full md:w-2/5 space-y-4">
        {rideStatusError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{rideStatusError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <span className="text-sm text-muted-foreground">Pickup</span>
            <p className="font-medium">
              {ride
                ? ride.pickup_location.name
                : "Loading location..."}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ETA to pickup</span>
          <span className="font-medium">3 minutes</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src="https://randomuser.me/api/portraits/women/68.jpg"
              alt="Rider Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{`Rider #${ride ? ride.rider_id : 'Unknown'}`}</h3>
            <div className="text-sm text-muted-foreground">Waiting at pickup location</div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2 border-orange-500 text-orange-600"
          type="button"
          onClick={() => setChatOpen(true)}
        >
          <MessageCircle className="w-5 h-5" />
          Chat with Rider
        </Button>

        {rideStatus === "accepted" && (
          <Button
            className="w-full bg-purple-500 hover:bg-purple-600"
            onClick={onArriveAtPickup}
            disabled={isUpdatingRideStatus}
          >
            {isUpdatingRideStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "I've Arrived at Pickup"
            )}
          </Button>
        )}

        {rideStatus === "arrived" && (
          <Button
            className="w-full bg-indigo-500 hover:bg-indigo-600"
            onClick={onPickupRider}
            disabled={isUpdatingRideStatus}
          >
            {isUpdatingRideStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Confirm Rider Pickup"
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

      {/* Modal hiển thị ChatBox */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-2xl w-full h-[98vh] p-0 flex flex-col overflow-auto">
          <div className="h-full flex flex-col bg-white">
            <ChatBox
              messages={messages}
              myAvatar={myAvatar}
              theirAvatar={theirAvatar}
              theirName={theirName}
              onSendMessage={onSendMessage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
