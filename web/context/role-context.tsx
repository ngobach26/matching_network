"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchDriverProfile } from "@/lib/redux/slices/driverSlice"

// Các role hiện có
export type Role = "rider" | "driver" | "reviewer" | "candidate"

interface RoleContextType {
  roles: Role[]
  loadRoles: (userId: number) => Promise<void>
  hasRole: (role: Role) => boolean
  addRole: (role: Role) => void
  removeRole: (role: Role) => void
  getRoleData: (role: Role) => any
  updateRole?: (role: Role, data: any) => void // Make this optional
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])
  const dispatch = useAppDispatch()
  const { userId } = useAppSelector((state) => state.user)
  const { driverProfile } = useAppSelector((state) => state.driver)

  // Load roles when userId changes
  useEffect(() => {
    if (userId) {
      loadRoles(userId)
    }
    // eslint-disable-next-line
  }, [userId])

  // Update roles based on profiles in Redux
  useEffect(() => {
    const newRoles: Role[] = []
    if (driverProfile) newRoles.push("driver")
    // ... handle other roles if you support
    if (
      newRoles.length > 0 &&
      !newRoles.every((role) => roles.includes(role))
    ) {
      setRoles((prevRoles) => {
        const filteredRoles = prevRoles.filter((role) => !["driver", "rider"].includes(role))
        return [...filteredRoles, ...newRoles]
      })
    }
  }, [driverProfile, roles])

  const loadRoles = async (userId: number) => {
    try {
      // Fetch driver profile; add others as needed
      await dispatch(fetchDriverProfile())
    } catch (error) {
      console.error("Error loading roles:", error)
    }
  }

  const hasRole = (role: Role): boolean => roles.includes(role)
  const addRole = (role: Role) => {
    if (!roles.includes(role)) setRoles([...roles, role])
  }
  const removeRole = (role: Role) => {
    setRoles(roles.filter((r) => r !== role))
  }

  // ĐÃ SỬA: driverProfile luôn có vehicle (không cần merge vehicle nữa)
  const getRoleData = (role: Role) => {
    if (role === "driver") return driverProfile
    // ... handle other roles (rider, reviewer, candidate) if bạn support
    return null
  }

  return (
    <RoleContext.Provider value={{ roles, loadRoles, hasRole, addRole, removeRole, getRoleData }}>
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

export type RoleType = Role
