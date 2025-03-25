"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Box,
  Divider,
  ListItemAvatar,
  Avatar,
  useTheme,
  ListItemSecondaryAction,
  Tooltip,
} from "@mui/material"
import {
  Notifications as NotificationsIcon,
  DirectionsCar as CarIcon,
  Description as FileIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { useNotifications, formatNotificationTime } from "@/context/notification-context"

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const router = useRouter()
  const theme = useTheme()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
    handleClose()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ride":
        return <CarIcon sx={{ color: theme.palette.primary.main }} />
      case "review":
        return <FileIcon sx={{ color: theme.palette.info.main }} />
      case "job":
        return <WorkIcon sx={{ color: theme.palette.success.main }} />
      case "profile":
        return <PersonIcon sx={{ color: theme.palette.secondary.main }} />
      default:
        return <InfoIcon sx={{ color: theme.palette.warning.main }} />
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? "notifications-popover" : undefined

  return (
    <>
      <IconButton aria-describedby={id} onClick={handleClick} color="inherit" size="large">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            maxHeight: 500,
            mt: 1.5,
            overflow: "hidden",
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: theme.palette.mode === "dark" ? "background.paper" : "primary.light",
            color: theme.palette.mode === "dark" ? "text.primary" : "primary.contrastText",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }} color="inherit">
              Mark all read
            </Button>
            <Button size="small" onClick={clearAll} color="inherit">
              Clear all
            </Button>
          </Box>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List
            sx={{
              p: 0,
              maxHeight: 400,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "0.4em",
              },
              "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
                webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,.1)",
                borderRadius: "10px",
              },
            }}
          >
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                alignItems="flex-start"
                component="button"
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  bgcolor: notification.read
                    ? "transparent"
                    : theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 140, 0, 0.05)",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 140, 0, 0.1)",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "transparent" }}>{getNotificationIcon(notification.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  primaryTypographyProps={{
                    variant: "subtitle2",
                    sx: {
                      fontWeight: notification.read ? "normal" : "bold",
                      color: notification.read ? "text.primary" : "primary.main",
                    },
                  }}
                  secondary={
                    <>
                      <Box component="span" sx={{ display: "block", mb: 0.5 }}>
                        {notification.message}
                      </Box>
                      <Box component="span" sx={{ typography: "caption", color: "text.secondary" }}>
                        {formatNotificationTime(notification.timestamp)}
                      </Box>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {!notification.read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}

