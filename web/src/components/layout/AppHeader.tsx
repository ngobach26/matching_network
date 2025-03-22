"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as DriverIcon,
  EmojiPeople as RiderIcon,
  MenuBook as ReviewerIcon,
  Work as CandidateIcon,
  School as MentorIcon,
  Person as MenteeIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import styles from "./AppHeader.module.css"

interface AppHeaderProps {
  title: string
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const drawerItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    ...(user?.roles.includes("rider") ? [{ text: "Rider", icon: <RiderIcon />, path: "/rider" }] : []),
    ...(user?.roles.includes("driver") ? [{ text: "Driver", icon: <DriverIcon />, path: "/driver" }] : []),
    ...(user?.roles.includes("reviewer") ? [{ text: "Reviewer", icon: <ReviewerIcon />, path: "/reviewer" }] : []),
    ...(user?.roles.includes("candidate") ? [{ text: "Candidate", icon: <CandidateIcon />, path: "/candidate" }] : []),
    ...(user?.roles.includes("mentor") ? [{ text: "Mentor", icon: <MentorIcon />, path: "/mentor" }] : []),
    ...(user?.roles.includes("mentee") ? [{ text: "Mentee", icon: <MenteeIcon />, path: "/mentee" }] : []),
  ]

  const accountItems = [
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ...(user?.isAdmin ? [{ text: "Admin", icon: <AdminIcon />, path: "/admin" }] : []),
  ]

  const drawer = (
    <Box className={styles.drawer}>
      <Box className={styles.drawerHeader}>
        <Avatar className={styles.drawerAvatar}>{user?.name.charAt(0) || "U"}</Avatar>
        <Typography variant="h6" className={styles.drawerUserName}>
          {user?.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.email}
        </Typography>
      </Box>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem button key={item.text} onClick={() => handleNavigate(item.path)} className={styles.drawerItem}>
            <ListItemIcon className={styles.drawerItemIcon}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {accountItems.map((item) => (
          <ListItem button key={item.text} onClick={() => handleNavigate(item.path)} className={styles.drawerItem}>
            <ListItemIcon className={styles.drawerItemIcon}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout} className={styles.drawerItem}>
          <ListItemIcon className={styles.drawerItemIcon}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static" color="default" elevation={1} className={styles.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={styles.title}>
            {title}
          </Typography>
          <div className={styles.grow} />
          <IconButton color="inherit" onClick={handleNotificationsMenuOpen}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton edge="end" color="inherit" onClick={handleProfileMenuOpen} className={styles.profileButton}>
            <Avatar className={styles.avatar}>{user?.name.charAt(0) || "U"}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle} classes={{ paper: styles.drawerPaper }}>
        {drawer}
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className={styles.profileMenu}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate("/settings")
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        {user?.isAdmin && (
          <MenuItem
            onClick={() => {
              handleMenuClose()
              navigate("/admin")
            }}
          >
            <ListItemIcon>
              <AdminIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationsAnchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsMenuClose}
        className={styles.notificationsMenu}
      >
        <MenuItem onClick={handleNotificationsMenuClose}>
          <Typography variant="body2">New ride request from Alex</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationsMenuClose}>
          <Typography variant="body2">Paper review assigned: "Machine Learning Techniques"</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationsMenuClose}>
          <Typography variant="body2">New job match: Software Engineer at TechCorp</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleNotificationsMenuClose()
            navigate("/notifications")
          }}
        >
          <Typography variant="body2" color="primary">
            See all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

export default AppHeader

