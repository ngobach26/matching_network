"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Badge,
} from "@mui/material"
import {
  DirectionsCar as DriverIcon,
  EmojiPeople as RiderIcon,
  MenuBook as ReviewerIcon,
  Work as CandidateIcon,
  School as MentorIcon,
  Person as MenteeIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import AppHeader from "../../components/layout/AppHeader"
import styles from "./Dashboard.module.css"

interface RoleSummary {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  activeMatches: number
  pendingActions: number
  path: string
}

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth()
  const { isConnected } = useSocket()
  const navigate = useNavigate()

  const [roleSummaries, setRoleSummaries] = useState<RoleSummary[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchRoleSummaries = async () => {
      setIsLoadingRoles(true)

      try {
        // In a real app, you would fetch this data from your API
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const summaries: RoleSummary[] = []

        if (user.roles.includes("rider")) {
          summaries.push({
            id: "rider",
            title: "Rider",
            description: "Request rides to your destinations",
            icon: <RiderIcon fontSize="large" />,
            activeMatches: 2,
            pendingActions: 1,
            path: "/rider",
          })
        }

        if (user.roles.includes("driver")) {
          summaries.push({
            id: "driver",
            title: "Driver",
            description: "Provide rides to others",
            icon: <DriverIcon fontSize="large" />,
            activeMatches: 3,
            pendingActions: 2,
            path: "/driver",
          })
        }

        if (user.roles.includes("reviewer")) {
          summaries.push({
            id: "reviewer",
            title: "Reviewer",
            description: "Review academic papers",
            icon: <ReviewerIcon fontSize="large" />,
            activeMatches: 5,
            pendingActions: 3,
            path: "/reviewer",
          })
        }

        if (user.roles.includes("candidate")) {
          summaries.push({
            id: "candidate",
            title: "Candidate",
            description: "Apply for job positions",
            icon: <CandidateIcon fontSize="large" />,
            activeMatches: 4,
            pendingActions: 0,
            path: "/candidate",
          })
        }

        if (user.roles.includes("mentor")) {
          summaries.push({
            id: "mentor",
            title: "Mentor",
            description: "Guide others in their journey",
            icon: <MentorIcon fontSize="large" />,
            activeMatches: 2,
            pendingActions: 1,
            path: "/mentor",
          })
        }

        if (user.roles.includes("mentee")) {
          summaries.push({
            id: "mentee",
            title: "Mentee",
            description: "Receive guidance from mentors",
            icon: <MenteeIcon fontSize="large" />,
            activeMatches: 1,
            pendingActions: 0,
            path: "/mentee",
          })
        }

        setRoleSummaries(summaries)
      } catch (error) {
        console.error("Error fetching role summaries:", error)
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchRoleSummaries()
  }, [user])

  const handleAddRole = () => {
    navigate("/role-selection")
  }

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <Container component="main" className={styles.container}>
        <Box className={styles.welcomeSection}>
          <Typography variant="h4" component="h1" className={styles.welcomeTitle}>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {isConnected ? (
              <span className={styles.connectedStatus}>
                <span className={styles.connectedDot} /> Connected
              </span>
            ) : (
              <span className={styles.disconnectedStatus}>
                <span className={styles.disconnectedDot} /> Offline
              </span>
            )}
          </Typography>
        </Box>

        {isLoadingRoles ? (
          <Box className={styles.loadingRoles}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="textSecondary">
              Loading your roles...
            </Typography>
          </Box>
        ) : roleSummaries.length === 0 ? (
          <Box className={styles.noRoles}>
            <Typography variant="h6" gutterBottom>
              You haven't selected any roles yet
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Select roles to start using the platform
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddRole}>
              Add Roles
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" component="h2" className={styles.sectionTitle}>
              Your Roles
            </Typography>

            <Grid container spacing={3} className={styles.rolesGrid}>
              {roleSummaries.map((role) => (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                  <Card className={styles.roleCard}>
                    <CardContent className={styles.roleCardContent}>
                      <Box className={styles.roleHeader}>
                        <Badge badgeContent={role.pendingActions} color="error" invisible={role.pendingActions === 0}>
                          <Box className={styles.roleIconContainer}>{role.icon}</Box>
                        </Badge>
                        <Box className={styles.roleTitleContainer}>
                          <Typography variant="h6" component="h3" className={styles.roleTitle}>
                            {role.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className={styles.roleDescription}>
                            {role.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className={styles.roleStats}>
                        <Box className={styles.roleStat}>
                          <Typography variant="h5" component="p" className={styles.roleStatValue}>
                            {role.activeMatches}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className={styles.roleStatLabel}>
                            Active Matches
                          </Typography>
                        </Box>
                        <Box className={styles.roleStat}>
                          <Typography variant="h5" component="p" className={styles.roleStatValue}>
                            {role.pendingActions}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className={styles.roleStatLabel}>
                            Pending Actions
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions className={styles.roleCardActions}>
                      <Button variant="contained" color="primary" fullWidth onClick={() => navigate(role.path)}>
                        Go to {role.title} Dashboard
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12} sm={6} md={4}>
                <Card className={`${styles.roleCard} ${styles.addRoleCard}`}>
                  <CardContent className={styles.addRoleCardContent}>
                    <Box className={styles.addRoleIcon}>
                      <AddIcon fontSize="large" />
                    </Box>
                    <Typography variant="h6" component="h3" className={styles.addRoleTitle}>
                      Add New Role
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className={styles.addRoleDescription}>
                      Expand your capabilities by adding more roles
                    </Typography>
                  </CardContent>
                  <CardActions className={styles.roleCardActions}>
                    <Button variant="outlined" color="primary" fullWidth onClick={handleAddRole}>
                      Select Roles
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  )
}

export default Dashboard

