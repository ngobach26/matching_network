"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { fetchRouteDirections } from "@/lib/mapbox"
import { Bike, User, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from "react-dom/server"
import { HiLocationMarker } from "react-icons/hi"
import { TbMapPinOff } from "react-icons/tb"
import { GiScooter } from "react-icons/gi"
import { FaUserAlt } from "react-icons/fa"

// Set your Mapbox token
mapboxgl.accessToken = "pk.eyJ1IjoibmdvYmFjaDI2IiwiYSI6ImNtYThheTkzcjA4Y2Uya3E4NXlsdDFoOGcifQ.aZ8lnl3kBkVTcxt9RqayPQ"

interface MapProps {
  center: [number, number] // [longitude, latitude]
  zoom?: number
  markers?: Array<{
    position: [number, number] // [longitude, latitude]
    type: "pickup" | "dropoff" | "driver" | "rider"
  }>
  route?: {
    origin: [number, number] // [longitude, latitude]
    destination: [number, number] // [longitude, latitude]
  }
  routeInfo?: {
    distance: number
    duration: number
  }
  setRouteInfo?: (info: { distance: number; duration: number }) => void
}

export default function Map({ center, zoom = 13, markers = [], route, setRouteInfo, routeInfo }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  // Store previous route to avoid unnecessary refetching
  const prevRouteRef = useRef<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center,
      zoom,
    })

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Function to add route to map
  const addRouteToMap = useCallback(async (origin: [number, number], destination: [number, number]) => {
    if (!map.current) return

    // Create a route key to check if we need to refetch
    const routeKey = `${origin[0]},${origin[1]}-${destination[0]},${destination[1]}`

    // If route is the same as before, don't refetch
    if (prevRouteRef.current === routeKey && map.current.getSource("route")) {
      return
    }

    prevRouteRef.current = routeKey
    setIsLoadingRoute(true)
    setRouteError(null)

    try {
      // Fetch route directions
      const routeData = await fetchRouteDirections(origin, destination)

      // Store route info for display
      if (setRouteInfo) {
        setRouteInfo({
          distance: routeData.distance / 1000,
          duration: routeData.duration / 60,
        })
      }

      // Add or update the route source and layer
      if (map.current.getSource("route")) {
        ; (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeData.geometry.coordinates,
          },
        })
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeData.geometry.coordinates,
            },
          },
        })

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#f97316",
            "line-width": 4,
            "line-opacity": 0.75,
          },
        })
      }

      // Fit the map to the route bounds
      const coordinates = routeData.geometry.coordinates
      if (coordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        coordinates.forEach((coord) => bounds.extend(coord as mapboxgl.LngLatLike))

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        })
      }
    } catch (error) {
      console.error("Error adding route to map:", error)
      setRouteError("Failed to load route")

      // Fallback to straight line if route fetching fails
      if (map.current.getSource("route")) {
        ; (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [origin, destination],
          },
        })
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [origin, destination],
            },
          },
        })

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#f97316",
            "line-width": 4,
            "line-opacity": 0.75,
            "line-dasharray": [2, 1], // Dashed line for fallback
          },
        })
      }
    } finally {
      setIsLoadingRoute(false)
    }
  }, [])

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current) return

    const onMapLoad = () => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add new markers
      markers.forEach((marker) => {
        const el = document.createElement("div")
        el.className = "marker"

        let iconHtml = ""

        switch (marker.type) {
          case "pickup":
            iconHtml = renderToStaticMarkup(<HiLocationMarker color="#22c55e" size={24} />)
            break
          case "dropoff":
            iconHtml = renderToStaticMarkup(<TbMapPinOff color="#ef4444" size={24} />)
            break
          case "driver":
            iconHtml = renderToStaticMarkup(<GiScooter color="#f97316" size={24} />)
            break
          case "rider":
            el.innerHTML = renderToStaticMarkup(<FaUserAlt color="#22c55e" size={16} />)
            el.style.backgroundColor = "white"
            el.style.borderRadius = "50%"
            el.style.border = "2px solid #22c55e"
            break
        }

        el.innerHTML = iconHtml

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(marker.position)
          .addTo(map.current!)

        markersRef.current.push(newMarker)
      })

      // Add route if provided
      if (route) {
        addRouteToMap(route.origin, route.destination)
      }
    }

    if (map.current.loaded()) {
      onMapLoad()
    } else {
      map.current.on("load", onMapLoad)
    }

    return () => {
      if (map.current) {
        map.current.off("load", onMapLoad)
      }
    }
  }, [markers, route, addRouteToMap])

  // Update map center when center prop changes
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({ center })
    }
  }, [center])

  // Update route when route prop changes
  useEffect(() => {
    if (map.current && route && map.current.loaded()) {
      addRouteToMap(route.origin, route.destination)
    }
  }, [route, addRouteToMap])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading indicator */}
      {isLoadingRoute && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-md shadow-md text-sm">Loading route...</div>
      )}

      {/* Error message */}
      {routeError && (
        <div className="absolute top-2 right-2 bg-red-50 text-red-600 px-3 py-1 rounded-md shadow-md text-sm">
          {routeError}
        </div>
      )}

      {/* Route info (optional) */}
      {routeInfo && !isLoadingRoute && !routeError && (
        <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-md shadow-md text-sm">
          <div className="flex flex-col">
            <span>{routeInfo.distance.toFixed(1)} km</span>
            <span>{Math.round(routeInfo.duration)} min</span>
          </div>
        </div>
      )}
    </div>
  )
}
