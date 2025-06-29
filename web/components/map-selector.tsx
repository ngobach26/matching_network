"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Locate } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Coordinates, Location } from "@/lib/api-client"

// ⚠️ Nên chuyển sang biến môi trường trong dự án thật
mapboxgl.accessToken = "pk.eyJ1IjoibmdvYmFjaDI2IiwiYSI6ImNtYThheTkzcjA4Y2Uya3E4NXlsdDFoOGcifQ.aZ8lnl3kBkVTcxt9RqayPQ"

interface MapSelectorProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void
  initialAddress?: string
  confirmButtonText?: string
  currentLocation: Coordinates | null
  location?: Location | null
}

export function MapSelector({
  onLocationSelect,
  confirmButtonText = "Confirm Location",
  location = null,
  currentLocation
}: MapSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    coordinates: [number, number]
  } | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return

    // Determine initial center
    let initialCenter: [number, number] = [106.660172, 10.762622] // fallback: TP.HCM

    if (location) {
      initialCenter = [location.coordinate.lng, location.coordinate.lat]
    } else if (currentLocation) {
      initialCenter = [currentLocation.lng, currentLocation.lat]
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: 13,
    })

    map.current.on("load", () => {
      setLoading(false)
      updateMarkerPosition(initialCenter)
    })

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat
      updateMarkerPosition([lng, lat])
    })

    return () => {
      map.current?.remove()
    }
  }, [location, currentLocation])

  // Update marker and get address
  const updateMarkerPosition = (coordinates: [number, number]) => {
    if (!map.current) return

    if (marker.current) {
      marker.current.setLngLat(coordinates)
    } else {
      marker.current = new mapboxgl.Marker({ color: "#ff7700" }).setLngLat(coordinates).addTo(map.current)
    }

    reverseGeocode(coordinates)
  }

  // Reverse geocoding
  const reverseGeocode = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}`,
      )
      const data = await response.json()

      if (data.features?.length > 0) {
        const address = data.features[0].place_name
        setSelectedLocation({ address, coordinates })
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
    }
  }

  const centerOnCurrentLocation = () => {
    if (!map.current || !currentLocation) return

    map.current.flyTo({
      center: currentLocation,
      zoom: 15,
      essential: true,
    })

    updateMarkerPosition([currentLocation.lng, currentLocation.lat])
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  return (
    <div className="flex flex-col h-[300px] w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full rounded-md" />
      <div className="absolute top-2 right-2 z-10">
        <Button size="sm" variant="secondary" className="bg-white shadow-md" onClick={centerOnCurrentLocation}>
          <Locate className="h-4 w-4 text-orange-500" />
        </Button>
      </div>
      <div className="absolute bottom-2 left-2 right-2 z-10 bg-white p-2 rounded-md shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm truncate">
            {selectedLocation ? selectedLocation.address : "Select a location on the map"}
          </p>
        </div>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          {confirmButtonText}
        </Button>
      </div>
    </div>
  )
}
