"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoleContext } from "@/context/role-context"
import { TopBar } from "@/components/TopBar"
import { MobileNav } from "@/components/MobileNav"
import { RoleCard } from "@/components/role-card"
import { RiderForm } from "@/components/role-forms/rider-form"
import { DriverForm } from "@/components/role-forms/driver-form"
import { ReviewerForm } from "@/components/role-forms/reviewer-form"
import { CandidateForm } from "@/components/role-forms/candidate-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userAPI } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import styles from "./Profile.module.css"

export default function Profile() {
  const { roles, setRoles } = useRoleContext()
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    // Fetch user profile data
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const userData = await userAPI.getProfile(user.id)

        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          bio: userData.bio || "",
        })
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      await userAPI.updateProfile(user.id, profileData)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleApplication = (role: string) => {
    // In a real app, this would send an API request to apply for a role
    toast({
      title: "Role Application Submitted",
      description: `Your application for the ${role} role has been submitted.`,
    })
  }

  return (
    <div className={styles.profileContainer}>
      <TopBar />

      <main className={styles.mainContent}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className={styles.tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>

              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={true} // Email should not be editable
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" disabled={loading || saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className={styles.tabContent}>
            <div className={styles.rolesGrid}>
              {!roles.includes("Rider") && (
                <RoleCard
                  title="Rider"
                  description="Request rides and travel to your destinations"
                  icon="🚗"
                  onApply={() => setActiveTab("rider-application")}
                />
              )}

              {!roles.includes("Driver") && (
                <RoleCard
                  title="Driver"
                  description="Drive passengers and earn money"
                  icon="🚕"
                  onApply={() => setActiveTab("driver-application")}
                />
              )}

              {!roles.includes("Reviewer") && (
                <RoleCard
                  title="Reviewer"
                  description="Review driver applications"
                  icon="📝"
                  onApply={() => setActiveTab("reviewer-application")}
                />
              )}

              {!roles.includes("Candidate") && (
                <RoleCard
                  title="Candidate"
                  description="Apply to become a driver"
                  icon="🎓"
                  onApply={() => setActiveTab("candidate-application")}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="rider-application">
            <RiderForm onSubmit={() => handleRoleApplication("Rider")} onCancel={() => setActiveTab("roles")} />
          </TabsContent>

          <TabsContent value="driver-application">
            <DriverForm onSubmit={() => handleRoleApplication("Driver")} onCancel={() => setActiveTab("roles")} />
          </TabsContent>

          <TabsContent value="reviewer-application">
            <ReviewerForm onSubmit={() => handleRoleApplication("Reviewer")} onCancel={() => setActiveTab("roles")} />
          </TabsContent>

          <TabsContent value="candidate-application">
            <CandidateForm onSubmit={() => handleRoleApplication("Candidate")} onCancel={() => setActiveTab("roles")} />
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  )
}
