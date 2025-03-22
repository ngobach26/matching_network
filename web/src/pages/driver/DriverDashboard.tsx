"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import {
  DirectionsCar as CarIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Navigation as NavigationIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import { useSnackbar } from "../../contexts/SnackbarContext"
import AppHeader from "../../components/layout/AppHeader"
import MapComponent from "../../components/maps/MapComponent"
import styles from "./DriverDashboard.module.css"

interface RideRequest {
  id: string
  rider: {
    id: string
    name: string
    rating: number
    avatar?: string
  }
  pickup: {
    address: string
    location: {
      lat: number
      lng: number
    }
  }
  dropoff: {
    address: string
    location: {
      lat: number
      lng: number
    }
  }
  distance: string
  duration: string
  fare: number
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  createdAt: string
}

interface ActiveRide {
  id: string
  rider: {
    id: string
    name: string
    rating: number
    avatar?: string
    phone: string
  }
  pickup: {
    address: string
    location: {
      lat: number
      lng: number
    }
  }
  dropoff: {
    address: string
    location: {
      lat: number
      lng: number
    }
  }
  distance: string
  duration: string
  fare: number
  status: "accepted" | "arriving" | "arrived" | "in_progress" | "completed"
  createdAt: string
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  const { showSnackbar } = useSnackbar()

  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simulate driver location
  useEffect(() => {
    if (isAvailable) {
      // Initial location (simulated)
      setDriverLocation({ lat: 40.7128, lng: -74.006 })

      // Update location periodically
      const locationInterval = setInterval(() => {
        setDriverLocation((prev) => {
          if (!prev) return { lat: 40.7128, lng: -74.006 }

          // Simulate small movement
          return {
            lat: prev.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.lng + (Math.random() - 0.5) * 0.001,
          }
        })
      }, 5000)

      return () => clearInterval(locationInterval)
    }
  }, [isAvailable])

  // Load driver data
  useEffect(() => {
    const fetchDriverData = async () => {
      setIsLoading(true)

      try {
        // In a real app, you would fetch this data from your API
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        setRideRequests([
          {
            id: "req-1",
            rider: {
              id: "rider-1",
              name: "Alex Johnson",
              rating: 4.8,
            },
            pickup: {
              address: "123 Main St, New York, NY",
              location: { lat: 40.7282, lng: -73.9942 },
            },
            dropoff: {
              address: "456 Park Ave, New York, NY",
              location: { lat: 40.758, lng: -73.9855 },
            },
            distance: "2.3 miles",
            duration: "12 mins",
            fare: 15.75,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
          {
            id: "req-2",
            rider: {
              id: "rider-2",
              name: "Sarah Williams",
              rating: 4.5,
            },
            pickup: {
              address: "789 Broadway, New York, NY",
              location: { lat: 40.7352, lng: -73.9911 },
            },
            dropoff: {
              address: "101 5th Ave, New York, NY",
              location: { lat: 40.741, lng: -73.9896 },
            },
            distance: "1.5 miles",
            duration: "8 mins",
            fare: 12.5,
            status: "pending",
            createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          },
        ])
      } catch (error) {
        console.error("Error fetching driver data:", error)
        showSnackbar("Failed to load driver data", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDriverData()
  }, [showSnackbar])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Listen for new ride requests
    socket.on("new_ride_request", (request: RideRequest) => {
      setRideRequests((prev) => [request, ...prev])
      showSnackbar("New ride request received!", "info")
    })

    // Listen for ride status updates
    socket.on("ride_status_update", (updatedRide: ActiveRide) => {
      if (activeRide && updatedRide.id === activeRide.id) {
        setActiveRide(updatedRide)
      }
    })

    return () => {
      socket.off("new_ride_request")
      socket.off("ride_status_update")
    }
  }, [socket, activeRide, showSnackbar])

  const handleAvailabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAvailability = event.target.checked
    setIsAvailable(newAvailability)

    if (socket) {
      socket.emit("driver_availability", { available: newAvailability })
    }

    showSnackbar(`You are now ${newAvailability ? "available" : "unavailable"} for rides`, "info")
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleViewRequest = (request: RideRequest) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleAcceptRequest = () => {
    if (!selectedRequest) return

    // In a real app, you would send this to your API
    if (socket) {
      socket.emit("accept_ride", { requestId: selectedRequest.id })
    }

    // Update UI
    setRideRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))

    // Create active ride
    const newActiveRide: ActiveRide = {
      ...selectedRequest,
      status: "accepted",
      rider: {
        ...selectedRequest.rider,
        phone: "+1 (555) 123-4567", // Mock phone number
      },
    }

    setActiveRide(newActiveRide)
    setIsDialogOpen(false)
    setSelectedRequest(null)

    showSnackbar("Ride accepted! Proceed to pickup location.", "success")
  }

