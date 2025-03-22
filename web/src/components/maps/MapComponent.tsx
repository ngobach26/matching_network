"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import styles from "./MapComponent.module.css"

interface MapComponentProps {
  driverLocation: { lat: number; lng: number } | null
  pickup?: { lat: number; lng: number }
  dropoff?: { lat: number; lng: number }
  isRideActive?: boolean
}

const MapComponent: React.FC<MapComponentProps> = ({ driverLocation, pickup, dropoff, isRideActive = false }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const driverMarkerRef = useRef<google.maps.Marker | null>(null)
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null)
  const dropoffMarkerRef = useRef<google.maps.Marker | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      // In a real app, you would load the Google Maps API here
      console.log("Google Maps API not loaded")
      return
    }

    const defaultLocation = { lat: 40.7128, lng: -74.006 } // New York City
    const mapOptions: google.maps.MapOptions = {
      center: driverLocation || defaultLocation,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

    // Create directions renderer
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#2196f3",
        strokeWeight: 5,
        strokeOpacity: 0.7,
      },
    })

    directionsRendererRef.current.setMap(mapInstanceRef.current)

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
      }
    }
  }, [])

  // Update driver marker
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverLocation,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2196f3",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
      })
    } else {
      driverMarkerRef.current.setPosition(driverLocation)
    }

    // Center map on driver if no active ride
    if (!isRideActive) {
      mapInstanceRef.current.panTo(driverLocation)
    }
  }, [driverLocation, isRideActive])

  // Update pickup and dropoff markers and directions
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null)
      pickupMarkerRef.current = null
    }

    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setMap(null)
      dropoffMarkerRef.current = null
    }

    // Add pickup marker
    if (pickup) {
      pickupMarkerRef.current = new window.google.maps.Marker({
        position: pickup,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4caf50",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Pickup Location",
      })
    }

    // Add dropoff marker
    if (dropoff) {
      dropoffMarkerRef.current = new window.google.maps.Marker({
        position: dropoff,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#f44336",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Dropoff Location",
      })
    }

    // Calculate and display directions
    if (pickup && dropoff && directionsRendererRef.current) {
      const directionsService = new window.google.maps.DirectionsService()

      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result)

            // Fit map to show all markers and route
            const bounds = new window.google.maps.LatLngBounds()
            bounds.extend(pickup)
            bounds.extend(dropoff)
            if (driverLocation) bounds.extend(driverLocation)
            mapInstanceRef.current?.fitBounds(bounds)
          }
        },
      )
    } else if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] })
    }
  }, [pickup, dropoff, driverLocation])

  return (
    <div ref={mapRef} className={styles.mapContainer}>
      {/* Fallback content if Google Maps doesn't load */}
      <div className={styles.fallbackContent}>Loading map...</div>
    </div>
  )
}

export default MapComponent

