"use client"

import { useEffect, useState } from "react"
import ProfileAvatar from "@/components/users/profile-avatar"
import ProfileCover from "@/components/users/profile-cover"
import ProfileTabs from "@/components/users/profile-tabs/profile-tabs"
import ProfileIntroduction from "@/components/users/profile-tabs/profile-introduction"
import ProfileActivities from "@/components/users/profile-tabs/profile-activities"
import { userAPI, rideAPI, type Profile, type Ride } from "@/lib/api-client"

interface UserProfileProps {
  userId: number
  className?: string
}

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg"
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"

const UserProfile: React.FC<UserProfileProps> = ({ userId, className }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || isNaN(userId)) return
    setLoading(true)
    Promise.all([
      userAPI.getProfile(userId),
      rideAPI.getRidesByDriver(userId),
    ])
      .then(([profileData, ridesData]) => {
        setProfile(profileData)
        setRides(ridesData)
      })
      .finally(() => setLoading(false))
  }, [userId])

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
    <div className={className}>
      <ProfileCover coverUrl={user.cover_image_url || DEFAULT_COVER} />
      {/* Avatar overlay – absolute center-bottom cover */}
      <div className="relative w-full flex justify-center">
        <div className="absolute -bottom-14">
          <ProfileAvatar
            avatarUrl={user.avatar_url || DEFAULT_AVATAR}
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

export default UserProfile
