"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { rideAPI, type Ride } from "@/lib/api-client"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"

// Import step components
import { StepIdle } from "@/components/dashboards/driver-steps/StepIdle"
import { StepRequested } from "@/components/dashboards/driver-steps/StepRequested"
import { StepPickup } from "@/components/dashboards/driver-steps/StepPickup"
import { StepTransit } from "@/components/dashboards/driver-steps/StepTransit"
import { StepCompleted } from "@/components/dashboards/driver-steps/StepCompleted"
// Define ride status type based on the state machine
type RideStatusType = "accepted" | "arrived" | "picked_up" | "ongoing" | "completed" | "cancelled"

export function DriverDashboard() {
  const { userId } = useAppSelector((state) => state.user)

  // Default to inactive (off)
  const [isAvailable, setIsAvailable] = useState(false)
  const [messages, setMessages] = useState<any[]>([]);
  const [rideStatus, setRideStatus] = useState<"idle" | "requested" | "pickup" | "transit" | "completed">("idle")
  const [isUpdating, setIsUpdating] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [waitingForRequests, setWaitingForRequests] = useState(false)
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 21.028511, lng: 105.854444 })
  const [locationError, setLocationError] = useState<string | null>(null)

  // New state for ride request handling
  const [currentRide, setCurrentRide] = useState<Ride | null>(null)
  const [currentRideStatus, setCurrentRideStatus] = useState<RideStatusType | null>(null)
  const [isLoadingRequest, setIsLoadingRequest] = useState(false)
  const [isProcessingDecision, setIsProcessingDecision] = useState(false)
  const [isUpdatingRideStatus, setIsUpdatingRideStatus] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [rideStatusError, setRideStatusError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Today's summary data (could be fetched from API in a real app)
  const todaySummary = {
    earnings: "200,124",
    rides: 3,
    onlineHours: "1.5h",
  }

  // Get current location using browser's Geolocation API
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return Promise.reject(new Error("Geolocation not supported"))
    }

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(location)
          setLocationError(null)
          resolve(location)
        },
        (error) => {
          console.error("Error getting location:", error)
          let errorMessage = "Failed to get your location"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location services."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out."
              break
          }

          setLocationError(errorMessage)
          reject(new Error(errorMessage))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }, [])

  const sendLocationUpdate = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        // Get real location
        const location = await getCurrentLocation()

        const locationUpdate = {
          type: "location_update",
          lat: location.lat,
          lng: location.lng,
        }

        wsRef.current.send(JSON.stringify(locationUpdate))
        setLastLocationUpdate(new Date())
      } catch (error) {
        console.error("Failed to send location update:", error)
      }
    }
  }, [getCurrentLocation])

  // Handle WebSocket disconnection
  const handleDisconnection = useCallback(
    async (reason: string) => {
      console.log("WebSocket disconnected:", reason)
      setConnectionStatus("disconnected")

      // Clear location update interval
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }

      // If driver was available, set them to unavailable
      if (isAvailable) {
        setConnectionError(`Connection lost: ${reason}. You've been set to offline.`)
        setIsAvailable(false)
        setWaitingForRequests(false)
      }
    },
    [isAvailable],
  )
  
  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(async (data: any) => {
    console.log("Processing WebSocket message:", data)

    // Handle match message
    if (data.event === "ride_request_matched" && data.ride_id) {
      console.log("Match found! Ride request ID:", data.ride_id)

      setIsLoadingRequest(true)
      setDecisionError(null)

      try {
        // Fetch ride request details
        const rideDetails = await rideAPI.getRide(data.ride_id)
        console.log("Ride request details:", rideDetails)

        setCurrentRide(rideDetails)
        setRideStatus("requested")
        setWaitingForRequests(false)
      } catch (error) {
        console.error("Error fetching ride request details:", error)
        setDecisionError("Failed to fetch ride request details")
      } finally {
        setIsLoadingRequest(false)
      }
    }

    // Handle ride request message (for backward compatibility)
    else if (data.type === "ride_request") {
      console.log("Ride request received:", data)
      setRideStatus("requested")
      setWaitingForRequests(false)
    }

    if (data.type === "message" && data.data) {
      setMessages(msgs => [
        ...msgs,
        {
          ...data.data,
          fromMe: data.data.sender_id === userId, // Bạn là driver
        }
      ]);
    }
  }, [])

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      // Clean up WebSocket connection
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      // Clean up location update interval
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const resumeOngoingRide = async () => {
      if (!userId) return
  
      try {
        const ride = (await rideAPI.getDriverActiveRides(userId)).at(-1)
        if (!ride || ride.status === "completed" || ride.status === "cancelled") return
  
        setCurrentRide(ride)
        // setCurrentRideRequest(ride.ride_request)
        setCurrentRideStatus(ride.status as RideStatusType)
  
        // Bật lại WebSocket nếu chưa bật
        if (!wsRef.current) {
          handleToggleAvailability()
        }
      } catch (err) {
        console.error("Error resuming ride:", err)
      }
    }
  
    resumeOngoingRide()
  }, [userId])

  // Update UI based on ride status
  useEffect(() => {
    if (currentRideStatus) {
      switch (currentRideStatus) {
        case "accepted":
        case "arrived":
          setRideStatus("pickup")
          break
        case "picked_up":
        case "ongoing":
          setRideStatus("transit")
          break
        case "completed":
          setRideStatus("completed")
          break
        case "cancelled":
          setRideStatus("idle")
          setWaitingForRequests(true)
          setCurrentRide(null)
          setCurrentRideStatus(null)
          break
      }
    }
  }, [currentRideStatus])

  const handleToggleAvailability = async () => {
    try {
      setIsUpdating(true)

      // Simply toggle the local state without making API calls
      const newAvailability = !isAvailable
      setIsAvailable(newAvailability)

      // Handle WebSocket connection based on new availability status
      if (newAvailability) {
        // Check for location permission first
        try {
          await getCurrentLocation()
        } catch (error) {
          // If location permission is denied, don't proceed
          setIsUpdating(false)
          setIsAvailable(false) // Revert back to unavailable
          return
        }

        // Driver is becoming available - connect to WebSocket
        setConnectionStatus("connecting")
        setConnectionError(null)
        setWaitingForRequests(true)

        // Close existing connection if any
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }

        // Clear existing interval if any
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current)
          locationIntervalRef.current = null
        }

        // Create new WebSocket connection
        const websocketUrl = `ws://localhost:7000/ws/driver/${userId}`
        console.log("Connecting to WebSocket:", websocketUrl)

        try {
          const ws = new WebSocket(websocketUrl)

          ws.onopen = () => {
            console.log("WebSocket connected")
            setConnectionStatus("connected")

            // Send initial location update
            sendLocationUpdate()

            // Set up interval for location updates every 30 seconds
            locationIntervalRef.current = setInterval(sendLocationUpdate, 30000)
          }

          ws.onmessage = (event) => {
            console.log("WebSocket message received:", event.data)
            try {
              const data = JSON.parse(event.data)
              handleWebSocketMessage(data)
            } catch (e) {
              console.error("Error parsing WebSocket message:", e)
            }
          }

          ws.onerror = (error) => {
            console.error("WebSocket error:", error)
            handleDisconnection("Connection error")
          }

          ws.onclose = (event) => {
            const reason = event.reason || "Connection closed"
            handleDisconnection(reason)
          }

          wsRef.current = ws
        } catch (error) {
          console.error("Error creating WebSocket:", error)
          setConnectionError("Failed to connect to the server. Please try again.")
          setConnectionStatus("disconnected")
          setIsAvailable(false) // Revert back to unavailable
        }
      } else {
        // Driver is becoming unavailable - disconnect WebSocket
        setWaitingForRequests(false)

        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }

        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current)
          locationIntervalRef.current = null
        }

        setConnectionStatus("disconnected")
        setRideStatus("idle")
      }
    } catch (error) {
      console.error("Error toggling availability:", error)
      setConnectionError("Failed to update your status. Please try again.")
      setIsAvailable(false) // Ensure we're in a safe state
    } finally {
      setIsUpdating(false)
    }
  }

  const sendMessageToRider = (text: string) => {
    if (!currentRide || !userId || !currentRide.rider_id) return;
    const msg = {
      type: "message",
      ride_id: currentRide._id,
      receiver_id: currentRide.rider_id,
      message: text,
    };
    wsRef.current?.readyState === 1 && wsRef.current.send(JSON.stringify(msg));
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

  // Handle driver decision (accept or decline)
  const handleDriverDecision = async (accept: boolean) => {
    if (!currentRide) return

    setIsProcessingDecision(true)
    setDecisionError(null)

    try {
      if (!userId) {
        throw new Error("User ID not found")
      }

      if (accept) {
        // Submit driver's decision to accept the ride
        const response = await rideAPI.submitDriverDecision(currentRide._id, userId, true)

        console.log("Decision response:", response)

        // Fetch the created ride
        if (response.ride) {
          console.log("Ride details:", response.ride)
          setCurrentRide(response.ride)
          setCurrentRideStatus("accepted")
        }
      } else {
        // Submit driver's decision to decline the ride
        await rideAPI.submitDriverDecision(currentRide._id, userId, false)

        // Reset state
        setCurrentRide(null)
        setRideStatus("idle")
        setWaitingForRequests(true)
      }
    } catch (error: any) {
      console.error("Error processing driver decision:", error)
      setDecisionError(error.message || "Failed to process your decision")
    } finally {
      setIsProcessingDecision(false)
    }
  }

  // Update ride status
  const updateRideStatus = async (action: string) => {
    if (!currentRide) return

    setIsUpdatingRideStatus(true)
    setRideStatusError(null)

    try {
      console.log(currentRide)
      const response = await rideAPI.updateRideStatus(currentRide._id, action)
      console.log(`Ride status updated to ${action}:`, response)

      // Update the ride status in the UI
      switch (action) {
        case "arrive":
          setCurrentRideStatus("arrived")
          break
        case "pick_up":
          setCurrentRideStatus("picked_up")
          break
        case "start_ride":
          setCurrentRideStatus("ongoing")
          break
        case "complete":
          setCurrentRideStatus("completed")
          break
        case "cancel":
          setCurrentRideStatus("cancelled")
          break
      }
    } catch (error: any) {
      console.error(`Error updating ride status to ${action}:`, error)
      setRideStatusError(error.message || `Failed to update ride status to ${action}`)
    } finally {
      setIsUpdatingRideStatus(false)
    }
  }

  // Handle arriving at pickup location
  const handleArriveAtPickup = () => {
    updateRideStatus("arrive")
  }

  // Handle picking up rider
  const handlePickupRider = () => {
    updateRideStatus("pick_up")
  }

  // Handle starting ride
  const handleStartRide = () => {
    updateRideStatus("start_ride")
  }

  // Handle completing ride
  const handleCompleteRide = () => {
    updateRideStatus("complete")
  }

  // Handle cancelling ride
  const handleCancelRide = () => {
    updateRideStatus("cancel")
  }

  // Handle new ride after completion
  const handleNewRide = () => {
    setRideStatus("idle")
    setCurrentRide(null)
    setCurrentRideStatus(null)
    setWaitingForRequests(true)
    setMessages([]);
  }

  // Render the appropriate step based on ride status
  const renderStep = () => {
    switch (rideStatus) {
      case "idle":
        return (
          <StepIdle
            isAvailable={isAvailable}
            onToggleAvailability={handleToggleAvailability}
            isUpdating={isUpdating}
            connectionStatus={connectionStatus}
            connectionError={connectionError}
            locationError={locationError}
            currentLocation={currentLocation}
            lastLocationUpdate={lastLocationUpdate}
            waitingForRequests={waitingForRequests}
            todaySummary={todaySummary}
          />
        )
      case "requested":
        return (
          <StepRequested
            ride={currentRide}
            currentLocation={currentLocation}
            isLoadingRequest={isLoadingRequest}
            isProcessingDecision={isProcessingDecision}
            decisionError={decisionError}
            onAccept={() => handleDriverDecision(true)}
            onDecline={() => handleDriverDecision(false)}
          />
        )
      case "pickup":
        return (
          <StepPickup
            ride={currentRide}
            currentLocation={currentLocation}
            rideStatus={currentRideStatus}
            rideStatusError={rideStatusError}
            isUpdatingRideStatus={isUpdatingRideStatus}
            onArriveAtPickup={handleArriveAtPickup}
            onPickupRider={handlePickupRider}
            onCancelRide={handleCancelRide}
            messages={messages}
            onSendMessage={sendMessageToRider}
            myAvatar={"https://randomuser.me/api/portraits/men/32.jpg"} // DRIVER avatar (nam, lịch sự)
            theirAvatar={"https://randomuser.me/api/portraits/women/68.jpg"} // RIDER avatar (nữ, thân thiện)
            theirName={"Rider User"}
          />

        )
      case "transit":
        return (
          <StepTransit
            ride={currentRide}
            currentLocation={currentLocation}
            rideStatus={currentRideStatus}
            rideStatusError={rideStatusError}
            isUpdatingRideStatus={isUpdatingRideStatus}
            onStartRide={handleStartRide}
            onCompleteRide={handleCompleteRide}
            onCancelRide={handleCancelRide}
          />
        )
      case "completed":
        return <StepCompleted ride={currentRide} onNewRide={handleNewRide} />
      default:
        return (
          <StepIdle
            isAvailable={isAvailable}
            onToggleAvailability={handleToggleAvailability}
            isUpdating={isUpdating}
            connectionStatus={connectionStatus}
            connectionError={connectionError}
            locationError={locationError}
            currentLocation={currentLocation}
            lastLocationUpdate={lastLocationUpdate}
            waitingForRequests={waitingForRequests}
            todaySummary={todaySummary}
          />
        )
    }
  }

  return <div className="space-y-6">
      {renderStep()}
    </div>
}
