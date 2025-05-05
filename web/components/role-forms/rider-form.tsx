"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RiderFormProps {
  onSubmit: (data: any) => void
}

export function RiderForm({ onSubmit }: RiderFormProps) {
  const [formData, setFormData] = useState({
    homeAddress: "",
    workAddress: "",
    preferredPaymentMethod: "Credit Card",
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
        <Label htmlFor="homeAddress">Home Address</Label>
        <Input
          id="homeAddress"
          name="homeAddress"
          value={formData.homeAddress}
          onChange={handleChange}
          placeholder="Enter your home address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workAddress">Work Address (Optional)</Label>
        <Input
          id="workAddress"
          name="workAddress"
          value={formData.workAddress}
          onChange={handleChange}
          placeholder="Enter your work address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredPaymentMethod">Preferred Payment Method</Label>
        <Input
          id="preferredPaymentMethod"
          name="preferredPaymentMethod"
          value={formData.preferredPaymentMethod}
          onChange={handleChange}
          placeholder="Credit Card, PayPal, etc."
          required
        />
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Save Rider Profile
      </Button>
    </form>
  )
}
