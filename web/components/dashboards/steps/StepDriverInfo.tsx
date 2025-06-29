"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Clock, User, Car, CreditCard, MessageCircle } from "lucide-react"
import type { Ride, Driver, Vehicle, RideDetail } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { paymentAPI } from "@/lib/api-client"
import UserProfile from "@/components/users/user-profile"
import ChatBox from "@/components/message/chat-box"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Props {
  handlePayWithVNPAY: () => void
  isPaying: boolean
  isPayed: boolean
  ride: RideDetail
  driver: Driver
  isNewMessage: boolean
  setIsNewMessage: () => void
  onStartTrip: () => void
  messages: any[]   // hoặc ChatMessage[]
  onSendMessage: (msg: string) => void
  myAvatar: string
  theirAvatar: string
  theirName: string
}

export function StepDriverInfo({
  ride,
  driver,
  onStartTrip,
  handlePayWithVNPAY,
  isPaying,
  isPayed,
  messages,
  onSendMessage,
  myAvatar,
  theirAvatar,
  theirName,
  setIsNewMessage,
  isNewMessage
}: Props) {
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

  // State quản lý modal profile và modal chat
  const [profileOpen, setProfileOpen] = useState(false)
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Driver Information</CardTitle>
              <CardDescription>Your driver is on the way</CardDescription>
            </div>
            <Badge className={statusColor[ride.ride.status as keyof typeof statusColor]}>
              {statusLabel[ride.ride.status as keyof typeof statusLabel]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Avatar - click để mở profile */}
            <div
              className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-orange-400 transition overflow-hidden"
              onClick={() => setProfileOpen(true)}
              title="Xem thông tin tài xế"
            >
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Driver Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3
                className="font-medium cursor-pointer hover:text-orange-500"
                onClick={() => setProfileOpen(true)}
                title="Xem thông tin tài xế"
              >
                {ride?.driver
                  ? <>{ride.driver.name}</>
                  : <>Unknown</>
                }
              </h3>

              {/* Hiển thị số điện thoại nếu có */}
              {ride?.driver?.phone_number && (
                <div className="text-sm text-muted-foreground">
                  📞 {ride.driver.phone_number}
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>
                  {driver.rating_average ? driver.rating_average: 4} {driver.total_rides ? driver.total_rides : 0} rides
                </span>
              </div>
            </div>

          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            {/* <div className="flex justify-between">
              <span className="text-muted-foreground">Ride ID</span>
              <span className="font-medium">{ride._id}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1 text-orange-500" />
                <span className="font-medium">
                  {driver.vehicle.color} {driver.vehicle.model} ({driver.vehicle.plate_number})
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={onStartTrip}
            disabled={ride.ride.status !== "arrived"}
          >
            {ride.ride.status === "arrived" ? "Confirm Pickup" : "Waiting for Driver to Arrive"}
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-orange-500 text-orange-600 relative"
            type="button"
            onClick={() => {
              setChatOpen(true)
              setIsNewMessage()
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Driver
            {isNewMessage && (
              <span className="absolute right-3 top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Modal hiển thị thông tin UserProfile */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-3xl w-full h-[98vh] p-0 overflow-auto">
          <div className="p-0">
            <UserProfile userId={driver.user_id} />
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  )
}