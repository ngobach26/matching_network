"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfileAvatar from "@/components/users/profile-avatar"
import ProfileCover from "@/components/users/profile-cover"
import ProfileTabs from "@/components/users/profile-tabs/profile-tabs"
import ProfileIntroduction from "@/components/users/profile-tabs/profile-introduction"
import ProfileActivities from "@/components/users/profile-tabs/profile-activities"
import { userAPI, rideAPI, type Profile, type Ride } from "@/lib/api-client"

export default function UserProfilePage() {
  const params = useParams()
  // ép về số
  const userIdStr = params?.user_id
  const userId = Number(userIdStr)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userIdStr || isNaN(userId)) return
    setLoading(true)
    // Lấy profile và rides song song
    Promise.all([
      userAPI.getProfile(userId),
      rideAPI.getRidesByDriver(userId), // Lấy tất cả chuyến đi của driver theo userId
    ])
      .then(([profileData, ridesData]) => {
        setProfile(profileData)
        setRides(ridesData)
      })
      .finally(() => setLoading(false))
  }, [userIdStr, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mr-3"></div>
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  if (!profile || !profile.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-muted-foreground">User not found.</span>
      </div>
    )
  }

  const { user, driver } = profile

  return (
    <div>
      <ProfileCover coverUrl={user.cover_image_url || undefined} />
      {/* Avatar overlay – absolute center-bottom cover */}
      <div className="relative w-full flex justify-center">
        <div className="absolute -bottom-14">
          <ProfileAvatar
            avatarUrl={user.avatar_url || undefined}
            alt={user.name}
            size={128}
          />
        </div>
      </div>
      <div className="flex justify-end mt-20 pr-5">
        {/* <ProfileActions ... /> */}
      </div>
      <ProfileTabs
        tabItems={[
          { key: "introduction", label: "Introduction" },
          { key: "activities", label: "Activites" }
        ]}
        children={{
          introduction: <ProfileIntroduction user={user} driver={driver} />,
          activities: <ProfileActivities rides={rides} />,
        }}
      />
    </div>
  )
}
