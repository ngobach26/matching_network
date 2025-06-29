"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, User, AlertCircle, Loader2, MessageCircle } from "lucide-react"
import type { Ride, RideDetail } from "@/lib/api-client"
import Map from "@/components/map"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ChatBox from "@/components/message/chat-box"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface StepPickupProps {
  ride: RideDetail | null
  currentLocation: { lat: number; lng: number }
  rideStatus: string | null
  rideStatusError: string | null
  isUpdatingRideStatus: boolean
  isNewMessage: boolean
  setIsNewMessage: () => void
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
  isNewMessage,
  setIsNewMessage
}: StepPickupProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isNewMessage) {
      const audio = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1150-glass.mp3")
      audio.play()
      toast({
        title: "New message",
        description: "You received a new messge.",
        variant: "default"
      })
    }
  }, [isNewMessage])


  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 min-h-screen">
        {/* MAP COLUMN */}
        <div className="w-full md:w-3/5">
          {/* Map height: 300px mobile, full height desktop */}
          <div className="relative w-full h-[300px] md:h-full rounded-lg overflow-hidden border">
            {ride ? (
              <Map
                center={[currentLocation.lng, currentLocation.lat]}
                zoom={13}
                markers={[
                  {
                    position: [currentLocation.lng, currentLocation.lat],
                    type: "current",
                  },
                  {
                    position: [
                      ride.ride.pickup_location.coordinate.lng,
                      ride.ride.pickup_location.coordinate.lat,
                    ],
                    type: "start",
                  },
                ]}
                route={{
                  origin: [currentLocation.lng, currentLocation.lat],
                  destination: [
                    ride.ride.pickup_location.coordinate.lng,
                    ride.ride.pickup_location.coordinate.lat,
                  ],
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No trip selected
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
                  ? ride.ride.pickup_location.name
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
              <h3 className="font-medium">{`${ride ? ride?.rider?.name : 'Unknown'}`}</h3>
              <div className="text-sm text-muted-foreground">{ride ? ride?.rider?.phone_number : 'Unknown phone number'}</div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-orange-500 text-orange-600 relative"
            type="button"
            onClick={() => {
              setChatOpen(true);
              setIsNewMessage();
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Rider
            {isNewMessage && (
              <span className="absolute right-3 top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
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
        <Dialog open={chatOpen} onOpenChange={(open) => {
          setChatOpen(open)
          // Khi chat bị đóng (open == false), reset isNewMessage
          if (!open) setIsNewMessage()
        }}>
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
    </>
  )
}
