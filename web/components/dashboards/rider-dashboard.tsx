"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Rating,
  useTheme,
  CircularProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
} from "@mui/icons-material"
import { useNotifications } from "@/context/notification-context"
import { useRouter } from "next/navigation"
import {
  Home as HomeIcon,
  Work as WorkIcon,
  Event as EventIcon,
  History as HistoryIcon,
  Add as AddIcon,
} from "@mui/icons-material"

// Styled components
const RequestRideCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "visible",
}))

const QuickActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: "bold",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
  height: "100%",
  boxShadow: theme.shadows[2],
}))

const LocationButton = styled(Button)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  textAlign: "left",
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}))

// Mock data
const savedLocations = [
  { id: 1, name: "Home", address: "123 Main St, Anytown", favorite: true },
  { id: 2, name: "Work", address: "456 Business Ave, Downtown", favorite: true },
  { id: 3, name: "Gym", address: "789 Fitness Blvd, Westside", favorite: false },
  { id: 4, name: "Airport", address: "International Airport, Terminal 3", favorite: false },
]

const recentRides = [
  {
    id: 1,
    date: "2023-11-20",
    pickup: "123 Main St",
    destination: "International Airport",
    driver: "Michael Johnson",
    driverId: "user-1",
    driverRating: 4.8,
    price: "$24.50",
    status: "completed",
  },
  {
    id: 2,
    date: "2023-11-18",
    pickup: "Downtown Mall",
    destination: "123 Main St",
    driver: "Sarah Thompson",
    driverId: "user-2",
    driverRating: 4.9,
    price: "$18.75",
    status: "completed",
  },
  {
    id: 3,
    date: "2023-11-15",
    pickup: "123 Main St",
    destination: "Central Park",
    driver: "Emily Davis",
    driverId: "user-5",
    driverRating: 4.6,
    price: "$12.30",
    status: "completed",
  },
]

