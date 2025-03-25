"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Divider,
  Avatar,
  Chip,
  Switch,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  LinearProgress,
  useTheme,
  CircularProgress,
  Rating,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  AccessTime as ClockIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  AttachMoney as MoneyIcon,
  LocalTaxi as TaxiIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Navigation as NavigationIcon,
} from "@mui/icons-material"
import { useNotifications } from "@/context/notification-context"

// Styled components
const StatusCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "visible",
}))

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}))

const StatIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  marginBottom: theme.spacing(1),
}))

// Mock data
const todayEarnings = {
  total: 45.75,
  trips: 3,
  hours: 2.5,
  tips: 8.25,
}

const weeklyEarnings = {
  mon: 35.5,
  tue: 42.75,
  wed: 28.3,
  thu: 45.75,
  fri: 0,
  sat: 0,
  sun: 0,
  total: 152.3,
}

const upcomingTrips = [
  {
    id: 1,
    time: "3:30 PM",
    pickup: "Downtown Mall",
    destination: "Airport Terminal 2",
    estimatedEarnings: "$22.50",
    distance: "12.3 miles",
    status: "scheduled",
  },
  {
    id: 2,
    time: "5:45 PM",
    pickup: "Central Park",
    destination: "West Side Apartments",
    estimatedEarnings: "$18.75",
    distance: "8.7 miles",
    status: "scheduled",
  },
]

