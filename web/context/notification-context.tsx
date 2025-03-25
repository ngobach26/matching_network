"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { format } from "date-fns"

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: "ride" | "review" | "job" | "profile" | "system"
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Initial mock notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Ride Request",
    message: "You have a new ride request from Downtown to Airport.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    type: "ride",
    actionUrl: "/dashboard?tab=driver",
  },
  {
    id: "2",
    title: "Paper Review Due",
    message: 'Your review for "Machine Learning Applications" is due tomorrow.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    type: "review",
    actionUrl: "/dashboard?tab=reviewer",
  },
  {
    id: "3",
    title: "Job Match Found",
    message: "We found a new job that matches your profile: Senior Developer at TechCorp.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: true,
    type: "job",
    actionUrl: "/dashboard?tab=candidate",
  },
  {
    id: "4",
    title: "Profile Viewed",
    message: "Your profile was viewed by 3 potential employers this week.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    type: "profile",
    actionUrl: "/profile",
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Load notifications from localStorage on initial render
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        // Convert string timestamps back to Date objects
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
        setNotifications(withDates)
      } catch (error) {
        console.error("Failed to parse notifications from localStorage", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
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

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
  }

  // Remove a specific notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

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

