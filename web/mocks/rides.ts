export const mockRideRequests = [
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
]

export const mockActiveRide = {
  id: "ride-1",
  rider: {
    id: "rider-1",
    name: "Alex Johnson",
    rating: 4.8,
    phone: "+1 (555) 123-4567",
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
  status: "accepted",
  createdAt: new Date().toISOString(),
}

