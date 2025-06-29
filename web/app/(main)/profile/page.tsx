"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Ride, rideAPI } from "@/lib/api-client"
import ProfileAvatar from "@/components/users/profile-avatar"
import ProfileCover from "@/components/users/profile-cover"
import ProfileTabs from "@/components/users/profile-tabs/profile-tabs"
import ProfileIntroduction from "@/components/users/profile-tabs/profile-introduction"
import ProfileActivities from "@/components/users/profile-tabs/profile-activities"
import { uploadFileToS3 } from "@/lib/s3-upload"
import { Camera, Loader2 } from "lucide-react"

export default function MyProfilePage() {
  const { isAuthenticated, isLoading, userProfile, updateUserProfile } = useAuth()
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || "")
  const [coverUrl, setCoverUrl] = useState(userProfile?.cover_image_url || "")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [loading, setLoading] = useState(true)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated || !userProfile?.id) return
    setLoading(true)
    rideAPI.getRidesByDriver(userProfile.id)
      .then(setRides)
      .finally(() => setLoading(false))
  }, [userProfile?.id, isAuthenticated])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setAvatarUrl(userProfile?.avatar_url || "")
    setCoverUrl(userProfile?.cover_image_url || "")
  }, [userProfile?.avatar_url, userProfile?.cover_image_url])

  // --- Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadFileToS3(file)
      await updateUserProfile({ avatar_url: url })
      setAvatarUrl(url)
    } catch (err: any) {
      alert("Failed to upload avatar: " + err?.message)
    }
    setUploadingAvatar(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }
  // --- Cover upload
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadFileToS3(file)
      await updateUserProfile({ cover_image_url: url })
      setCoverUrl(url)
    } catch (err: any) {
      alert("Failed to upload cover: " + err?.message)
    }
    setUploadingCover(false)
    if (coverInputRef.current) coverInputRef.current.value = ""
  }

  if (isLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mr-3"></div>
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  const user = { ...userProfile, avatar_url: avatarUrl, cover_image_url: coverUrl }
  const driver = undefined

  return (
    <div>
      {/* Cover image */}
      <div className="relative">
        <ProfileCover coverUrl={coverUrl || undefined} />
        {/* Icon upload cover (góc phải dưới của cover) */}
        <label className="absolute bottom-3 right-3 z-20 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={coverInputRef}
            onChange={handleCoverChange}
            disabled={uploadingCover}
          />
          <div className="bg-white shadow-md rounded-full p-2 hover:bg-orange-100 transition-colors border border-gray-300">
            {uploadingCover
              ? <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
              : <Camera className="h-5 w-5 text-orange-500" />}
          </div>
        </label>
        {/* Avatar overlay lên cover, nằm giữa và lấn xuống ngoài background */}
        <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="relative group">
            <ProfileAvatar
              avatarUrl={avatarUrl || undefined}
              alt={user.name}
              size={128}
            />
            {/* Icon upload avatar (góc phải dưới của avatar) */}
            <label className="absolute bottom-1 right-1 z-20 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
              <div className="bg-white shadow-md rounded-full p-1 hover:bg-orange-100 transition-colors border border-gray-300">
                {uploadingAvatar
                  ? <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                  : <Camera className="h-4 w-4 text-orange-500" />}
              </div>
            </label>
          </div>
        </div>
        <div style={{ height: 64 }} />
      </div>

      {/* Tabs */}
      <ProfileTabs
        tabItems={[
          { key: "introduction", label: "Introduction" },
          { key: "activities", label: "Activities" }
        ]}
        children={{
          introduction: <ProfileIntroduction user={user} driver={driver} />,
          activities: <ProfileActivities rides={rides} />,
        }}
      />
    </div>
  )
}
