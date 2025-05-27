"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchDriverProfile } from "@/lib/redux/slices/driverSlice"

export type Role = "rider" | "driver" | "reviewer" | "candidate"

interface RoleContextType {
  roles: Role[]
  loadRoles: (userId: number) => Promise<void>
  hasRole: (role: Role) => boolean
  addRole: (role: Role) => void
  removeRole: (role: Role) => void
  getRoleData: (role: Role) => any // Add this function
  updateRole?: (role: Role, data: any) => void // Make this optional
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])
  const dispatch = useAppDispatch()
  const { userId } = useAppSelector((state) => state.user)
  const { profile: driverProfile, vehicle: driverVehicle } = useAppSelector((state) => state.driver)

  // Load roles when userId changes
  useEffect(() => {
    if (userId) {
      loadRoles(userId)
    }
  }, [userId])

  // Update roles based on profiles in Redux
  useEffect(() => {
    const newRoles: Role[] = []

    if (driverProfile) {
      newRoles.push("driver")
    }

    // Only update if there are changes to avoid infinite loops
    if (newRoles.length > 0 && !newRoles.every((role) => roles.includes(role))) {
      setRoles((prevRoles) => {
        const filteredRoles = prevRoles.filter((role) => role !== "driver" && role !== "rider")
        return [...filteredRoles, ...newRoles]
      })
    }
  }, [driverProfile, roles])

  const loadRoles = async (userId: number) => {
    try {
      // Fetch driver and rider profiles from API
      dispatch(fetchDriverProfile())

      // Note: This is a simplified implementation
      // In a real app, you might need to fetch other roles as well
    } catch (error) {
      console.error("Error loading roles:", error)
    }
  }

  const hasRole = (role: Role): boolean => {
    return roles.includes(role)
  }

  const addRole = (role: Role) => {
    if (!roles.includes(role)) {
      setRoles([...roles, role])
    }
  }

  const removeRole = (role: Role) => {
    setRoles(roles.filter((r) => r !== role))
  }

  // Add the getRoleData function
  const getRoleData = (role: Role) => {
    // if (role === "rider") {
    //   return riderProfile
    // }
    if (role === "driver") {
      // Combine driver profile with vehicle data to match the expected format
      if (driverProfile && driverVehicle) {
        return {
          ...driverProfile,
          vehicle: driverVehicle,
        }
      }
      return driverProfile
    }
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
