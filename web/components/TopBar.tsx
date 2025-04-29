"use client"

import { Button } from "@/components/ui/button"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRoleContext } from "@/context/role-context"
import { useNotification } from "@/context/notification-context"
import { NotificationPanel } from "./NotificationPanel"
import { UserProfileButton } from "./user-profile-button"
import { ThemeToggle } from "./theme-toggle"
import { Search, Notifications as NotificationsIcon, Menu as MenuIcon, KeyboardArrowDown } from "@mui/icons-material"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material"
import { Home, Person, Settings, DirectionsCar, RateReview, School, ExitToApp } from "@mui/icons-material"
import styles from "./TopBar.module.css"
import { authAPI } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

export function TopBar() {
  const { activeRole, roles, setActiveRole } = useRoleContext()
  const { notifications } = useNotification()
  const router = useRouter()

  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRoleMenuAnchor(event.currentTarget)
  }

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null)
  }

  const handleRoleChange = (role: string) => {
    setActiveRole(role)
    handleRoleMenuClose()
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleNotificationToggle = () => {
    setNotificationOpen(!notificationOpen)
  }

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen)
    if (!searchOpen) {
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Mock search results - in a real app, this would call an API
    if (e.target.value.length > 0) {
      setSearchResults([
        { id: "1", name: "John Doe", email: "john@example.com", role: "Rider" },
        { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Driver" },
        { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Admin" },
      ])
    } else {
      setSearchResults([])
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authAPI.logout()

      // Clear local storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")

      // Redirect to login page
      router.push("/")

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error)

      // Even if the API call fails, we should still clear local storage and redirect
      localStorage.removeItem("authToken")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")
      router.push("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getNavItems = () => {
    const commonItems = [
      { text: "Home", icon: <Home />, path: "/dashboard" },
      { text: "Profile", icon: <Person />, path: "/profile" },
      { text: "Settings", icon: <Settings />, path: "/settings" },
    ]

    const roleSpecificItems = {
      Rider: [
        { text: "Request Ride", icon: <DirectionsCar />, path: "/request-ride" },
        { text: "Ride History", icon: <DirectionsCar />, path: "/ride-history" },
      ],
      Driver: [
        { text: "Available Rides", icon: <DirectionsCar />, path: "/available-rides" },
        { text: "My Rides", icon: <DirectionsCar />, path: "/my-rides" },
      ],
      Reviewer: [{ text: "Review Applications", icon: <RateReview />, path: "/review-applications" }],
      Candidate: [{ text: "Application Status", icon: <School />, path: "/application-status" }],
      Admin: [{ text: "Admin Dashboard", icon: <Settings />, path: "/admin" }],
    }

    return [...commonItems, ...((activeRole && roleSpecificItems[activeRole as keyof typeof roleSpecificItems]) || [])]
  }

  const navItems = getNavItems()

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component="a"
            href={item.path}
            sx={{
              display: "flex",
              alignItems: "center",
              "& .MuiListItemIcon-root": {
                minWidth: "40px",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={handleLogout}
          disabled={isLoggingOut}
          sx={{
            display: "flex",
            alignItems: "center",
            "& .MuiListItemIcon-root": {
              minWidth: "40px",
            },
          }}
        >
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary={isLoggingOut ? "Logging out..." : "Logout"} />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static" className={styles.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RideShare
          </Typography>

          {roles.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Button
                onClick={handleRoleMenuOpen}
                color="inherit"
                endIcon={<KeyboardArrowDown />}
                sx={{ textTransform: "none" }}
              >
                {activeRole || "Select Role"}
              </Button>
              <Menu anchorEl={roleMenuAnchor} open={Boolean(roleMenuAnchor)} onClose={handleRoleMenuClose}>
                {roles.map((role) => (
                  <MenuItem key={role} onClick={() => handleRoleChange(role)} selected={role === activeRole}>
                    {role}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          <IconButton color="inherit" onClick={handleSearchToggle}>
            <Search />
          </IconButton>

          <IconButton color="inherit" onClick={handleNotificationToggle}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <UserProfileButton />
          </Box>

          <Box sx={{ ml: 2 }}>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      <NotificationPanel open={notificationOpen} onClose={() => setNotificationOpen(false)} />

      <Dialog open={searchOpen} onClose={handleSearchToggle} fullWidth maxWidth="sm">
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search users, rides, etc."
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <List sx={{ mt: 2 }}>
            {searchResults.map((result) => (
              <ListItem button key={result.id} component="a" href={`/user/${result.id}`}>
                <ListItemText
                  primary={result.name}
                  secondary={
                    <Typography component="span" variant="body2" color="textSecondary">
                      {result.email} • {result.role}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add default export for TopBar
export default TopBar
