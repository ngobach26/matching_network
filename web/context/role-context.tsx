"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, userAPI } from "@/lib/api-client"

export type RoleType = "rider" | "driver" | "reviewer" | "candidate"

export interface Role {
  type: RoleType
  isComplete: boolean
  data?: any
}

type RoleContextType = {
  roles: Role[]
  setRoleList: (roles: Role[] | RoleType[]) => void
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
          const response = await authAPI.getCurrentUser()

          if (response && response.user.roles) {
            setRoles(response.user.roles)
            localStorage.setItem("userRoles", JSON.stringify(response.user.roles))
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

  const setRoleList = (rolesOrTypes: Role[] | RoleType[]) => {
    const roles = typeof rolesOrTypes[0] === "string"
      ? (rolesOrTypes as RoleType[]).map(createRoleFromType)
      : (rolesOrTypes as Role[])
  
    setRoles(roles)
    localStorage.setItem("userRoles", JSON.stringify(roles))
  }
  
  const addRole = (roleOrType: Role | RoleType) => {
    const role = typeof roleOrType === "string" ? createRoleFromType(roleOrType) : roleOrType
  
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

  function createRoleFromType(roleType: RoleType): Role {
    return {
      type: roleType,
      isComplete: false,
      data: {},
    }
  }
  

  return (
    <RoleContext.Provider
      value={{
        roles,
        setRoleList,
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
