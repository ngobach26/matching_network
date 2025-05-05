"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoleContext, type RoleType } from "@/context/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Car, User, FileText, Briefcase, Plus, Loader2 } from "lucide-react"
import { RoleCard } from "@/components/role-card"
import { RiderForm } from "@/components/role-forms/rider-form"
import { DriverForm } from "@/components/role-forms/driver-form"
import { ReviewerForm } from "@/components/role-forms/reviewer-form"
import { CandidateForm } from "@/components/role-forms/candidate-form"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
  const { roles, addRole, removeRole } = useRoleContext()
  const { isAuthenticated, isLoading, logout, userProfile, profileLoading, profileError, updateUserProfile } = useAuth()
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Update form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      // Split name into first and last name if possible
      const nameParts = userProfile.name ? userProfile.name.split(" ") : ["", ""]
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      setFormData({
        firstName,
        lastName,
        email: userProfile.email || "",
        phone: "", // Assuming phone is not in the API response
      })

      // Sync roles with context if needed
      if (userProfile.roles && userProfile.roles.length > 0) {
        userProfile.roles.forEach((role) => {
          if (!roles.some((r) => r.type === role)) {
            addRole({
              type: role as RoleType,
              isComplete: true,
              data: {},
            })
          }
        })
      }
    }
  }, [userProfile, addRole, roles])

  const handleAddRole = (type: RoleType) => {
    setSelectedRole(type)
  }

  const handleRoleSubmit = (data: any) => {
    if (selectedRole) {
      addRole({
        type: selectedRole,
        isComplete: true,
        data,
      })
      setIsAddRoleOpen(false)
      setSelectedRole(null)
    }
  }

  const handleRemoveRole = (type: RoleType) => {
    removeRole(type)
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Combine first and last name
      const name = `${formData.firstName} ${formData.lastName}`.trim()

      // Only update if there are changes
      if (userProfile && (name !== userProfile.name || formData.email !== userProfile.email)) {
        await updateUserProfile({
          name,
          email: formData.email,
        })
        setSaveSuccess(true)

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      }
    } catch (error: any) {
      setSaveError(error.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const renderRoleForm = () => {
    switch (selectedRole) {
      case "rider":
        return <RiderForm onSubmit={handleRoleSubmit} />
      case "driver":
        return <DriverForm onSubmit={handleRoleSubmit} />
      case "reviewer":
        return <ReviewerForm onSubmit={handleRoleSubmit} />
      case "candidate":
        return <CandidateForm onSubmit={handleRoleSubmit} />
      default:
        return null
    }
  }

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Add a logout button to the header
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <div className="flex gap-2">
          {roles.length > 0 && (
            <Button onClick={handleGoToDashboard} className="bg-orange-500 hover:bg-orange-600">
              Go to Dashboard
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {profileError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            {saveSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} disabled={saving} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Roles</h2>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a New Role</DialogTitle>
                <DialogDescription>Select a role to add to your profile</DialogDescription>
              </DialogHeader>

              {!selectedRole ? (
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("rider")}
                  >
                    <User className="h-8 w-8 text-orange-500" />
                    <span>Rider</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("driver")}
                  >
                    <Car className="h-8 w-8 text-orange-500" />
                    <span>Driver</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("reviewer")}
                  >
                    <FileText className="h-8 w-8 text-orange-500" />
                    <span>Reviewer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("candidate")}
                  >
                    <Briefcase className="h-8 w-8 text-orange-500" />
                    <span>Candidate</span>
                  </Button>
                </div>
              ) : (
                <div className="py-4">{renderRoleForm()}</div>
              )}

              {selectedRole && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>
                    Back
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {roles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="text-center mb-4">
                <p className="text-muted-foreground">You haven't added any roles yet.</p>
                <p className="text-muted-foreground">Add a role to access different features of the platform.</p>
              </div>
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Role
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <RoleCard key={role.type} role={role} onRemove={() => handleRemoveRole(role.type)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
