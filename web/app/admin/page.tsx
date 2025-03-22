"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from "@mui/material"
import {
  PeopleAlt as UsersIcon,
  DirectionsCar as RideIcon,
  MenuBook as PaperIcon,
  Work as JobIcon,
  School as MentorshipIcon,
} from "@mui/icons-material"
import { mockAdminStats } from "@/mocks/admin"
import AdminLayout from "@/components/admin/AdminLayout"
import styles from "./admin.module.css"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStats(mockAdminStats)
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box className={styles.container}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
          Overview of platform activity and statistics
        </Typography>

        <Grid container spacing={3} className={styles.statsGrid}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(33, 150, 243, 0.1)" }}>
                  <UsersIcon sx={{ color: "#2196f3" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.usersByRole.rider +
                      stats.usersByRole.driver +
                      stats.usersByRole.reviewer +
                      stats.usersByRole.candidate +
                      stats.usersByRole.mentor +
                      stats.usersByRole.mentee}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Total Users
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                  <RideIcon sx={{ color: "#4caf50" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.matchesByScenario["ride-sharing"]}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Ride Matches
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(156, 39, 176, 0.1)" }}>
                  <PaperIcon sx={{ color: "#9c27b0" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.matchesByScenario["paper-review"]}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Paper Reviews
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(255, 152, 0, 0.1)" }}>
                  <JobIcon sx={{ color: "#ff9800" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.matchesByScenario["job-matching"]}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Job Matches
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(244, 67, 54, 0.1)" }}>
                  <MentorshipIcon sx={{ color: "#f44336" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.matchesByScenario["mentorship"]}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Mentorships
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Box className={styles.statIcon} sx={{ backgroundColor: "rgba(0, 150, 136, 0.1)" }}>
                  <UsersIcon sx={{ color: "#009688" }} />
                </Box>
                <Box className={styles.statInfo}>
                  <Typography variant="h5" className={styles.statValue}>
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className={styles.statLabel}>
                    Active Users
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} className={styles.chartsGrid}>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" className={styles.chartTitle}>
                  Users by Role
                </Typography>
                <Box className={styles.chartContainer}>
                  {/* In a real app, you would use a chart library here */}
                  <Box className={styles.mockChart}>
                    {Object.entries(stats.usersByRole).map(([role, count]: [string, any]) => (
                      <Box key={role} className={styles.mockChartItem}>
                        <Typography variant="body2" className={styles.mockChartLabel}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Typography>
                        <Box className={styles.mockChartBar}>
                          <Box
                            className={styles.mockChartBarFill}
                            sx={{
                              width: `${(count / Object.values(stats.usersByRole).reduce((a: any, b: any) => a + b, 0)) * 100}%`,
                              backgroundColor:
                                role === "rider"
                                  ? "#2196f3"
                                  : role === "driver"
                                    ? "#4caf50"
                                    : role === "reviewer"
                                      ? "#9c27b0"
                                      : role === "candidate"
                                        ? "#ff9800"
                                        : role === "mentor"
                                          ? "#f44336"
                                          : "#009688",
                            }}
                          />
                        </Box>
                        <Typography variant="body2" className={styles.mockChartValue}>
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" className={styles.chartTitle}>
                  Matches by Scenario
                </Typography>
                <Box className={styles.chartContainer}>
                  {/* In a real app, you would use a chart library here */}
                  <Box className={styles.mockChart}>
                    {Object.entries(stats.matchesByScenario).map(([scenario, count]: [string, any]) => (
                      <Box key={scenario} className={styles.mockChartItem}>
                        <Typography variant="body2" className={styles.mockChartLabel}>
                          {scenario
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Typography>
                        <Box className={styles.mockChartBar}>
                          <Box
                            className={styles.mockChartBarFill}
                            sx={{
                              width: `${(count / Object.values(stats.matchesByScenario).reduce((a: any, b: any) => a + b, 0)) * 100}%`,
                              backgroundColor:
                                scenario === "ride-sharing"
                                  ? "#2196f3"
                                  : scenario === "paper-review"
                                    ? "#9c27b0"
                                    : scenario === "job-matching"
                                      ? "#ff9800"
                                      : "#f44336",
                            }}
                          />
                        </Box>
                        <Typography variant="body2" className={styles.mockChartValue}>
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  )
}

