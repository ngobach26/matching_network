"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Car, Star, KeyRound, Info, Mail, Phone, UserIcon } from "lucide-react"
import type { User, Driver } from "@/lib/api-client"

interface ProfileIntroductionProps {
  user: User
  driver?: Driver | null
  className?: string
}

const ProfileIntroduction: React.FC<ProfileIntroductionProps> = ({ user, driver, className }) => {
  const roles = Array.isArray(user.roles) ? user.roles : []

  // Helper hiển thị "Chưa cập nhật" khi giá trị là null/rỗng
  const displayOrDefault = (value: any, defaultValue: string = "Chưa cập nhật") => {
    if (value === null || value === undefined || value === "") return defaultValue
    return value
  }

  return (
    <div className={className}>
      {/* Section: General Info */}
      <section className="bg-card rounded-lg p-4 shadow mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Introduction</h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          {/* Name */}
          <div>
            <UserIcon className="inline w-4 h-4 mr-1 text-gray-400" />
            {displayOrDefault(user.name, "Chưa có tên")}
          </div>
          {/* Email */}
          <div>
            <Mail className="inline w-4 h-4 mr-1 text-gray-400" />
            {displayOrDefault(user.email, "Chưa có email")}
          </div>
          {/* Phone */}
          <div>
            <Phone className="inline w-4 h-4 mr-1 text-gray-400" />
            {displayOrDefault(user.phone_number, "Chưa có số điện thoại")}
          </div>
          {/* Date of Birth */}
          <div>
            <span className="inline-block w-4 h-4 mr-1 align-middle">🎂</span>
            {displayOrDefault(user.date_of_birth, "Chưa có ngày sinh")}
          </div>
          {/* Address */}
          <div>
            <span className="inline-block w-4 h-4 mr-1 align-middle">📍</span>
            {displayOrDefault(user.address, "Chưa có địa chỉ")}
          </div>
          {/* Bio */}
          <div className="mb-1">
            <span className="inline-block w-4 h-4 mr-1 align-middle">📝</span>
            {displayOrDefault(user.bio, "Chưa có mô tả bản thân.")}
          </div>
          {/* Roles */}
          <div>
            <span className="inline-block w-4 h-4 mr-1 align-middle">🏷️</span>
            {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "Chưa có vai trò"}
          </div>
        </div>
      </section>

      {/* Section: Driver Info */}
      {roles.includes("driver") && driver && (
        <DriverInfoCard driver={driver} />
      )}
    </div>

  )
}

// --- Driver Card ---
function DriverInfoCard({ driver }: { driver: Driver }) {
  // Helper hiển thị fallback
  const displayOrDefault = (value: any, defaultValue: string = "Chưa cập nhật") => {
    if (value === null || value === undefined || value === "") return defaultValue
    return value
  }
  return (
    <section className="bg-card rounded-lg p-4 shadow mb-4">
      <div className="flex items-center gap-3 mb-2">
        <Car className="w-5 h-5 text-blue-500" />
        <h3 className="text-md font-semibold">Driver Information</h3>
        <Badge
          variant="outline"
          className={driver.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-yellow-50 text-yellow-700 border-yellow-200"}
        >
          {driver.status === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <div>
          <KeyRound className="inline w-4 h-4 mr-1 text-gray-400" />
          License: <span className="font-mono">{displayOrDefault(driver.driver_license)}</span>
        </div>
        <div>
          <Star className="inline w-4 h-4 mr-1 text-yellow-500" />
          Rating: <span className="font-semibold">{driver.rating_average !== undefined && driver.rating_average !== null ? driver.rating_average.toFixed(2) : "N/A"}</span>
          {driver.rating_count !== undefined && <> ({driver.rating_count} ratings)</>}
        </div>
        <div>
          <span className="font-medium">Total rides:</span> {displayOrDefault(driver.total_rides, "0")}
        </div>
        {driver.vehicle && (
          <div className="mt-2">
            <span className="font-medium">Vehicle:</span>
            <ul className="ml-5 list-disc">
              <li>
                Type: <span className="capitalize">{displayOrDefault(driver.vehicle.vehicle_type)}</span>
                {driver.vehicle.vehicle_type === "car" && <Car className="inline w-4 h-4 mx-1 text-blue-400" />}
              </li>
              <li>Brand: {displayOrDefault(driver.vehicle.brand)}</li>
              <li>Model: {displayOrDefault(driver.vehicle.model)}</li>
              <li>Plate: <span className="font-mono">{displayOrDefault(driver.vehicle.plate_number)}</span></li>
              <li>Capacity: {displayOrDefault(driver.vehicle.capacity, "N/A")} people</li>
              {driver.vehicle.color && <li>Color: {driver.vehicle.color}</li>}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProfileIntroduction
