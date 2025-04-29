"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { format } from "date-fns"

// Define the notification type
export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  timestamp: Date
  actionUrl?: string
}

// Define the context type
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Create a provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications)
          // Convert string timestamps back to Date objects
          const formattedNotifications = parsedNotifications.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp),
          }))
          setNotifications(formattedNotifications)
        } catch (error) {
          console.error("Failed to parse notifications from localStorage:", error)
        }
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  // Add a new notification
  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("notifications")
    }
  }

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Create a hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

// Add this alias for backward compatibility
export const useNotification = useNotifications

// Helper function to format notification time
export function formatNotificationTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)} hr ago`
  } else if (diffInMinutes < 48 * 60) {
    return "Yesterday"
  } else {
    return format(date, "MMM d")
  }
}
