"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const { isAuthenticated, isLoading, userProfile, updateUserProfile, profileLoading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    bio: "",
    avatar_url: "",
    cover_image_url: "",
  })
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Đồng bộ state form với userProfile
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || "",
        phone_number: userProfile.phone_number || "",
        date_of_birth: userProfile.date_of_birth || "",
        address: userProfile.address || "",
        bio: userProfile.bio || "",
        avatar_url: userProfile.avatar_url || "",
        cover_image_url: userProfile.cover_image_url || "",
      })
    }
  }, [userProfile])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setErrorMsg("")
    setSuccessMsg("")
    try {
      // Chỉ truyền các trường đã khai báo lên API
      await updateUserProfile({ ...form })
      setSuccessMsg("Profile updated successfully!")
    } catch (err) {
      setErrorMsg("Failed to update profile.")
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}
                {successMsg && (
                  <Alert variant="success">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={form.avatar_url}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover_image_url">Cover Image URL</Label>
                    <Input
                      id="cover_image_url"
                      name="cover_image_url"
                      value={form.cover_image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/cover.png"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleSave}
                  disabled={profileLoading}
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-orange-500 hover:bg-orange-600">Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
