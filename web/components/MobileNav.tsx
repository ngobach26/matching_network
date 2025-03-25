"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material"
import {
  Home as HomeIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  History as HistoryIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Navigation as NavigationIcon,
  WorkHistory as ApplicationsIcon,
} from "@mui/icons-material"
import { useRoleContext, type RoleType } from "@/context/role-context"

export function MobileNav() {
  const router = useRouter()
  const { roles, hasRole } = useRoleContext()
  const [value, setValue] = useState(0)
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null)

  // Get the current role from URL on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab") as RoleType | null

      if (tabParam && hasRole(tabParam)) {
        setCurrentRole(tabParam)
      } else if (roles.length > 0) {
        setCurrentRole(roles[0].type)
      }
    }
  }, [roles, hasRole])

  // Get navigation items based on current role
  const getNavItems = () => {
    if (currentRole === "rider") {
      return [
        { label: "Dashboard", icon: <HomeIcon />, path: "/dashboard?tab=rider" },
        { label: "Request", icon: <LocationOnIcon />, path: "/request-ride" },
        { label: "History", icon: <HistoryIcon />, path: "/ride-history" },
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
      ]
    } else if (currentRole === "driver") {
      return [
        { label: "Dashboard", icon: <HomeIcon />, path: "/dashboard?tab=driver" },
        { label: "Trip", icon: <NavigationIcon />, path: "/active-trip" },
        { label: "Schedule", icon: <ScheduleIcon />, path: "/schedule" },
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
      ]
    } else if (currentRole === "reviewer") {
      return [
        { label: "Dashboard", icon: <HomeIcon />, path: "/dashboard?tab=reviewer" },
        { label: "Papers", icon: <DescriptionIcon />, path: "/assigned-papers" },
        { label: "History", icon: <HistoryIcon />, path: "/review-history" },
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
      ]
    } else if (currentRole === "candidate") {
      return [
        { label: "Dashboard", icon: <HomeIcon />, path: "/dashboard?tab=candidate" },
        { label: "Jobs", icon: <WorkIcon />, path: "/jobs" },
        { label: "Applications", icon: <ApplicationsIcon />, path: "/applications" },
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
      ]
    }

    // Default navigation
    return [
      { label: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
      { label: "Profile", icon: <PersonIcon />, path: "/profile" },
    ]
  }

  const navItems = getNavItems()

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
    router.push(navItems[newValue].path)
  }

  // Don't render if no role is selected
  if (!currentRole) return null

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        zIndex: 1100,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          "& .Mui-selected": {
            color: "primary.main",
          },
        }}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
            sx={{
              minWidth: 0,
              maxWidth: "100%",
              padding: "6px 0",
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}