export function RiderDashboard() {
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [searching, setSearching] = useState(false)
  const [driverFound, setDriverFound] = useState(false)
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "pickup" | "transit" | "completed">("idle")
  const [favoriteLocations, setFavoriteLocations] = useState(savedLocations)
  const theme = useTheme()
  const { addNotification } = useNotifications()
  const router = useRouter()

  const handleFindDriver = () => {
    if (!pickup || !destination) return

    setSearching(true)
    setRideStatus("searching")

    // Simulate API call to find a driver
    setTimeout(() => {
      setSearching(false)
      setDriverFound(true)
      setRideStatus("pickup")

      // Add notification
      addNotification({
        title: "Driver Found",
        message: "Michael Johnson will arrive in 3 minutes.",
        type: "ride",
        actionUrl: "/dashboard?tab=rider",
      })
    }, 2000)
  }

  const handleStartTrip = () => {
    setRideStatus("transit")

    // Add notification
    addNotification({
      title: "Trip Started",
      message: "Your trip has started. Enjoy your ride!",
      type: "ride",
      actionUrl: "/dashboard?tab=rider",
    })

    // Simulate trip completion after some time
    setTimeout(() => {
      setRideStatus("completed")

      // Add notification
      addNotification({
        title: "Trip Completed",
        message: "Your trip has been completed. Total fare: $15.50",
        type: "ride",
        actionUrl: "/dashboard?tab=rider",
      })
    }, 5000)
  }

  const handleNewRide = () => {
    setRideStatus("idle")
    setDriverFound(false)
    setPickup("")
    setDestination("")
  }

  const handleToggleFavorite = (id: number) => {
    setFavoriteLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, favorite: !loc.favorite } : loc)))
  }

  const handleUseLocation = (location: any) => {
    setPickup(location.address)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RequestRideCard elevation={3}>
            <CardHeader title="Request a Ride" subheader="Enter your pickup location and destination" />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationIcon color="primary" sx={{ mr: 1 }} />
                  <TextField
                    fullWidth
                    label="Pickup Location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Enter pickup location"
                    disabled={rideStatus !== "idle"}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <IconButton size="small">
                          <MyLocationIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationIcon color="error" sx={{ mr: 1 }} />
                  <TextField
                    fullWidth
                    label="Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination"
                    disabled={rideStatus !== "idle"}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <IconButton size="small">
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {rideStatus === "idle" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleFindDriver}
                  disabled={!pickup || !destination}
                  sx={{ py: 1.5, fontSize: "1rem" }}
                >
                  Find Driver
                </Button>
              )}

              {rideStatus === "searching" && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="h6">Searching for Drivers...</Typography>
                  <Typography variant="body2" color="textSecondary">
                    This usually takes less than a minute
                  </Typography>
                </Box>
              )}

              {rideStatus === "pickup" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleStartTrip}
                  sx={{ py: 1.5, fontSize: "1rem" }}
                >
                  Start Trip
                </Button>
              )}

              {rideStatus === "transit" && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="h6">In Transit...</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Estimated arrival in 12 minutes
                  </Typography>
                </Box>
              )}

              {rideStatus === "completed" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleNewRide}
                  sx={{ py: 1.5, fontSize: "1rem" }}
                >
                  Request New Ride
                </Button>
              )}
            </CardContent>
          </RequestRideCard>

          {driverFound && (
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Driver Information" subheader="Your driver is on the way" />
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    src="/placeholder.svg?height=200&width=200"
                    alt="Michael Johnson"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">Michael Johnson</Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={4.8}
                        precision={0.1}
                        readOnly
                        size="small"
                        icon={<StarIcon fontSize="inherit" />}
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        4.8 (120 rides)
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip label="Toyota Camry (White)" size="small" icon={<CarIcon />} sx={{ mr: 1 }} />
                      <Chip label="ABC 123" size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    ETA
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ClockIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="body1" fontWeight="medium">
                      3 minutes
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" startIcon={<PhoneIcon />} sx={{ flex: 1 }}>
                    Call
                  </Button>
                  <Button variant="outlined" startIcon={<MessageIcon />} sx={{ flex: 1 }}>
                    Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {rideStatus === "completed" && (
            <Card>
              <CardHeader title="Ride Completed" />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Trip Fare
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      $15.50
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Distance
                    </Typography>
                    <Typography variant="body1">3.2 miles</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">12 minutes</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Rate your driver
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Rating defaultValue={0} precision={1} size="large" icon={<StarIcon fontSize="inherit" />} />
                </Box>
                <TextField fullWidth multiline rows={2} placeholder="Leave a comment (optional)" variant="outlined" />
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Submit Rating
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <QuickActionButton
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setPickup("Current Location")
                      setDestination("Home")
                    }}
                  >
                    <HomeIcon sx={{ fontSize: 32 }} />
                    Home
                  </QuickActionButton>
                </Grid>
                <Grid item xs={6}>
                  <QuickActionButton
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setPickup("Current Location")
                      setDestination("Work")
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 32 }} />
                    Work
                  </QuickActionButton>
                </Grid>
                <Grid item xs={6}>
                  <QuickActionButton variant="outlined" onClick={() => router.push("/schedule-ride")}>
                    <EventIcon sx={{ fontSize: 32 }} />
                    Schedule
                  </QuickActionButton>
                </Grid>
                <Grid item xs={6}>
                  <QuickActionButton variant="outlined" onClick={() => router.push("/ride-history")}>
                    <HistoryIcon sx={{ fontSize: 32 }} />
                    History
                  </QuickActionButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Saved Locations */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Saved Locations"
              action={
                <Button size="small" startIcon={<AddIcon />} onClick={() => alert("Add location feature coming soon!")}>
                  Add
                </Button>
              }
            />
            <CardContent>
              {favoriteLocations.map((location) => (
                <LocationButton
                  key={location.id}
                  variant="text"
                  color="inherit"
                  fullWidth
                  onClick={() => handleUseLocation(location)}
                >
                  <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                    <LocationIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{location.name}</Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {location.address}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(location.id)
                      }}
                    >
                      {location.favorite ? (
                        <FavoriteIcon color="error" fontSize="small" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </LocationButton>
              ))}
            </CardContent>
          </Card>

          {/* Recent Rides */}
          <Card>
            <CardHeader
              title="Recent Rides"
              action={
                <Button size="small" onClick={() => router.push("/ride-history")}>
                  View All
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ p: 0 }}>
                {recentRides.map((ride) => (
                  <ListItem
                    component={Button}
                    key={ride.id}
                    divider
                    onClick={() => alert(`View details for ride ${ride.id}`)}
                    sx={{ width: "100%", textAlign: "left", justifyContent: "flex-start", p: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <CarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap>
                          {ride.destination}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary" noWrap>
                            From: {ride.pickup}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(ride.date).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="subtitle2" color="primary">
                        {ride.price}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