  const handleRejectRequest = () => {
    if (!selectedRequest) return

    // In a real app, you would send this to your API
    if (socket) {
      socket.emit("reject_ride", { requestId: selectedRequest.id })
    }

    // Update UI
    setRideRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))
    setIsDialogOpen(false)
    setSelectedRequest(null)

    showSnackbar("Ride request rejected", "info")
  }

  const handleUpdateRideStatus = (newStatus: ActiveRide["status"]) => {
    if (!activeRide) return

    // In a real app, you would send this to your API
    if (socket) {
      socket.emit("update_ride_status", { rideId: activeRide.id, status: newStatus })
    }

    // Update UI
    setActiveRide((prev) => {
      if (!prev) return null
      return { ...prev, status: newStatus }
    })

    if (newStatus === "completed") {
      showSnackbar("Ride completed successfully!", "success")
      setTimeout(() => setActiveRide(null), 3000)
    } else {
      showSnackbar(`Ride status updated to ${newStatus.replace("_", " ")}`, "info")
    }
  }

  const renderRideRequests = () => {
    if (rideRequests.length === 0) {
      return (
        <Box className={styles.emptyState}>
          <Typography variant="body1" color="textSecondary">
            No ride requests available at the moment.
          </Typography>
        </Box>
      )
    }

    return (
      <List className={styles.requestsList}>
        {rideRequests.map((request) => (
          <Paper key={request.id} elevation={2} className={styles.requestItem}>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={request.rider.avatar}>{request.rider.name.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box className={styles.riderInfo}>
                    <Typography variant="subtitle1">{request.rider.name}</Typography>
                    <Box className={styles.ratingContainer}>
                      <StarIcon className={styles.ratingIcon} />
                      <Typography variant="body2">{request.rider.rating}</Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <>
                    <Box className={styles.locationInfo}>
                      <LocationIcon fontSize="small" className={styles.pickupIcon} />
                      <Typography variant="body2" className={styles.locationText}>
                        {request.pickup.address}
                      </Typography>
                    </Box>
                    <Box className={styles.tripInfo}>
                      <Typography variant="body2" className={styles.distanceText}>
                        {request.distance} • {request.duration}
                      </Typography>
                      <Typography variant="subtitle1" className={styles.fareText}>
                        ${request.fare.toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" color="primary" onClick={() => handleViewRequest(request)}>
                  View
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
      </List>
    )
  }

  const renderActiveRide = () => {
    if (!activeRide) {
      return (
        <Box className={styles.emptyState}>
          <Typography variant="body1" color="textSecondary">
            No active ride at the moment.
          </Typography>
        </Box>
      )
    }

    return (
      <Card className={styles.activeRideCard}>
        <CardContent>
          <Box className={styles.activeRideHeader}>
            <Box className={styles.riderInfoContainer}>
              <Avatar src={activeRide.rider.avatar} className={styles.riderAvatar}>
                {activeRide.rider.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{activeRide.rider.name}</Typography>
                <Box className={styles.ratingContainer}>
                  <StarIcon className={styles.ratingIcon} />
                  <Typography variant="body2">{activeRide.rider.rating}</Typography>
                </Box>
              </Box>
            </Box>
            <Box className={styles.fareContainer}>
              <Typography variant="h5" className={styles.fareAmount}>
                ${activeRide.fare.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Fare
              </Typography>
            </Box>
          </Box>

          <Divider className={styles.divider} />

          <Box className={styles.rideDetails}>
            <Box className={styles.locationDetail}>
              <Box className={styles.locationIconContainer}>
                <LocationIcon className={styles.pickupIcon} />
              </Box>
              <Box className={styles.locationTextContainer}>
                <Typography variant="body2" color="textSecondary">
                  Pickup
                </Typography>
                <Typography variant="body1">{activeRide.pickup.address}</Typography>
              </Box>
            </Box>

            <Box className={styles.locationDetail}>
              <Box className={styles.locationIconContainer}>
                <LocationIcon className={styles.dropoffIcon} />
              </Box>
              <Box className={styles.locationTextContainer}>
                <Typography variant="body2" color="textSecondary">
                  Dropoff
                </Typography>
                <Typography variant="body1">{activeRide.dropoff.address}</Typography>
              </Box>
            </Box>
          </Box>

          <Box className={styles.tripStats}>
            <Box className={styles.tripStat}>
              <TimeIcon fontSize="small" />
              <Typography variant="body2">{activeRide.duration}</Typography>
            </Box>
            <Box className={styles.tripStat}>
              <NavigationIcon fontSize="small" />
              <Typography variant="body2">{activeRide.distance}</Typography>
            </Box>
          </Box>

          <Box className={styles.rideActions}>
            <IconButton
              color="primary"
              className={styles.actionButton}
              onClick={() => window.open(`tel:${activeRide.rider.phone}`)}
            >
              <PhoneIcon />
            </IconButton>
            <IconButton
              color="primary"
              className={styles.actionButton}
              onClick={() => showSnackbar("Chat feature coming soon", "info")}
            >
              <ChatIcon />
            </IconButton>
          </Box>
        </CardContent>
        <CardActions className={styles.rideStatusActions}>
          {activeRide.status === "accepted" && (
            <Button variant="contained" color="primary" fullWidth onClick={() => handleUpdateRideStatus("arriving")}>
              Heading to Pickup
            </Button>
          )}

          {activeRide.status === "arriving" && (
            <Button variant="contained" color="primary" fullWidth onClick={() => handleUpdateRideStatus("arrived")}>
              Arrived at Pickup
            </Button>
          )}

          {activeRide.status === "arrived" && (
            <Button variant="contained" color="primary" fullWidth onClick={() => handleUpdateRideStatus("in_progress")}>
              Start Ride
            </Button>
          )}

          {activeRide.status === "in_progress" && (
            <Button variant="contained" color="primary" fullWidth onClick={() => handleUpdateRideStatus("completed")}>
              Complete Ride
            </Button>
          )}

          {activeRide.status === "completed" && (
            <Button variant="outlined" color="primary" fullWidth onClick={() => setActiveRide(null)}>
              Back to Dashboard
            </Button>
          )}
        </CardActions>
      </Card>
    )
  }

  return (
    <>
      <AppHeader title="Driver Dashboard" />
      <Container className={styles.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className={styles.statusCard}>
              <CardContent className={styles.statusCardContent}>
                <Box className={styles.statusHeader}>
                  <Box className={styles.driverStatus}>
                    <Avatar className={styles.driverAvatar}>
                      <CarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Driver Status</Typography>
                      <Typography
                        variant="body1"
                        color={isAvailable ? "success.main" : "text.secondary"}
                        className={styles.statusText}
                      >
                        {isAvailable ? "Available for Rides" : "Unavailable"}
                      </Typography>
                    </Box>
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={isAvailable} onChange={handleAvailabilityChange} color="primary" />}
                    label={isAvailable ? "Online" : "Offline"}
                    className={styles.statusSwitch}
                  />
                </Box>

                <Divider className={styles.divider} />

                <Box className={styles.statsContainer}>
                  <Box className={styles.statItem}>
                    <Typography variant="h5">12</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today's Rides
                    </Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <Typography variant="h5">$145.50</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today's Earnings
                    </Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <Typography variant="h5">4.9</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card className={styles.mapCard}>
              <CardContent className={styles.mapCardContent}>
                <Typography variant="h6" className={styles.mapTitle}>
                  {activeRide ? "Current Ride" : "Your Location"}
                </Typography>
                <Box className={styles.mapContainer}>
                  <MapComponent
                    driverLocation={driverLocation}
                    pickup={activeRide?.pickup.location}
                    dropoff={activeRide?.dropoff.location}
                    isRideActive={!!activeRide}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card className={styles.ridesCard}>
              <CardContent className={styles.ridesCardContent}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  className={styles.tabs}
                >
                  <Tab label="Requests" />
                  <Tab label="Active Ride" />
                </Tabs>

                <Box className={styles.tabContent}>
                  {isLoading ? (
                    <Box className={styles.loadingContainer}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {tabValue === 0 && renderRideRequests()}
                      {tabValue === 1 && renderActiveRide()}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>Ride Request Details</DialogTitle>
            <DialogContent>
              <Box className={styles.dialogRiderInfo}>
                <Avatar src={selectedRequest.rider.avatar} className={styles.dialogRiderAvatar}>
                  {selectedRequest.rider.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedRequest.rider.name}</Typography>
                  <Box className={styles.ratingContainer}>
                    <StarIcon className={styles.ratingIcon} />
                    <Typography variant="body2">{selectedRequest.rider.rating}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider className={styles.divider} />

              <Box className={styles.dialogRideDetails}>
                <Box className={styles.locationDetail}>
                  <Box className={styles.locationIconContainer}>
                    <LocationIcon className={styles.pickupIcon} />
                  </Box>
                  <Box className={styles.locationTextContainer}>
                    <Typography variant="body2" color="textSecondary">
                      Pickup
                    </Typography>
                    <Typography variant="body1">{selectedRequest.pickup.address}</Typography>
                  </Box>
                </Box>

                <Box className={styles.locationDetail}>
                  <Box className={styles.locationIconContainer}>
                    <LocationIcon className={styles.dropoffIcon} />
                  </Box>
                  <Box className={styles.locationTextContainer}>
                    <Typography variant="body2" color="textSecondary">
                      Dropoff
                    </Typography>
                    <Typography variant="body1">{selectedRequest.dropoff.address}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box className={styles.dialogTripInfo}>
                <Box className={styles.tripDetail}>
                  <Typography variant="body2" color="textSecondary">
                    Distance
                  </Typography>
                  <Typography variant="body1">{selectedRequest.distance}</Typography>
                </Box>

                <Box className={styles.tripDetail}>
                  <Typography variant="body2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">{selectedRequest.duration}</Typography>
                </Box>

                <Box className={styles.tripDetail}>
                  <Typography variant="body2" color="textSecondary">
                    Fare
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${selectedRequest.fare.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <DialogContentText className={styles.dialogNote}>
                You have 60 seconds to accept this ride request.
              </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
              <Button onClick={handleRejectRequest} color="error" variant="outlined" startIcon={<CloseIcon />}>
                Reject
              </Button>
              <Button
                onClick={handleAcceptRequest}
                color="primary"
                variant="contained"
                startIcon={<CheckIcon />}
                autoFocus
              >
                Accept
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}

export default DriverDashboard

