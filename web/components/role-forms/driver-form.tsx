"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DriverFormProps {
  onSubmit: (data: any) => void
}

export function DriverForm({ onSubmit }: DriverFormProps) {
  const [formData, setFormData] = useState({
    license: "",
    vehicle: "",
    year: "",
    insurance: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="license">Driver's License Number</Label>
        <Input
          id="license"
          name="license"
          value={formData.license}
          onChange={handleChange}
          placeholder="Enter your license number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicle">Vehicle Make and Model</Label>
        <Input
          id="vehicle"
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          placeholder="e.g., Toyota Camry"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Vehicle Year</Label>
        <Input id="year" name="year" value={formData.year} onChange={handleChange} placeholder="e.g., 2020" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="insurance">Insurance Policy Number</Label>
        <Input
          id="insurance"
          name="insurance"
          value={formData.insurance}
          onChange={handleChange}
          placeholder="Enter your insurance policy number"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Save Driver Profile
      </Button>
    </form>
  )
}

