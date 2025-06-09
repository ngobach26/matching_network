// lib/mapbox.ts
import axios from "axios"

const MAPBOX_TOKEN = "pk.eyJ1IjoibmdvYmFjaDI2IiwiYSI6ImNtYThheTkzcjA4Y2Uya3E4NXlsdDFoOGcifQ.aZ8lnl3kBkVTcxt9RqayPQ"

export async function fetchAddressSuggestions(query: string) {
  if (!query) return []

  const res = await axios.get(
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(query) + ".json",
    {
      params: {
        access_token: MAPBOX_TOKEN,
        autocomplete: true,
        limit: 5,
        country: "VN", // Giới hạn tìm kiếm trong Việt Nam (tùy chọn)
      },
    },
  )

  return res.data.features.map((feature: any) => ({
    label: feature.place_name,
    coordinates: feature.center, // [lng, lat]
  }))
}

// New function to fetch route data from Mapbox Directions API
export async function fetchRouteDirections(
  origin: [number, number],
  destination: [number, number],
): Promise<{
  geometry: { coordinates: [number, number][] }
  distance: number
  duration: number
}> {
  try {
    const res = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          geometries: "geojson",
          overview: "full",
        },
      },
    )

    if (res.data.routes && res.data.routes.length > 0) {
      const route = res.data.routes[0]
      return {
        geometry: route.geometry,
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
      }
    }

    throw new Error("No route found")
  } catch (error) {
    console.error("Error fetching route directions:", error)
    throw error
  }
}
