"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Typography, Box, CircularProgress } from "@mui/material"
import { useRoleContext } from "@/context/role-context"
import { RiderDashboard } from "@/components/dashboards/rider-dashboard"
import { DriverDashboard } from "@/components/dashboards/driver-dashboard"
import { ReviewerDashboard } from "@/components/dashboards/reviewer-dashboard"
import { CandidateDashboard } from "@/components/dashboards/candidate-dashboard"
import TopBar from "@/components/TopBar"
import { useTheme } from "@/components/ThemeProvider"
import styles from "./Dashboard.module.css"
import { MobileNav } from "@/components/MobileNav"

export default function DashboardClient() {
  const { roles, hasRole } = useRoleContext()
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  // Get URL search params on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(new URLSearchParams(window.location.search))
      setLoading(false)
    }
  }, [])

  // Set the active tab based on URL params and available roles
  useEffect(() => {
    if (!searchParams) return

    const tabParam = searchParams.get("tab")

    if (tabParam && hasRole(tabParam as any)) {
      setActiveTab(tabParam)
    } else if (hasRole("rider")) {
      setActiveTab("rider")
    } else if (hasRole("driver")) {
      setActiveTab("driver")
    } else if (hasRole("reviewer")) {
      setActiveTab("reviewer")
    } else if (hasRole("candidate")) {
      setActiveTab("candidate")
    } else {
      setActiveTab("rider")
    }
  }, [searchParams, hasRole, roles])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)

    // Update URL without full page reload
    const url = new URL(window.location.href)
    url.searchParams.set("tab", newValue)
    window.history.pushState({}, "", url)
  }

  // Redirect to profile if no roles
  useEffect(() => {
    if (!loading && roles.length === 0) {
      router.push("/profile")
    }
  }, [roles, router, loading])

  if (loading || roles.length === 0 || !activeTab) {
    return (
      <>
        <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
        </Box>
      </>
    )
  }

  return (
    <>
      <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography variant="h4">Dashboard</Typography>
        </div>

        <div className={styles.contentContainer}>
          {activeTab === "rider" && <RiderDashboard />}
          {activeTab === "driver" && <DriverDashboard />}
          {activeTab === "reviewer" && <ReviewerDashboard />}
          {activeTab === "candidate" && <CandidateDashboard />}
        </div>
      </div>
      <MobileNav />
    </>
  )
}
