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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
import { useAuth } from "@/contexts/AuthContext"
import { mockRideRequests, mockActiveRide } from "@/mocks/rides"
import styles from "./driver.module.css"

export default function DriverDashboardPage() {
  const { user } = useAuth()

  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [rideRequests, setRideRequests] = useState(mockRideRequests)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeStep, setActiveStep] = useState(0)

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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching driver data:", error)
      }
    }

    fetchDriverData()
  }, [])

  // Simulate receiving ride request when driver becomes available
  useEffect(() => {
    if (isAvailable && !activeRide) {
      const timer = setTimeout(() => {
        // Only show notification if there are ride requests and no active ride
        if (rideRequests.length > 0 && !activeRide) {
          setSelectedRequest(rideRequests[0])
          setIsDialogOpen(true)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isAvailable, rideRequests, activeRide])

  const handleAvailabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAvailability = event.target.checked
    setIsAvailable(newAvailability)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleAcceptRequest = () => {
    if (!selectedRequest) return

    // Update UI
    setRideRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))

    // Create active ride
    setActiveRide(mockActiveRide)
    setIsDialogOpen(false)
    setSelectedRequest(null)
    setTabValue(1) // Switch to active ride tab
  }

  const handleRejectRequest = () => {
    if (!selectedRequest) return

    // Update UI
    setRideRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))
    setIsDialogOpen(false)
    setSelectedRequest(null)
  }

  const handleUpdateRideStatus = () => {
    if (!activeRide) return

    const steps = ["accepted", "arriving", "arrived", "in_progress", "completed"]
    const currentStepIndex = steps.indexOf(activeRide.status)

    if (currentStepIndex < steps.length - 1) {
      const newStatus = steps[currentStepIndex + 1]
      setActiveRide({ ...activeRide, status: newStatus })
      setActiveStep(currentStepIndex + 1)
    } else {
      // Ride completed, reset everything
      setTimeout(() => {
        setActiveRide(null)
        setActiveStep(0)
      }, 2000)
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
                <Avatar>{request.rider.name.charAt(0)}</Avatar>
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

    const steps = [
      {
        label: "Accepted",
        description: "You have accepted the ride request.",
        buttonText: "Heading to Pickup",
      },
      {
        label: "Heading to Pickup",
        description: "You are on your way to the pickup location.",
        buttonText: "Arrived at Pickup",
      },
      {
        label: "Arrived at Pickup",
        description: "You have arrived at the pickup location.",
        buttonText: "Start Ride",
      },
      {
        label: "In Progress",
        description: "The ride is in progress.",
        buttonText: "Complete Ride",
      },
      {
        label: "Completed",
        description: "The ride has been completed.",
        buttonText: "Back to Dashboard",
      },
    ]

    return (
      <Card className={styles.activeRideCard}>
        <CardContent>
          <Box className={styles.activeRideHeader}>
            <Box className={styles.riderInfoContainer}>
              <Avatar className={styles.riderAvatar}>{activeRide.rider.name.charAt(0)}</Avatar>
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

          <Divider className={styles.divider} />

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button variant="contained" onClick={handleUpdateRideStatus} sx={{ mt: 1, mr: 1 }}>
                        {step.buttonText}
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Box className={styles.rideActions}>
            <IconButton
              color="primary"
              className={styles.actionButton}
              onClick={() => alert(`Calling ${activeRide.rider.phone}`)}
            >
              <PhoneIcon />
            </IconButton>
            <IconButton
              color="primary"
              className={styles.actionButton}
              onClick={() => alert("Chat feature coming soon")}
            >
              <ChatIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
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

        <Grid item xs={12}>
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

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>Ride Request Details</DialogTitle>
            <DialogContent>
              <Box className={styles.dialogRiderInfo}>
                <Avatar className={styles.dialogRiderAvatar}>{selectedRequest.rider.name.charAt(0)}</Avatar>
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
    </Container>
  )
}

