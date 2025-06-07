"use client"

import * as React from "react"
import { Star, MapPin, Calendar, MessageCircle } from "lucide-react"
import type { Ride } from "@/lib/api-client"

interface ProfileActivitiesProps {
  rides: Ride[]
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown date"
  const date = new Date(dateString)
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const ProfileActivities: React.FC<ProfileActivitiesProps> = ({ rides }) => {
  // Lọc những chuyến có rating
  const ratedRides = (rides ?? []).filter(ride => !!ride.rating)

  if (!ratedRides.length) {
    return (
      <div className="text-gray-400 italic p-4 text-center">
        No rated rides found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ratedRides.map(ride => (
        <div key={ride._id} className="rounded-lg shadow bg-card p-4">
          {/* Thời gian */}
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(ride.end_at || ride.created_at)}
          </div>
          {/* Địa điểm */}
          <div className="flex items-center mb-1">
            <MapPin className="w-4 h-4 mr-1 text-blue-400" />
            <span className="font-medium">{ride.pickup_location?.name}</span>
            <span className="mx-2 text-gray-400">→</span>
            <MapPin className="w-4 h-4 mr-1 text-green-500" />
            <span className="font-medium">{ride.dropoff_location?.name}</span>
          </div>
          {/* Thông tin rating */}
          <div className="flex items-center mb-1">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="font-semibold">{ride.rating?.rating}/5</span>
          </div>
          {/* Bình luận */}
          {ride.rating?.comment && (
            <div className="flex items-center mt-1 text-sm text-gray-700 dark:text-gray-300">
              <MessageCircle className="w-4 h-4 mr-1 text-orange-500" />
              <span>{ride.rating.comment}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProfileActivities
