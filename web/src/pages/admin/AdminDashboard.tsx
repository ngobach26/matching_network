"use client"

import type React from "react"
import { useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import AdminOverview from "./AdminOverview"
import UserManagement from "./UserManagement"
import EntityManagement from "./EntityManagement"
import MatchingConfiguration from "./MatchingConfiguration"
import ManualMatching from "./ManualMatching"
import NotificationCenter from "./NotificationCenter"
import styles from "./AdminDashboard.module.css"

const drawerWidth = 240

const AdminDashboard: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/admin" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Entities", icon: <AssignmentIcon />, path: "/admin/entities" },
    { text: "Matching Config", icon: <TuneIcon />, path: "/admin/matching-config" },
    { text: "Manual Matching", icon: <SettingsIcon />, path: "/admin/manual-matching" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/admin/notifications" },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <div>
      <Box className={styles.drawerHeader}>
        <Typography variant="h6" className={styles.drawerTitle}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.name}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            className={location.pathname === item.path ? styles.activeMenuItem : ""}
          >
            <ListItemIcon className={location.pathname === item.path ? styles.activeIcon : ""}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box className={styles.root}>
      <AppBar
        position="fixed"
        className={styles.appBar}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={styles.menuButton}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find((item) => item.path === location.pathname)?.text || "Admin Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        className={styles.content}
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/entities" element={<EntityManagement />} />
          <Route path="/matching-config" element={<MatchingConfiguration />} />
          <Route path="/manual-matching" element={<ManualMatching />} />
          <Route path="/notifications" element={<NotificationCenter />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default AdminDashboard

