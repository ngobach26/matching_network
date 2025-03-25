"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReviewerFormProps {
  onSubmit: (data: any) => void
}

export function ReviewerForm({ onSubmit }: ReviewerFormProps) {
  const [formData, setFormData] = useState({
    expertise: "",
    institution: "",
    bio: "",
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
        <Label htmlFor="expertise">Areas of Expertise</Label>
        <Input
          id="expertise"
          name="expertise"
          value={formData.expertise}
          onChange={handleChange}
          placeholder="e.g., Machine Learning, Computer Vision"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">Institution/Organization</Label>
        <Input
          id="institution"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          placeholder="Enter your institution or organization"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Brief description of your background and expertise"
          rows={3}
          required
        />
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Save Reviewer Profile
      </Button>
    </form>
  )
}

