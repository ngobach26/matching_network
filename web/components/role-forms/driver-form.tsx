"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { driverAPI, RideType } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"


export function DriverForm() {
  const userId = useAppSelector((state) => state.user.userId)
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [vehicleData, setVehicleData] = useState({
    vehicle_type: "car" as "car" | "bike" | "premium",
    brand: "",
    model: "",
    plate_number: "",
    color: "",
    capacity: 4,
  })

  const [driverData, setDriverData] = useState({
    driver_license: "",
  })

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVehicleData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVehicleSelectChange = (name: string, value: string) => {
    setVehicleData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDriverData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = async () => {
    if (step === 1) {
      if (!vehicleData.model || !vehicleData.plate_number || !vehicleData.capacity) {
        setError("Please fill in all required vehicle fields")
        return
      }
      setStep(2)
    }
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!driverData.driver_license) {
      setError("Please enter your driver's license")
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!userId) {
        throw new Error("User ID not found")
      }

      await driverAPI.createDriver({
        user_id: userId,
        driver_license: driverData.driver_license,
        vehicle: {
          vehicle_type: vehicleData.vehicle_type,
          brand: vehicleData.brand,
          model: vehicleData.model,
          plate_number: vehicleData.plate_number,
          color: vehicleData.color,
          capacity: Number(vehicleData.capacity),
        }
      })

      // Sau khi save thành công, reload lại page
      window.location.reload()
    } catch (err: any) {
      console.error("Error submitting driver data:", err)
      setError(err.message || "Failed to submit driver information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{error}</div>}

      {step === 1 && (
        <form className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <span className="text-sm text-muted-foreground">Step 1 of 2</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              name="brand"
              value={vehicleData.brand}
              onChange={handleVehicleChange}
              placeholder="e.g., Toyota"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={vehicleData.model}
              onChange={handleVehicleChange}
              placeholder="e.g., Camry"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate_number">License Plate</Label>
            <Input
              id="plate_number"
              name="plate_number"
              value={vehicleData.plate_number}
              onChange={handleVehicleChange}
              placeholder="e.g., ABC123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color (Optional)</Label>
            <Input
              id="color"
              name="color"
              value={vehicleData.color}
              onChange={handleVehicleChange}
              placeholder="e.g., White"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Select
              value={vehicleData.capacity.toString()}
              onValueChange={(value) => handleVehicleSelectChange("capacity", value)}
            >
              <SelectTrigger id="capacity">
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 passengers</SelectItem>
                <SelectItem value="4">4 passengers</SelectItem>
                <SelectItem value="6">7 passengers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_type">Vehicle Type</Label>
            <Select
              value={vehicleData.vehicle_type}
              onValueChange={(value) => handleVehicleSelectChange("vehicle_type", value)}
            >
              <SelectTrigger id="vehicle_type">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={handleNextStep}
            disabled={loading}
          >
            {loading ? "Processing..." : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Driver Information</h3>
            <span className="text-sm text-muted-foreground">Step 2 of 2</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{vehicleData.brand} {vehicleData.model}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {vehicleData.plate_number} • {vehicleData.capacity} passengers
              {vehicleData.color && ` • ${vehicleData.color}`}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="driver_license">Driver's License Number</Label>
            <Input
              id="driver_license"
              name="driver_license"
              value={driverData.driver_license}
              onChange={handleDriverChange}
              placeholder="Enter your driver's license number"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={loading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? "Saving..." : "Save Driver Profile"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
