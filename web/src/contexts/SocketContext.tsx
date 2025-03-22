"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"
import { useSnackbar } from "./SnackbarContext"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { showSnackbar } = useSnackbar()

  const connect = () => {
    if (!isAuthenticated || !user) return

    const token = localStorage.getItem("token")
    if (!token) return

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      setIsConnected(true)
      console.log("Socket connected")
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
      console.log("Socket disconnected")
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
      showSnackbar("Connection error. Please try again.", "error")
    })

    // Handle notifications
    newSocket.on("notification", (data) => {
      showSnackbar(data.message, data.type || "info")
    })

    setSocket(newSocket)
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>{children}</SocketContext.Provider>
  )
}

