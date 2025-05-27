"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Car, Star, KeyRound, User, Info, Mail, Phone } from "lucide-react"

interface VehicleInfo {
  vehicle_type: "bike" | "car" | "premium"
  brand: string
  model: string
  plate_number: string
  capacity: number
  color?: string
}

interface DriverInfo {
  driver_license: string
  status: "active" | "inactive"
  vehicle: VehicleInfo
  totalRides: number
  ratingAverage: number
  ratingCount: number
  createdAt?: string
}

interface RiderInfo {
  // Có thể mở rộng các trường khác nếu cần
  favoriteLocation?: string
  createdAt?: string
}

interface UserProfile {
  id: string
  name: string
  email?: string
  phone?: string
  bio?: string
  roles: Array<"driver" | "rider" | "admin">
  driverInfo?: DriverInfo
  riderInfo?: RiderInfo
  // thêm các role khác nếu có
}

interface ProfileIntroductionProps {
  user: UserProfile
  className?: string
}

export const mockUser: UserProfile = {
    id: "u12345",
    name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone: "+84 912345678",
    bio: "Chào mọi người! Mình là A, thích khám phá công nghệ, đam mê du lịch, hiện đang là tài xế và khách hàng tích cực của hệ sinh thái này.",
    roles: ["driver", "rider"],
    driverInfo: {
      driver_license: "B2-123456789",
      status: "active",
      vehicle: {
        vehicle_type: "car",
        brand: "Toyota",
        model: "Vios",
        plate_number: "30F-123.45",
        capacity: 4,
        color: "Black",
      },
      totalRides: 278,
      ratingAverage: 4.83,
      ratingCount: 109,
      createdAt: "2022-11-01T08:00:00Z",
    },
    riderInfo: {
      favoriteLocation: "Royal City, Hà Nội",
      createdAt: "2021-08-15T09:30:00Z",
    },
  }
  

export const ProfileIntroduction: React.FC<ProfileIntroductionProps> = ({ user, className }) => {
  return (
    <div className={className}>
      {/* Section: General Info */}
      <section className="bg-card rounded-lg p-4 shadow mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Introduction</h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {user.bio && <div className="mb-1">{user.bio}</div>}
          <div>
            <Mail className="inline w-4 h-4 mr-1 text-gray-400" /> {user.email}
          </div>
          {user.phone && (
            <div>
              <Phone className="inline w-4 h-4 mr-1 text-gray-400" /> {user.phone}
            </div>
          )}
        </div>
      </section>

      {/* Section: Roles */}
      {user.roles.includes("driver") && user.driverInfo && (
        <DriverInfoCard info={user.driverInfo} />
      )}

      {user.roles.includes("rider") && user.riderInfo && (
        <RiderInfoCard info={user.riderInfo} />
      )}

      {/* Add more role card as needed */}
    </div>
  )
}

// --- Driver Card ---
function DriverInfoCard({ info }: { info: DriverInfo }) {
  return (
    <section className="bg-card rounded-lg p-4 shadow mb-4">
      <div className="flex items-center gap-3 mb-2">
        <Car className="w-5 h-5 text-blue-500" />
        <h3 className="text-md font-semibold">Driver Information</h3>
        <Badge
          variant="outline"
          className={info.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-yellow-50 text-yellow-700 border-yellow-200"}
        >
          {info.status === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <div>
          <KeyRound className="inline w-4 h-4 mr-1 text-gray-400" />
          License: <span className="font-mono">{info.driver_license}</span>
        </div>
        <div>
          <Star className="inline w-4 h-4 mr-1 text-yellow-500" />
          Rating: <span className="font-semibold">{info.ratingAverage.toFixed(2)}</span>
          {" "}({info.ratingCount} ratings)
        </div>
        <div>
          <span className="font-medium">Total rides:</span> {info.totalRides}
        </div>
        <div className="mt-2">
          <span className="font-medium">Vehicle:</span>
          <ul className="ml-5 list-disc">
            <li>
              Type: <span className="capitalize">{info.vehicle.vehicle_type}</span>
              {info.vehicle.vehicle_type === "car" && <Car className="inline w-4 h-4 mx-1 text-blue-400" />}
            </li>
            <li>Brand: {info.vehicle.brand}</li>
            <li>Model: {info.vehicle.model}</li>
            <li>Plate: <span className="font-mono">{info.vehicle.plate_number}</span></li>
            <li>Capacity: {info.vehicle.capacity} people</li>
            {info.vehicle.color && <li>Color: {info.vehicle.color}</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}

// --- Rider Card (tùy context bạn mở rộng tiếp) ---
function RiderInfoCard({ info }: { info: RiderInfo }) {
  return (
    <section className="bg-card rounded-lg p-4 shadow mb-4">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-5 h-5 text-green-500" />
        <h3 className="text-md font-semibold">Rider Information</h3>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        {info.favoriteLocation && (
          <div>
            Favorite location: <span className="font-medium">{info.favoriteLocation}</span>
          </div>
        )}
        {/* Thêm các field rider info tại đây */}
      </div>
    </section>
  )
}

export default ProfileIntroduction
