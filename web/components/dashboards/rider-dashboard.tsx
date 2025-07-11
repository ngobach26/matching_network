"use client"

import { useState, useEffect, useCallback } from "react"
import type { Ride, Driver, Location, Coordinates, FareEstimateResponse, RideType, RideDetail } from "@/lib/api-client"
import { rideAPI, driverAPI, paymentAPI } from "@/lib/api-client"
import { useAppSelector } from "@/lib/redux/hooks"
import { useDebounce } from "@/hooks/use-debounce"
import { fetchAddressSuggestions } from "@/lib/mapbox"
import { useWebSocket } from "@/hooks/use-websocket"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MapSelector } from "@/components/map-selector"

import { StepRequestRide } from "@/components/dashboards/steps/StepRequestRide"
import { StepDriverInfo } from "@/components/dashboards/steps/StepDriverInfo"
import { StepTransit } from "@/components/dashboards/steps/StepTransit"
import { StepRateDriver } from "@/components/dashboards/steps/StepRateDriver"
import Map from "@/components/map"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function RiderDashboard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [pickup, setPickup] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [destination, setDestination] = useState("")
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null)
  const [isPayed, setIsPayed] = useState(false)
  const [messages, setMessages] = useState<any[]>([]);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([])
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number }>({ distance: 0, duration: 0 })

  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "pickup" | "transit" | "completed" | "failed">(
    "idle",
  )
  const [matchError, setMatchError] = useState<string | null>(null)

  const [fareEstimate, setFareEstimate] = useState<FareEstimateResponse | null>(null)
  const [isFetchingEstimate, setIsFetchingEstimate] = useState(false)
  const [selectedRideType, setSelectedRideType] = useState<RideType>("car")

  const [ride, setRide] = useState<RideDetail | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)

  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [ratingComment, setRatingComment] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const [isPickupMapDialogOpen, setIsPickupMapDialogOpen] = useState(false)
  const [isDropoffMapDialogOpen, setIsDropoffMapDialogOpen] = useState(false)

  // ==== SỬA: state flag cho suggestion đã chọn ====
  const [pickupSelected, setPickupSelected] = useState(false)
  const [destinationSelected, setDestinationSelected] = useState(false)

  const debouncedPickup = useDebounce(pickup, 300)
  const debouncedDestination = useDebounce(destination, 300)

  const [wsUrl, setWsUrl] = useState("")
  const { userId } = useAppSelector((state) => state.user)
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false)


  // Khi userId đã có, luôn set wsUrl để giữ websocket connection
  useEffect(() => {
    if (userId) {
      setWsUrl(`ws://localhost:7000/ws/rider/${userId}`)
    }
  }, [userId])

  // Ngắt websocket connection chỉ khi rời trang (unmount)
  const { isConnected, disconnect, sendMessage } = useWebSocket({
    url: wsUrl,
    onMessage: (data) => handleWebSocketMessage(data),
    onOpen: () => console.log("WebSocket connected"),
    onClose: () => console.log("WebSocket disconnected"),
    onError: () => setMatchError("Connection error. Please try again."),
    reconnectAttempts: 3,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const responseCode = params.get("vnp_ResponseCode")
      if (responseCode === "00") {
        setIsPayed(true)
      }
    }
  }, [])


  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Resume ride nếu user reload vào lại trang
  const resumeOngoingRide = useCallback(async () => {
    try {
      if (!userId) return
      const activeRides = await rideAPI.getActiveRides(userId)
      if (!activeRides || activeRides.length === 0) return

      const latestRide = activeRides[activeRides.length - 1]
      setRide(latestRide)

      // Cập nhật lại location cho form/map
      if (latestRide.ride.pickup_location) {
        setPickup(latestRide.ride.pickup_location.name || "")
        setPickupLocation({
          name: latestRide.ride.pickup_location.name,
          coordinate: {
            lat: latestRide.ride.pickup_location.coordinate.lat,
            lng: latestRide.ride.pickup_location.coordinate.lng,
          },
        })
      }
      if (latestRide.ride.dropoff_location) {
        setDestination(latestRide.ride.dropoff_location.name || "")
        setDropoffLocation({
          name: latestRide.ride.dropoff_location.name,
          coordinate: {
            lat: latestRide.ride.dropoff_location.coordinate.lat,
            lng: latestRide.ride.dropoff_location.coordinate.lng,
          },
        })
      }

      if (latestRide.ride.driver_id) {
        const driverDetails = await driverAPI.getDriver(latestRide.ride.driver_id)
        setDriver(driverDetails)
      }

      // Thiết lập UI theo trạng thái ride
      if (latestRide.ride.status === "accepted" || latestRide.ride.status === "arrived") {
        setRideStatus("pickup")
        setStep(2)
      } else if (latestRide.ride.status === "picked_up" || latestRide.ride.status === "ongoing") {
        setRideStatus("transit")
        setStep(3)
      }
    } catch (err) {
      console.error("Error resuming ride:", err)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      resumeOngoingRide()
    }
  }, [userId, resumeOngoingRide])

  const markMessagesAsRead = () => setIsNewMessage(false);

  const handleNewRide = useCallback(() => {
    setRideStatus("idle")
    setPickup("")
    setDestination("")
    setPickupLocation(null)
    setDropoffLocation(null)
    setRide(null)
    setDriver(null)
    setSelectedRating(0)
    setRatingComment("")
    setRatingSubmitted(false)
    // SỬA: reset luôn flag suggestion
    setIsPayed(false)
    setPickupSelected(false)
    setDestinationSelected(false)
    setMessages([])
  }, [])

  const handlePayWithVNPAY = async () => {
    if (!ride || !ride.ride._id || !ride.ride.fare.total_fare) {
      console.warn("Thiếu thông tin ride:", { id: ride?.ride._id, fare: ride?.ride.fare.total_fare })
      return
    }

    setIsPaying(true)
    try {
      const { payment_url } = await paymentAPI.createVnpayPayment({
        serviceId: ride.ride._id,
        amount: ride.ride.fare.total_fare,
      })

      if (payment_url) {
        window.location.href = payment_url
      } else {
        alert("Payment error")
      }
    } catch (err) {
      console.error("Payment error:", err)
      alert("Payment error")
    } finally {
      setIsPaying(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!ride || !driver || selectedRating === 0) return
    setIsSubmittingRating(true)
    try {
      await rideAPI.submitRating(
        ride.ride._id,
        {
          rating: selectedRating,
          comment: ratingComment
        }
      )
      setRatingSubmitted(true)
      toast({ title: "Rating submitted", description: "Thank you for your feedback!" })
    } catch {
      toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleWebSocketMessage = async (data: any) => {
    if (data.event === "driver_found" && data.ride_id) {
      try {
        const rideDetails = await rideAPI.getRide(data.ride_id)
        setRide(rideDetails)
        if (rideDetails.ride.driver_id) {
          const driverDetails = await driverAPI.getDriver(rideDetails?.ride.driver_id)
          setDriver(driverDetails)
        }
        setRideStatus("pickup")
        setStep(2)
      } catch {
        toast({ title: "Error", description: "Failed to load ride info", variant: "destructive" })
        setRideStatus("idle")
      }
    }

    if (data.event === "ride_request_failed") {
      setRideStatus("failed");
      setStep(1);
      setMatchError("Không tìm được tài xế gần bạn lúc này. Vui lòng thử lại sau.");
      toast({
        title: "Cannot find driver",
        description: "We cannot find driver in your current location",
        variant: "destructive",
      });
      return;
    }

    if (data.event === "ride_status_updated") {
      if (data.status === "picked_up" || data.status === "ongoing") {
        setRideStatus("transit")
        setStep(3)
      }
      if (data.status === "completed") {
        setRideStatus("completed")
        setStep(4)
      }
      if (data.status === "cancelled") {
        setRideStatus("failed")
        setStep(1)
        setMatchError("Trip have been cancelled")
        toast({
          title: "Trip have been cancelled",
          description: "Trip have been cancelled",
          variant: "destructive"
        })
      }
    }
    if (data.type === "message" && data.data) {
      setIsNewMessage(true)
      setMessages((msgs) => [
        ...msgs,
        {
          ...data.data,
          fromMe: data.data.sender_id === userId // hoặc kiểm tra theo logic của bạn
        }
      ]);
    }
  }

  const fetchFareEstimate = async () => {
    if (!pickupLocation || !dropoffLocation) return
    setIsFetchingEstimate(true)
    try {
      const estimate = await rideAPI.getFareEstimate({
        estimated_distance: routeInfo.distance,
        estimated_duration: routeInfo.duration,
      })
      setFareEstimate(estimate)
    } catch {
      toast({ title: "Error", description: "Failed to estimate fare", variant: "destructive" })
    } finally {
      setIsFetchingEstimate(false)
    }
  }

  const sendMessageToDriver = (text: string) => {
    if (!ride || !driver || !userId) return;
    const msg = {
      type: "message",
      ride_id: ride.ride._id,
      receiver_id: driver.user_id,
      message: text
    };
    sendMessage(msg);
    setMessages(msgs => [
      ...msgs,
      {
        ...msg,
        sender_id: userId,
        fromMe: true,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const handleFindDriver = async () => {
    if (!pickupLocation || !dropoffLocation || !fareEstimate || !userId) return
    setRideStatus("searching")
    try {
      const estimatedFare = fareEstimate[selectedRideType as keyof FareEstimateResponse]
      const rideData = await rideAPI.createRideRequest({
        rider_id: userId,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        fare: estimatedFare,
        ride_type: selectedRideType,
        estimated_duration: routeInfo.duration,
        estimated_distance: routeInfo.distance,
      })
      // setRide(rideData)
      // Không cần set lại wsUrl hoặc reconnect!
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create ride request", variant: "destructive" })
      setRideStatus("idle")
    }
  }

  // ===== SỬA: FETCH SUGGESTION CÓ FLAG =====
  useEffect(() => {
    if (pickupSelected) return
    if (debouncedPickup) {
      fetchAddressSuggestions(debouncedPickup).then(setPickupSuggestions)
    } else {
      setPickupSuggestions([])
    }
  }, [debouncedPickup, pickupSelected])

  useEffect(() => {
    if (destinationSelected) return
    if (debouncedDestination) {
      fetchAddressSuggestions(debouncedDestination).then(setDestinationSuggestions)
    } else {
      setDestinationSuggestions([])
    }
  }, [debouncedDestination, destinationSelected])

  useEffect(() => {
    setIsLoadingLocation(true)
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          let message = "Failed to get location"
          if (error.code === error.PERMISSION_DENIED) {
            message = "Location permission denied. Please enable location services."
          }
          setLocationError(message)
          setIsLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }

    // Cleanup để ngừng theo dõi khi rời component
    return () => {
      if (navigator.geolocation && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);


  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      fetchFareEstimate()
    }
  }, [pickupLocation, dropoffLocation])

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left column: Map */}
      <div className="w-full md:w-3/5">
        <div className="relative h-[400px] md:h-[600px] rounded-lg overflow-hidden border">
          {isLoadingLocation && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          <Map
            center={
              currentLocation
                ? [currentLocation.lng, currentLocation.lat] as [number, number]
                : [105.85202, 21.02851] as [number, number]
            }
            zoom={14}
            markers={(() => {
              // Ép kiểu markers luôn
              const markers: { position: [number, number]; type: "current" | "start" | "des" }[] = [
                {
                  position: currentLocation
                    ? [currentLocation.lng, currentLocation.lat] as [number, number]
                    : [105.85202, 21.02851] as [number, number],
                  type: "current",
                },
              ];
              if (pickupLocation) {
                markers.push({
                  position: [
                    pickupLocation.coordinate.lng,
                    pickupLocation.coordinate.lat,
                  ] as [number, number],
                  type: "start",
                });
              }
              if (dropoffLocation) {
                markers.push({
                  position: [
                    dropoffLocation.coordinate.lng,
                    dropoffLocation.coordinate.lat,
                  ] as [number, number],
                  type: "des",
                });
              }
              return markers;
            })()}
            route={
              pickupLocation && dropoffLocation
                ? {
                  origin: [
                    pickupLocation.coordinate.lng,
                    pickupLocation.coordinate.lat,
                  ] as [number, number],
                  destination: [
                    dropoffLocation.coordinate.lng,
                    dropoffLocation.coordinate.lat,
                  ] as [number, number],
                }
                : undefined
            }
            setRouteInfo={setRouteInfo}
            routeInfo={routeInfo}
          />



        </div>

        {locationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Right column: Step components */}
      <div className="w-full md:w-2/5 space-y-6">
        {step === 1 && (
          <StepRequestRide
            pickup={pickup}
            destination={destination}
            pickupSuggestions={pickupSuggestions}
            destinationSuggestions={destinationSuggestions}
            // ====== SỬA: reset flag khi người dùng thay đổi input ======
            onPickupChange={(value) => {
              setPickup(value)
              setPickupSelected(false)
            }}
            onDestinationChange={(value) => {
              setDestination(value)
              setDestinationSelected(false)
            }}
            // ====== SỬA: set flag khi chọn suggestion, clear suggestions ======
            onSelectPickupSuggestion={(item) => {
              setPickup(item.label)
              setPickupLocation({ name: item.label, coordinate: { lat: item.coordinates[1], lng: item.coordinates[0] } })
              setPickupSuggestions([])
              setPickupSelected(true)
            }}
            onSelectDestinationSuggestion={(item) => {
              setDestination(item.label)
              setDropoffLocation({ name: item.label, coordinate: { lat: item.coordinates[1], lng: item.coordinates[0] } })
              setDestinationSuggestions([])
              setDestinationSelected(true)
            }}
            onOpenPickupMap={() => setIsPickupMapDialogOpen(true)}
            onOpenDropoffMap={() => setIsDropoffMapDialogOpen(true)}
            fareEstimate={fareEstimate}
            isFetchingEstimate={isFetchingEstimate}
            selectedRideType={selectedRideType}
            onRideTypeChange={setSelectedRideType}
            onSubmit={handleFindDriver}
            rideStatus={rideStatus}
            isConnected={isConnected}
            matchError={matchError}
            routeInfo={routeInfo}
          />
        )}

        {step === 2 && ride && driver && (
          <StepDriverInfo
            messages={messages}
            isNewMessage={isNewMessage}
            setIsNewMessage={markMessagesAsRead}
            onSendMessage={sendMessageToDriver}
            myAvatar={"https://randomuser.me/api/portraits/women/68.jpg"}
            theirAvatar={"https://randomuser.me/api/portraits/men/32.jpg"}
            theirName={"Driver User"}
            handlePayWithVNPAY={handlePayWithVNPAY}
            isPaying={isPaying}
            isPayed={isPayed}
            ride={ride}
            driver={driver}
            onStartTrip={() => {
              setRideStatus("transit")
              setStep(3)
            }}
          />
        )}

        {step === 3 && (
          <StepTransit
            handlePayWithVNPAY={handlePayWithVNPAY}
            isPaying={isPaying}
            isPayed={isPayed}
            ride={ride}
            onComplete={() => {
              setRideStatus("completed")
              setStep(4)
            }}
          />
        )}

        {step === 4 && (
          <StepRateDriver
            ride={ride}
            rating={selectedRating}
            comment={ratingComment}
            onChangeRating={setSelectedRating}
            onChangeComment={setRatingComment}
            onSubmitRating={handleSubmitRating}
            isSubmitting={isSubmittingRating}
            ratingSubmitted={ratingSubmitted}
            onNewRide={() => {
              handleNewRide()
              setStep(1)
            }}
          />
        )}

        {/* Pickup Map Dialog */}
        <Dialog open={isPickupMapDialogOpen} onOpenChange={setIsPickupMapDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Pickup Location</DialogTitle>
              <DialogDescription>Select your pickup location on the map.</DialogDescription>
            </DialogHeader>
            <MapSelector
              location={pickupLocation}
              currentLocation={currentLocation}
              onLocationSelect={(location) => {
                setPickup(location.address)
                setPickupLocation({ name: location.address, coordinate: { lat: location.coordinates[1], lng: location.coordinates[0] } })
                setIsPickupMapDialogOpen(false)
                setPickupSelected(true)
                setPickupSuggestions([])
              }}
              confirmButtonText="Confirm Pickup"
            />
          </DialogContent>
        </Dialog>

        {/* Dropoff Map Dialog */}
        <Dialog open={isDropoffMapDialogOpen} onOpenChange={setIsDropoffMapDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Destination</DialogTitle>
              <DialogDescription>Select your destination on the map.</DialogDescription>
            </DialogHeader>
            <MapSelector
              location={dropoffLocation}
              currentLocation={currentLocation}
              onLocationSelect={(location) => {
                setDestination(location.address)
                setDropoffLocation({ name: location.address, coordinate: { lat: location.coordinates[1], lng: location.coordinates[0] } })
                setIsDropoffMapDialogOpen(false)
                setDestinationSelected(true)
                setDestinationSuggestions([])
              }}
              confirmButtonText="Confirm Destination"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

}
