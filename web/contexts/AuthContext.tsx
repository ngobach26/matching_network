"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { mockUsers } from "@/mocks/users"

interface User {
  id: string
  name: string
  email: string
  roles: string[]
  isAdmin: boolean
  profileCompleted: {
    [key: string]: boolean
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  addRole: (role: string) => Promise<void>
  removeRole: (role: string) => Promise<void>
  setRoleProfileCompleted: (role: string, completed: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Mock login - find user by email
      const foundUser = mockUsers.find((u) => u.email === email)

      if (!foundUser) {
        throw new Error("Invalid credentials")
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem("user", JSON.stringify(foundUser))
      setUser(foundUser)

      // Redirect based on user state
      if (foundUser.roles.length === 0) {
        router.push("/role-selection")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        roles: [],
        isAdmin: false,
        profileCompleted: {},
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      router.push("/role-selection")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const addRole = async (role: string) => {
    try {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedRoles = [...user.roles, role]
        const updatedUser = {
          ...user,
          roles: updatedRoles,
          profileCompleted: {
            ...user.profileCompleted,
            [role]: false,
          },
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Error adding role:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeRole = async (role: string) => {
    try {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedRoles = user.roles.filter((r) => r !== role)
        const updatedProfileCompleted = { ...user.profileCompleted }
        delete updatedProfileCompleted[role]

        const updatedUser = {
          ...user,
          roles: updatedRoles,
          profileCompleted: updatedProfileCompleted,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Error removing role:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const setRoleProfileCompleted = (role: string, completed: boolean) => {
    if (user) {
      const updatedUser = {
        ...user,
        profileCompleted: {
          ...user.profileCompleted,
          [role]: completed,
        },
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        addRole,
        removeRole,
        setRoleProfileCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

