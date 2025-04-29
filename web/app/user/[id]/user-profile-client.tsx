"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, Avatar, Button, CircularProgress } from "@mui/material"
import TopBar from "@/components/TopBar"
import { useTheme } from "@/components/ThemeProvider"
import styles from "./UserProfile.module.css"
import { MobileNav } from "@/components/MobileNav"

interface UserProfileClientProps {
  id: string
}

export default function UserProfileClient({ id }: UserProfileClientProps) {
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        // In a real app, you would fetch from an API
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setUser({
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`,
          avatar: `/placeholder.svg?height=100&width=100`,
          bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          roles: ["rider", "driver"],
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user:", error)
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (loading) {
    return (
      <>
        <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
        </Box>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Typography variant="h5">User not found</Typography>
        </Box>
      </>
    )
  }

  return (
    <>
      <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography variant="h4">User Profile</Typography>
        </div>

        <div className={styles.profileContainer}>
          <div className={styles.avatarSection}>
            <Avatar src={user.avatar} alt={user.name} sx={{ width: 120, height: 120 }} />
            <Typography variant="h5" className={styles.userName}>
              {user.name}
            </Typography>
            <Typography variant="body1" className={styles.userEmail}>
              {user.email}
            </Typography>
          </div>

          <div className={styles.bioSection}>
            <Typography variant="h6">Bio</Typography>
            <Typography variant="body1">{user.bio}</Typography>
          </div>

          <div className={styles.rolesSection}>
            <Typography variant="h6">Roles</Typography>
            <div className={styles.rolesList}>
              {user.roles.map((role: string) => (
                <div key={role} className={styles.roleChip}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actionsSection}>
            <Button variant="contained" color="primary" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  )
}
