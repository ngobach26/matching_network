"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Typography,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Rating,
  Box,
  Paper,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Description as FileIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import { getUserById } from "@/data/users"
import TopBar from "@/components/TopBar"
import { useTheme } from "@/components/ThemeProvider"
import styles from "./UserProfile.module.css"
import { MobileNav } from "@/components/MobileNav"

export default function UserProfileClient({
  params,
  initialUserData,
}: {
  params: { id: string }
  initialUserData?: any
}) {
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(initialUserData || null)
  const [loading, setLoading] = useState(!initialUserData)

  useEffect(() => {
    if (!initialUserData) {
      const userData = getUserById(params.id)
      if (userData) {
        setUser(userData)
      }
      setLoading(false)
    }
  }, [params.id, initialUserData])

  if (loading) {
    return (
      <>
        <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <div className={styles.container}>
          <Typography>Loading...</Typography>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <div className={styles.container}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} className={styles.backButton}>
            Back
          </Button>
          <Typography variant="h5">User not found</Typography>
        </div>
      </>
    )
  }

  const getRoleIcon = (type: string) => {
    switch (type) {
      case "rider":
        return <PersonIcon />
      case "driver":
        return <CarIcon />
      case "reviewer":
        return <FileIcon />
      case "candidate":
        return <WorkIcon />
      default:
        return <PersonIcon />
    }
  }

  const getRoleName = (type: string) => {
    switch (type) {
      case "rider":
        return "Rider"
      case "driver":
        return "Driver"
      case "reviewer":
        return "Reviewer"
      case "candidate":
        return "Candidate"
      default:
        return type
    }
  }

  return (
    <>
      <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className={styles.container}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} className={styles.backButton}>
          Back
        </Button>

        <div className={styles.header}>
          <Avatar src={user.avatarUrl} alt={user.name} className={styles.avatar}>
            {user.name.charAt(0)}
          </Avatar>

          <div className={styles.userInfo}>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="subtitle1" className={styles.username}>
              @{user.username}
            </Typography>

            <div className={styles.badges}>
              {user.roles.map((role: any) => (
                <Chip
                  key={role.type}
                  icon={getRoleIcon(role.type)}
                  label={getRoleName(role.type)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            About
          </Typography>
          <Card>
            <CardContent>
              {user.bio ? (
                <Typography variant="body1">{user.bio}</Typography>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No bio provided
                </Typography>
              )}

              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                {user.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">{user.location}</Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2">Joined {new Date(user.joinedDate).toLocaleDateString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Roles
          </Typography>

          {user.roles.map((role: any) => (
            <Card key={role.type} className={styles.roleCard}>
              <CardHeader
                avatar={getRoleIcon(role.type)}
                title={getRoleName(role.type)}
                subheader={
                  role.rating ? (
                    <Box className={styles.rating}>
                      <Rating value={role.rating.average} precision={0.1} readOnly size="small" />
                      <Typography variant="body2">
                        ({role.rating.average.toFixed(1)}) from {role.rating.count} ratings
                      </Typography>
                    </Box>
                  ) : null
                }
              />

              <Divider />

              <CardContent>
                {role.data && role.type === "driver" && (
                  <Box>
                    <Typography variant="body2">
                      <strong>Vehicle:</strong> {role.data.vehicle}
                    </Typography>
                    {role.data.year && (
                      <Typography variant="body2">
                        <strong>Year:</strong> {role.data.year}
                      </Typography>
                    )}
                  </Box>
                )}

                {role.data && role.type === "reviewer" && (
                  <Box>
                    <Typography variant="body2">
                      <strong>Expertise:</strong> {role.data.expertise}
                    </Typography>
                    {role.data.institution && (
                      <Typography variant="body2">
                        <strong>Institution:</strong> {role.data.institution}
                      </Typography>
                    )}
                    {role.data.bio && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {role.data.bio}
                      </Typography>
                    )}
                  </Box>
                )}

                {role.data && role.type === "candidate" && (
                  <Box>
                    <Typography variant="body2">
                      <strong>Skills:</strong> {role.data.skills}
                    </Typography>
                    {role.data.location && (
                      <Typography variant="body2">
                        <strong>Preferred Location:</strong> {role.data.location}
                      </Typography>
                    )}
                  </Box>
                )}

                {role.rating && role.rating.testimonials && role.rating.testimonials.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Recent Feedback:
                    </Typography>

                    {role.rating.testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                      <Paper key={index} elevation={0} className={styles.testimonial}>
                        <Typography variant="body2" className={styles.testimonialText}>
                          "{testimonial.text}"
                        </Typography>
                        <Typography variant="caption" className={styles.testimonialAuthor}>
                          — {testimonial.author}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="contained" color="primary" fullWidth onClick={() => alert("Message feature coming soon!")}>
          Message {user.name}
        </Button>
      </div>
      <MobileNav />
    </>
  )
}
