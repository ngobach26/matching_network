"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CandidateFormProps {
  onSubmit: (data: any) => void
}

export function CandidateForm({ onSubmit }: CandidateFormProps) {
  const [formData, setFormData] = useState({
    skills: "",
    resumeLink: "",
    jobPreferences: "",
    location: "",
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
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g., JavaScript, React, Node.js"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resumeLink">Resume Link</Label>
        <Input
          id="resumeLink"
          name="resumeLink"
          value={formData.resumeLink}
          onChange={handleChange}
          placeholder="Link to your resume or portfolio"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobPreferences">Job Preferences</Label>
        <Textarea
          id="jobPreferences"
          name="jobPreferences"
          value={formData.jobPreferences}
          onChange={handleChange}
          placeholder="Describe your ideal job, work environment, etc."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Preferred Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Remote, New York, San Francisco"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Save Candidate Profile
      </Button>
    </form>
  )
}

