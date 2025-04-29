"use client"

import React from "react"
import { Drawer, Box, Typography, List, ListItem, ListItemText, IconButton, Divider, Button } from "@mui/material"
import { Close as CloseIcon, CheckCircle, Info, Warning, Error } from "@mui/icons-material"
import { useNotifications } from "@/context/notification-context"

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications()

  const getIconByType = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle color="success" />
      case "warning":
        return <Warning color="warning" />
      case "error":
        return <Error color="error" />
      default:
        return <Info color="info" />
    }
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {notifications.length > 0 ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Button size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
              <Button size="small" color="error" onClick={clearAllNotifications}>
                Clear all
              </Button>
            </Box>

            <List sx={{ maxHeight: "calc(100vh - 120px)", overflow: "auto" }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: notification.read ? "transparent" : "action.hover",
                      borderRadius: 1,
                    }}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <Box sx={{ mr: 1, mt: 0.5 }}>{getIconByType(notification.type)}</Box>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          <Typography component="div" variant="caption" color="text.secondary">
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default NotificationPanel
