"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  Box,
  Drawer,
  ListItemIcon,
  useMediaQuery,
  Tabs,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Description as FileIcon,
  Work as WorkIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  LocalTaxi as TaxiIcon,
  Assignment as AssignmentIcon,
  WorkHistory as WorkHistoryIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown,
} from "@mui/icons-material"
import { useRoleContext, type RoleType } from "@/context/role-context"
import { getUsersByRole } from "@/data/users"
import NotificationPanel from "./NotificationPanel"

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
}))

const Logo = styled(Link)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  color: theme.palette.primary.main,
  fontWeight: "bold",
  fontSize: "1.25rem",
}))

const NavTabs = styled(Tabs)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  "& .MuiTab-root": {
    minWidth: "auto",
    padding: theme.spacing(1, 2),
    textTransform: "none",
  },
}))

interface TopBarProps {
  toggleTheme: () => void
  isDarkMode: boolean
}

export default function TopBar({ toggleTheme, isDarkMode }: TopBarProps) {
  const router = useRouter()
  const { roles, hasRole } = useRoleContext()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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

  // Update navigation tabs based on current role
  useEffect(() => {
    if (currentRole) {
      setActiveTab(0) // Reset to first tab when role changes
    }
  }, [currentRole])

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRoleMenuAnchor(event.currentTarget)
  }

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleRoleSelect = (role: RoleType) => {
    handleRoleMenuClose()
    setCurrentRole(role)
    setActiveTab(0) // Reset to first tab when role changes

    if (hasRole(role)) {
      router.push(`/dashboard?tab=${role}`)
    } else {
      router.push("/profile")
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    // Simulate search with mock data
    const results: any[] = []

    // Search users by role
    for (const role of ["rider", "driver", "reviewer", "candidate"] as RoleType[]) {
      const usersByRole = getUsersByRole(role).filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      results.push(...usersByRole.filter((user) => !results.some((r) => r.id === user.id)))
    }

    setSearchResults(results)
    setSearchDialogOpen(true)
  }

  const handleUserClick = (userId: string) => {
    setSearchDialogOpen(false)
    router.push(`/user/${userId}`)
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)

    // Navigate based on role and tab
    if (currentRole === "rider") {
      switch (newValue) {
        case 0:
          router.push("/dashboard?tab=rider")
          break
        case 1:
          router.push("/request-ride")
          break
        case 2:
          router.push("/ride-history")
          break
        case 3:
          router.push("/profile")
          break
      }
    } else if (currentRole === "driver") {
      switch (newValue) {
        case 0:
          router.push("/dashboard?tab=driver")
          break
        case 1:
          router.push("/active-trip")
          break
        case 2:
          router.push("/availability")
          break
        case 3:
          router.push("/profile")
          break
      }
    } else if (currentRole === "reviewer") {
      switch (newValue) {
        case 0:
          router.push("/dashboard?tab=reviewer")
          break
        case 1:
          router.push("/assignments")
          break
        case 2:
          router.push("/review-history")
          break
        case 3:
          router.push("/profile")
          break
      }
    } else if (currentRole === "candidate") {
      switch (newValue) {
        case 0:
          router.push("/dashboard?tab=candidate")
          break
        case 1:
          router.push("/jobs")
          break
        case 2:
          router.push("/applications")
          break
        case 3:
          router.push("/profile")
          break
      }
    }
  }

  // Get navigation items based on current role
  const getNavItems = () => {
    if (currentRole === "rider") {
      return [
        { label: "Dashboard", icon: <DashboardIcon /> },
        { label: "Request Ride", icon: <TaxiIcon /> },
        { label: "History", icon: <HistoryIcon /> },
        { label: "Profile", icon: <PersonIcon /> },
      ]
    } else if (currentRole === "driver") {
      return [
        { label: "Dashboard", icon: <DashboardIcon /> },
        { label: "Trip", icon: <CarIcon /> },
        { label: "Availability", icon: <SettingsIcon /> },
        { label: "Profile", icon: <PersonIcon /> },
      ]
    } else if (currentRole === "reviewer") {
      return [
        { label: "Dashboard", icon: <DashboardIcon /> },
        { label: "Assignments", icon: <AssignmentIcon /> },
        { label: "History", icon: <HistoryIcon /> },
        { label: "Profile", icon: <PersonIcon /> },
      ]
    } else if (currentRole === "candidate") {
      return [
        { label: "Dashboard", icon: <DashboardIcon /> },
        { label: "Jobs", icon: <WorkIcon /> },
        { label: "Applications", icon: <WorkHistoryIcon /> },
        { label: "Profile", icon: <PersonIcon /> },
      ]
    }

    // Default navigation
    return [
      { label: "Dashboard", icon: <DashboardIcon /> },
      { label: "Profile", icon: <PersonIcon /> },
    ]
  }

  const navItems = getNavItems()

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Logo href="/dashboard">
          <CarIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6">RideShare</Typography>
        </Logo>
      </Box>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          <ListItem
            component="button"
            key={item.label}
            onClick={() => handleTabChange({} as React.SyntheticEvent, index)}
            selected={activeTab === index}
            sx={{ width: "100%", textAlign: "left" }}
          >
            <ListItemIcon sx={{ color: activeTab === index ? "primary.main" : "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                color: activeTab === index ? "primary" : "inherit",
                fontWeight: activeTab === index ? "bold" : "normal",
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem component="button" onClick={() => router.push("/admin")} sx={{ width: "100%", textAlign: "left" }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Admin" />
        </ListItem>
        <ListItem component="button" onClick={toggleTheme} sx={{ width: "100%", textAlign: "left" }}>
          <ListItemIcon>{isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText primary={isDarkMode ? "Light Mode" : "Dark Mode"} />
        </ListItem>
        <ListItem component="button" onClick={handleLogout} sx={{ width: "100%", textAlign: "left" }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <StyledAppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Logo href="/dashboard">
            <CarIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
              RideShare
            </Typography>
          </Logo>

          {/* Desktop Navigation Tabs - Role-specific */}
          {currentRole && !isMobile && (
            <Box sx={{ ml: 4, display: { xs: "none", md: "flex" } }}>
              {navItems.map((item, index) => (
                <Button
                  key={item.label}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleTabChange({} as React.SyntheticEvent, index)}
                  sx={{
                    mx: 1,
                    textTransform: "none",
                    fontWeight: activeTab === index ? "bold" : "normal",
                    borderBottom: activeTab === index ? "2px solid" : "none",
                    borderColor: "primary.main",
                    borderRadius: 0,
                    pb: 0.5,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Search Field - Desktop Only */}
            <TextField
              placeholder="Search users..."
              size="small"
              sx={{
                width: 200,
                display: { xs: "none", md: "block" },
                mr: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* Search Icon - Mobile Only */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setSearchDialogOpen(true)}
            >
              <SearchIcon />
            </IconButton>

            {/* Notification Panel */}
            <NotificationPanel />

            {/* Theme Toggle */}
            <IconButton color="inherit" onClick={toggleTheme} sx={{ display: { xs: "none", md: "flex" } }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Role Selector Button */}
            <Button
              variant="outlined"
              onClick={handleRoleMenuOpen}
              color="primary"
              endIcon={<KeyboardArrowDown />}
              sx={{
                display: { xs: "none", sm: "flex" },
                textTransform: "none",
                borderRadius: "20px",
                px: 2,
              }}
            >
              {currentRole ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {currentRole === "rider" && <PersonIcon sx={{ mr: 1, fontSize: 20 }} />}
                  {currentRole === "driver" && <CarIcon sx={{ mr: 1, fontSize: 20 }} />}
                  {currentRole === "reviewer" && <FileIcon sx={{ mr: 1, fontSize: 20 }} />}
                  {currentRole === "candidate" && <WorkIcon sx={{ mr: 1, fontSize: 20 }} />}
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                </Box>
              ) : (
                "Select Role"
              )}
              {roles.length > 0 && <Badge badgeContent={roles.length} color="secondary" sx={{ ml: 1 }} />}
            </Button>

            {/* User Avatar */}
            <IconButton onClick={handleUserMenuOpen} size="small" edge="end" color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      {/* Role Selection Menu */}
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={handleRoleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, width: 200 },
        }}
      >
        {hasRole("rider") && (
          <MenuItem onClick={() => handleRoleSelect("rider")}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rider</ListItemText>
          </MenuItem>
        )}
        {hasRole("driver") && (
          <MenuItem onClick={() => handleRoleSelect("driver")}>
            <ListItemIcon>
              <CarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Driver</ListItemText>
          </MenuItem>
        )}
        {hasRole("reviewer") && (
          <MenuItem onClick={() => handleRoleSelect("reviewer")}>
            <ListItemIcon>
              <FileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reviewer</ListItemText>
          </MenuItem>
        )}
        {hasRole("candidate") && (
          <MenuItem onClick={() => handleRoleSelect("candidate")}>
            <ListItemIcon>
              <WorkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Candidate</ListItemText>
          </MenuItem>
        )}
        {roles.length === 0 && <MenuItem onClick={() => router.push("/profile")}>Add your first role</MenuItem>}
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            router.push("/profile")
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            router.push("/dashboard")
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            router.push("/admin")
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Search Results
          <TextField
            autoFocus
            margin="dense"
            placeholder="Search users..."
            fullWidth
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button onClick={handleSearch}>Search</Button>
                </InputAdornment>
              ),
            }}
          />
        </DialogTitle>
        <DialogContent dividers>
          {searchResults.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
              No results found. Try a different search term.
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {searchResults.map((user) => (
                <ListItem
                  button
                  key={user.id}
                  divider
                  onClick={() => handleUserClick(user.id)}
                  sx={{ width: "100%", textAlign: "left" }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatarUrl || undefined}>{user.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.roles.map((role: any) => role.type).join(", ")} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

