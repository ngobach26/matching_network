"use client"
import { useEffect, useState } from "react"
import { Ride, rideAPI } from "@/lib/api-client"
import { useAppSelector } from "@/lib/redux/hooks"
import { Star, Car, Bike, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

export function DriveHistory() {
    const [rides, setRides] = useState<Ride[]>([])
    const [loading, setLoading] = useState(true)
    const { userId } = useAppSelector((state) => state.user)
    const router = useRouter()

    useEffect(() => {
        if (!userId) return;
        rideAPI.getRidesByDriver(userId)
            .then(data => setRides(data))
            .finally(() => setLoading(false))
    }, [userId])

    if (loading) return <div>Loading drive history...</div>
    if (!rides.length) return <div>No drives found.</div>

    const rideTypeIcon = (type: string) => {
        switch (type) {
            case "bike": return <Bike className="inline h-4 w-4 text-green-500 mr-1" />;
            case "car": return <Car className="inline h-4 w-4 text-blue-500 mr-1" />;
            case "premium": return <Crown className="inline h-4 w-4 text-yellow-500 mr-1" />;
            default: return null;
        }
    };

    const formatVND = (amount: number) =>
        amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    return (
        <div className="space-y-4">
            {rides.map((ride: any) => (
                <div
                    key={ride._id}
                    className="border rounded-xl p-4 shadow-sm flex flex-col gap-2 bg-gray-50 hover:bg-orange-100 transition cursor-pointer outline-none"
                    onClick={() => router.push(`/ride/${ride._id}`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/ride/${ride._id}`) }}
                >
                    <div className="flex items-center justify-between">
                        <span>
                            <strong>{ride.pickup_location?.name}</strong>
                            <span className="mx-2 text-gray-400">→</span>
                            <strong>{ride.dropoff_location?.name}</strong>
                        </span>
                        <span className="flex items-center">
                            {rideTypeIcon(ride.ride_type)}
                            <span className="capitalize text-sm font-medium">{ride.ride_type}</span>
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-1 text-gray-600 text-sm items-center">
                        <span>Date: {new Date(ride.created_at).toLocaleString()}</span>
                        <span>Status: <span className="capitalize">{ride.status.replace("_", " ")}</span></span>
                        {/* Có thể hiện rider_id hoặc rider_name nếu cần */}
                        <span>Earnings: <span className="font-semibold text-green-600">{formatVND(ride.status == "completed"? ride.fare?.driver_earnings: 0  || 0)}</span></span>
                        <span className="flex items-center">
                            Rating:{" "}
                            {ride.rating?.rating
                                ? <>
                                    <span className="mx-1 text-yellow-500 font-semibold">{ride.rating.rating}</span>
                                    <Star className="h-4 w-4 text-yellow-400" fill="#facc15" />
                                </>
                                : <span className="ml-1 text-gray-400">Not rated</span>
                            }
                        </span>
                    </div>
                    {ride.rating?.comment && (
                        <div className="text-xs text-gray-500 italic mt-1">
                            “{ride.rating.comment}”
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
