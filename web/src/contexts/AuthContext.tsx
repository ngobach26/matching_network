"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { useSnackbar } from "./SnackbarContext"

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
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/auth/me")
          setUser(response.data)
        }
      } catch (error) {
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      // Redirect based on user state
      if (user.roles.length === 0) {
        navigate("/role-selection")
      } else {
        navigate("/dashboard")
      }

      showSnackbar("Login successful", "success")
    } catch (error) {
      showSnackbar("Login failed. Please check your credentials.", "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/auth/register", { name, email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      navigate("/role-selection")
      showSnackbar("Registration successful", "success")
    } catch (error) {
      showSnackbar("Registration failed. Please try again.", "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    navigate("/login")
    showSnackbar("Logged out successfully", "success")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const addRole = async (role: string) => {
    try {
      setIsLoading(true)
      await api.post("/users/roles", { role })

      if (user) {
        const updatedRoles = [...user.roles, role]
        setUser({
          ...user,
          roles: updatedRoles,
          profileCompleted: {
            ...user.profileCompleted,
            [role]: false,
          },
        })
      }

      showSnackbar(`${role} role added successfully`, "success")
    } catch (error) {
      showSnackbar(`Failed to add ${role} role`, "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeRole = async (role: string) => {
    try {
      setIsLoading(true)
      await api.delete(`/users/roles/${role}`)

      if (user) {
        const updatedRoles = user.roles.filter((r) => r !== role)
        const updatedProfileCompleted = { ...user.profileCompleted }
        delete updatedProfileCompleted[role]

        setUser({
          ...user,
          roles: updatedRoles,
          profileCompleted: updatedProfileCompleted,
        })
      }

      showSnackbar(`${role} role removed successfully`, "success")
    } catch (error) {
      showSnackbar(`Failed to remove ${role} role`, "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const setRoleProfileCompleted = (role: string, completed: boolean) => {
    if (user) {
      setUser({
        ...user,
        profileCompleted: {
          ...user.profileCompleted,
          [role]: completed,
        },
      })
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

