"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { userAPI } from "@/lib/api-client"

export type RoleType = "rider" | "driver" | "reviewer" | "candidate"

export interface Role {
  type: RoleType
  isComplete: boolean
  data?: any
}

type RoleContextType = {
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  hasRole: (roleType: RoleType) => boolean
  addRole: (role: Role) => void
  removeRole: (roleType: RoleType) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    // Load roles from localStorage on initial render
    const storedRoles = localStorage.getItem("userRoles")

    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles)
        setRoles(parsedRoles)
      } catch (error) {
        console.error("Error parsing stored roles:", error)
      }
    }

    // Fetch roles from API if user is logged in
    const fetchRoles = async () => {
      const token = localStorage.getItem("authToken")
      const user = localStorage.getItem("user")

      if (token && user) {
        try {
          const userData = JSON.parse(user)
          const response = await userAPI.getRoles(userData.id)

          if (response && response.roles) {
            setRoles(response.roles)
            localStorage.setItem("userRoles", JSON.stringify(response.roles))
          }
        } catch (error) {
          console.error("Error fetching roles:", error)
        }
      }
    }

    fetchRoles()
  }, [])

  const hasRole = (roleType: RoleType): boolean => {
    return roles.some((role) => role.type === roleType)
  }

  const addRole = (role: Role) => {
    setRoles((prev) => {
      const newRoles = [...prev, role]
      localStorage.setItem("userRoles", JSON.stringify(newRoles))
      return newRoles
    })
  }

  const removeRole = (roleType: RoleType) => {
    setRoles((prev) => {
      const newRoles = prev.filter((role) => role.type !== roleType)
      localStorage.setItem("userRoles", JSON.stringify(newRoles))
      return newRoles
    })
  }

  return (
    <RoleContext.Provider
      value={{
        roles,
        setRoles,
        hasRole,
        addRole,
        removeRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRoleContext() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRoleContext must be used within a RoleProvider")
  }
  return context
}
