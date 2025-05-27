"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, User, Mail, Phone, MapPin, Calendar, BadgeInfo, Shield } from "lucide-react"

function formatDate(dateString?: string) {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return dateString
  }
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading, userProfile, updateUserProfile, profileLoading } = useAuth()
  const router = useRouter()

  const [editMode, setEditMode] = useState(false)
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
  }, [userProfile, editMode])

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
      await updateUserProfile({ ...form })
      setSuccessMsg("Profile updated successfully!")
      setEditMode(false)
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

  // View mode
  if (!editMode) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 flex flex-col items-center">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover mb-4 border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <h2 className="text-xl font-bold">{userProfile?.name || "User"}</h2>
                {userProfile?.roles && userProfile.roles.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {userProfile.roles.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        <Shield className="w-3 h-3 mr-1" />{role}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500">{userProfile?.email || ""}</p>
                {userProfile?.cover_image_url && (
                  <div className="mt-6 w-full">
                    <img
                      src={userProfile.cover_image_url}
                      alt="Cover"
                      className="rounded-lg w-full max-h-32 object-cover border border-gray-100"
                    />
                  </div>
                )}
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">{userProfile?.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">{userProfile?.phone_number || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">{userProfile?.address || "No address provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm">{userProfile?.date_of_birth ? formatDate(userProfile.date_of_birth) : "No date of birth"}</span>
                  </div>
                  {userProfile?.bio && (
                    <div className="flex items-start">
                      <BadgeInfo className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <span className="text-sm">{userProfile.bio}</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
                {successMsg && (
                  <Alert variant="success" className="w-full mt-4">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}
                {errorMsg && (
                  <Alert variant="destructive" className="w-full mt-4">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={userProfile?.name || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userProfile?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={userProfile?.phone_number || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input value={userProfile?.date_of_birth ? formatDate(userProfile.date_of_birth) : ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={userProfile?.address || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Input value={userProfile?.bio || ""} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Edit mode
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-gray-500 mt-1">Update your personal information</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Edit Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
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
          <CardFooter className="flex gap-4">
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSave}
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setEditMode(false)} disabled={profileLoading}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
