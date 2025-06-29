"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { rideAPI } from "@/lib/api-client"
import { Star, Car, Bike, Crown, User } from "lucide-react"
import Link from "next/link"
import clsx from "clsx" // Nếu dùng classnames hoặc clsx để điều kiện hoá class

export default function RideDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [rideDetail, setRideDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    rideAPI.getRide(id)
      .then(setRideDetail)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center">Loading ride details...</div>
  if (!rideDetail) return <div className="p-8 text-red-500 text-center">Ride not found.</div>

  const { ride, rider, driver } = rideDetail

  // Hiển thị icon cho ride type
  const rideTypeIcon = (type: string) => {
    switch (type) {
      case "bike": return <Bike className="inline h-5 w-5 text-green-500 mr-1" />;
      case "car": return <Car className="inline h-5 w-5 text-blue-500 mr-1" />;
      case "premium": return <Crown className="inline h-5 w-5 text-yellow-500 mr-1" />;
      default: return null;
    }
  };

  // Format tiền VND
  const formatVND = (amount: number) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl bg-white shadow border">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-500 hover:underline text-sm"
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-3 text-center">Ride Detail</h1>

      {/* Route display */}
      <div className="flex items-center gap-3 mb-5 justify-center">
        <span className="text-lg font-semibold">{ride.pickup_location?.name}</span>
        <span className="text-gray-400">→</span>
        <span className="text-lg font-semibold">{ride.dropoff_location?.name}</span>
      </div>

      {/* Ride type */}
      <div className="flex justify-center mb-6">
        <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border">
          {rideTypeIcon(ride.ride_type)}
          <span className="capitalize text-base font-medium">{ride.ride_type}</span>
        </span>
      </div>

      {rider && (
        <div className="mb-4">
          <div className="text-xs text-gray-400">Rider</div>
          <Link
            href={`/users/${rider.id}`}
            className="group flex items-center gap-2 w-fit"
            tabIndex={0}
            aria-label={`View rider ${rider.name || rider.email}`}
          >
            <User className="h-4 w-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-150" />
            <span
              className={clsx(
                "font-medium text-gray-700 transition-all duration-150",
                "group-hover:text-orange-600 group-hover:underline"
              )}
            >
              {rider.name || rider.email || <span className="text-gray-400 italic">Unknown</span>}
            </span>
          </Link>
          {rider.phone_number && (
            <div className="text-xs text-gray-500">Phone: {rider.phone_number}</div>
          )}
        </div>
      )}

      {driver && (
        <div className="mb-4">
          <div className="text-xs text-gray-400">Driver</div>
          <Link
            href={`/users/${driver.id}`}
            className="group flex items-center gap-2 w-fit"
            tabIndex={0}
            aria-label={`View driver ${driver.name || driver.email}`}
          >
            <User className="h-4 w-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-150" />
            <span
              className={clsx(
                "font-medium text-gray-700 transition-all duration-150",
                "group-hover:text-orange-600 group-hover:underline"
              )}
            >
              {driver.name || driver.email || (
                <span className="text-gray-400 italic">Not assigned</span>
              )}
            </span>
          </Link>
          {driver.phone_number && (
            <div className="text-xs text-gray-500">Phone: {driver.phone_number}</div>
          )}
        </div>
      )}

      {/* Ride details */}
      <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
        <div>
          <div className="text-xs text-gray-400">Date</div>
          <div>{new Date(ride.created_at).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Status</div>
          <div className="capitalize">{ride.status.replace("_", " ")}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Fare</div>
          <div className="text-orange-600 font-semibold">{formatVND(ride.fare?.total_fare || 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Ride Type</div>
          <div className="capitalize">{ride.ride_type}</div>
        </div>
        {ride.driver_id && (
          <div>
            <div className="text-xs text-gray-400">Driver ID</div>
            <div>{ride.driver_id}</div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Rating:</span>
          {ride.rating?.rating
            ? <>
              <span className="text-yellow-500 font-semibold">{ride.rating.rating}</span>
              <Star className="h-4 w-4 text-yellow-400" fill="#facc15" />
            </>
            : <span className="text-gray-400">Not rated</span>
          }
        </div>
        {ride.rating?.comment && (
          <div className="mt-2 text-xs text-gray-500 italic">“{ride.rating.comment}”</div>
        )}
      </div>

      {/* Cancellation */}
      {ride.cancellation_reason && (
        <div className="mt-6 text-red-500">
          <div className="font-semibold">Cancelled</div>
          <div>Reason: {ride.cancellation_reason}</div>
          {ride.cancelled_by && <div>By: {ride.cancelled_by}</div>}
        </div>
      )}
    </div>
  )
}
