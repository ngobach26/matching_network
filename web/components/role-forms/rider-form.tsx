"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RiderFormProps {
  onSubmit: (data: any) => void
}

export function RiderForm({ onSubmit }: RiderFormProps) {
  const [formData, setFormData] = useState({
    license_number: "",
    payment_method: "Credit Card",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="license_number">License Number (ID)</Label>
        <Input
          id="license_number"
          name="license_number"
          value={formData.license_number}
          onChange={handleChange}
          placeholder="Enter your license or ID number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange("payment_method", value)}>
          <SelectTrigger id="payment_method">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
            <SelectItem value="Apple Pay">Apple Pay</SelectItem>
            <SelectItem value="Google Pay">Google Pay</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Save Rider Profile
      </Button>
    </form>
  )
}
