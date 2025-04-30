"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type RoleType = "rider" | "driver" | "reviewer" | "candidate"

export interface Role {
  type: RoleType
  isComplete: boolean
  data?: any
}

interface RoleContextType {
  roles: Role[]
  addRole: (role: Role) => void
  updateRole: (type: RoleType, data: any) => void
  removeRole: (type: RoleType) => void
  hasRole: (type: RoleType) => boolean
  getRoleData: (type: RoleType) => any
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])

  // Load roles from localStorage on initial render
  useEffect(() => {
    const savedRoles = localStorage.getItem("userRoles")
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles))
    }
  }, [])

  // Save roles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userRoles", JSON.stringify(roles))
  }, [roles])

  const addRole = (role: Role) => {
    setRoles((prev) => {
      // Check if role already exists
      if (prev.some((r) => r.type === role.type)) {
        return prev.map((r) => (r.type === role.type ? role : r))
      }
      return [...prev, role]
    })
  }

  const updateRole = (type: RoleType, data: any) => {
    setRoles((prev) =>
      prev.map((role) => (role.type === type ? { ...role, data: { ...role.data, ...data }, isComplete: true } : role)),
    )
  }

  const removeRole = (type: RoleType) => {
    setRoles((prev) => prev.filter((role) => role.type !== type))
  }

  const hasRole = (type: RoleType) => {
    return roles.some((role) => role.type === type)
  }

  const getRoleData = (type: RoleType) => {
    const role = roles.find((role) => role.type === type)
    return role?.data
  }

  return (
    <RoleContext.Provider value={{ roles, addRole, updateRole, removeRole, hasRole, getRoleData }}>
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