export function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [hasRideRequest, setHasRideRequest] = useState(false)
  const [rideStatus, setRideStatus] = useState<"idle" | "requested" | "pickup" | "transit" | "completed">("idle")
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const theme = useTheme()
  const { addNotification } = useNotifications()

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable)

    if (!isAvailable) {
      // Simulate receiving a ride request after some time
      setTimeout(() => {
        setHasRideRequest(true)
        setRideStatus("requested")

        // Add notification
        addNotification({
          title: "New Ride Request",
          message: "You have a new ride request from Sarah Thompson.",
          type: "ride",
          actionUrl: "/dashboard?tab=driver",
        })

        setCurrentTrip({
          id: "trip-123",
          rider: {
            name: "Sarah Thompson",
            rating: 4.9,
            trips: 45,
          },
          pickup: "123 Main St, Downtown",
          destination: "456 Park Ave, Uptown",
          estimatedFare: "$12.75",
          estimatedDistance: "2.8 miles",
          estimatedTime: "10 minutes",
        })
      }, 3000)
    } else {
      setHasRideRequest(false)
      setRideStatus("idle")
      setCurrentTrip(null)
    }
  }

  const handleAcceptRide = () => {
    setRideStatus("pickup")

    // Add notification
    addNotification({
      title: "Ride Accepted",
      message: "Navigate to pickup location: 123 Main St, Downtown",
      type: "ride",
      actionUrl: "/dashboard?tab=driver",
    })
  }

  const handleDeclineRide = () => {
    setHasRideRequest(false)
    setRideStatus("idle")
    setCurrentTrip(null)
  }

  const handlePickupRider = () => {
    setRideStatus("transit")

    // Add notification
    addNotification({
      title: "Rider Picked Up",
      message: "Trip has started. Navigate to destination.",
      type: "ride",
      actionUrl: "/dashboard?tab=driver",
    })
  }

  const handleCompleteRide = () => {
    setRideStatus("completed")

    // Add notification
    addNotification({
      title: "Trip Completed",
      message: "You earned $12.75 for this trip.",
      type: "ride",
      actionUrl: "/dashboard?tab=driver",
    })

    // Reset after some time
    setTimeout(() => {
      setHasRideRequest(false)
      setRideStatus("idle")
      setCurrentTrip(null)
    }, 5000)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StatusCard elevation={3}>
            <CardHeader
              title="Driver Dashboard"
              subheader="Manage your availability and rides"
              action={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {isAvailable ? "Available" : "Offline"}
                  </Typography>
                  <Switch checked={isAvailable} onChange={handleToggleAvailability} color="primary" />
                </Box>
              }
            />
            <CardContent>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isAvailable ? "success.light" : "action.disabledBackground",
                  color: isAvailable ? "success.contrastText" : "text.secondary",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TaxiIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {isAvailable
                      ? "You are online and can receive ride requests"
                      : "You are offline and cannot receive ride requests"}
                  </Typography>
                </Box>
                <Chip
                  label={isAvailable ? "Online" : "Offline"}
                  color={isAvailable ? "success" : "default"}
                  size="small"
                />
              </Box>

              {/* Today's Summary */}
              <Typography variant="h6" gutterBottom>
                Today's Summary
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <StatIcon sx={{ bgcolor: "primary.light" }}>
                      <MoneyIcon sx={{ color: "primary.main" }} />
                    </StatIcon>
                    <Typography variant="h5">${todayEarnings.total.toFixed(2)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Earnings
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <StatIcon sx={{ bgcolor: "info.light" }}>
                      <CarIcon sx={{ color: "info.main" }} />
                    </StatIcon>
                    <Typography variant="h5">{todayEarnings.trips}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Trips
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <StatIcon sx={{ bgcolor: "warning.light" }}>
                      <ClockIcon sx={{ color: "warning.main" }} />
                    </StatIcon>
                    <Typography variant="h5">{todayEarnings.hours}h</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Online
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <StatIcon sx={{ bgcolor: "success.light" }}>
                      <MoneyIcon sx={{ color: "success.main" }} />
                    </StatIcon>
                    <Typography variant="h5">${todayEarnings.tips.toFixed(2)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tips
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Current Status */}
              {rideStatus === "idle" && !hasRideRequest && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  {isAvailable ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Waiting for ride requests...
                      </Typography>
                      <CircularProgress sx={{ mt: 2 }} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        You're currently offline
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Go online to start receiving ride requests
                      </Typography>
                      <Button variant="contained" color="primary" onClick={handleToggleAvailability} sx={{ mt: 2 }}>
                        Go Online
                      </Button>
                    </>
                  )}
                </Box>
              )}

              {/* Ride Request */}
              {hasRideRequest && rideStatus === "requested" && currentTrip && (
                <Card sx={{ border: `1px solid ${theme.palette.primary.main}`, mb: 3 }}>
                  <CardHeader
                    title="New Ride Request"
                    subheader="You have a new ride request"
                    sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}
                  />
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{currentTrip.rider.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{currentTrip.rider.name}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Rating value={currentTrip.rider.rating} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {currentTrip.rider.rating} ({currentTrip.rider.trips} trips)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", mb: 1 }}>
                        <LocationIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Pickup
                          </Typography>
                          <Typography variant="body1">{currentTrip.pickup}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex" }}>
                        <LocationIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Destination
                          </Typography>
                          <Typography variant="body1">{currentTrip.destination}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Estimated fare
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentTrip.estimatedFare}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Distance
                        </Typography>
                        <Typography variant="body1">{currentTrip.estimatedDistance}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Est. time
                        </Typography>
                        <Typography variant="body1">{currentTrip.estimatedTime}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        fullWidth
                        onClick={handleDeclineRide}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckIcon />}
                        fullWidth
                        onClick={handleAcceptRide}
                      >
                        Accept
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Pickup Rider */}
              {rideStatus === "pickup" && currentTrip && (
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Pickup Rider" subheader="Navigate to the pickup location" />
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 2 }}>
                      <LocationIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Pickup
                        </Typography>
                        <Typography variant="body1">{currentTrip.pickup}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        ETA to pickup
                      </Typography>
                      <Chip icon={<ClockIcon />} label="3 minutes" color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar sx={{ mr: 2 }}>{currentTrip.rider.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{currentTrip.rider.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Waiting at pickup location
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button variant="outlined" startIcon={<PhoneIcon />} sx={{ flex: 1 }}>
                        Call Rider
                      </Button>
                      <Button variant="outlined" startIcon={<MessageIcon />} sx={{ flex: 1 }}>
                        Message
                      </Button>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<NavigationIcon />}
                      onClick={handlePickupRider}
                      sx={{ mt: 3 }}
                    >
                      Confirm Pickup
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* In Transit */}
              {rideStatus === "transit" && currentTrip && (
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="In Transit" subheader="Navigate to the destination" />
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 2 }}>
                      <LocationIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Destination
                        </Typography>
                        <Typography variant="body1">{currentTrip.destination}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Trip Progress
                      </Typography>
                      <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 1 }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          {currentTrip.pickup}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentTrip.destination}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          ETA
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          7 minutes
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Distance left
                        </Typography>
                        <Typography variant="body1">1.9 miles</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Current fare
                        </Typography>
                        <Typography variant="body1">{currentTrip.estimatedFare}</Typography>
                      </Grid>
                    </Grid>

                    <Button variant="contained" color="primary" fullWidth size="large" onClick={handleCompleteRide}>
                      Complete Ride
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Ride Completed */}
              {rideStatus === "completed" && currentTrip && (
                <Card sx={{ mb: 3 }}>
                  <CardHeader
                    title="Ride Completed"
                    subheader="Ride has been successfully completed"
                    sx={{ bgcolor: "success.light" }}
                  />
                  <CardContent>
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <CheckIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Trip Completed Successfully
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        You've earned {currentTrip.estimatedFare} for this trip
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Fare earned
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentTrip.estimatedFare}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Trip duration
                        </Typography>
                        <Typography variant="body1">15 minutes</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Distance
                        </Typography>
                        <Typography variant="body1">{currentTrip.estimatedDistance}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </StatusCard>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Weekly Earnings */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Weekly Earnings" subheader={`Total: $${weeklyEarnings.total.toFixed(2)}`} />
            <CardContent>
              <Box sx={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                {Object.entries(weeklyEarnings)
                  .filter(([key]) => key !== "total")
                  .map(([day, amount]) => (
                    <Box
                      key={day}
                      sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "14%" }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          bgcolor: "primary.main",
                          borderRadius: "4px 4px 0 0",
                          height: `${(amount / 50) * 100}%`,
                          minHeight: amount > 0 ? 20 : 0,
                          transition: "height 0.3s ease",
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {day.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ${amount.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>

          {/* Upcoming Trips */}
          <Card>
            <CardHeader title="Upcoming Trips" />
            <CardContent sx={{ p: 0 }}>
              {upcomingTrips.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="textSecondary">No upcoming trips</Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {upcomingTrips.map((trip) => (
                    <ListItem
                      component={Button}
                      key={trip.id}
                      divider
                      onClick={() => alert(`View details for trip ${trip.id}`)}
                      sx={{ width: "100%", textAlign: "left", justifyContent: "flex-start", p: 2 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <ClockIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {trip.time} - {trip.destination}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              From: {trip.pickup}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {trip.distance}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle2" color="primary">
                          {trip.estimatedEarnings}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

