"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { authAPI, type UserProfile } from "@/lib/api-client"

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    // If we have a session, update localStorage for backward compatibility
    if (isAuthenticated) {
      localStorage.setItem("isLoggedIn", "true")
    }
  }, [isAuthenticated])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !userProfile && !profileLoading) {
      fetchUserProfile()
    }
  }, [isAuthenticated, userProfile, profileLoading])

  const fetchUserProfile = async () => {
    if (!isAuthenticated) return null

    setProfileLoading(true)
    setProfileError(null)

    try {
      const profile = await authAPI.getCurrentUser()
      setUserProfile(profile)
      return profile
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
      setProfileError(error.message || "Failed to fetch user profile")
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  const updateUserProfile = async (userData: Partial<UserProfile>) => {
    if (!isAuthenticated) return null

    setProfileLoading(true)
    setProfileError(null)

    try {
      const updatedProfile = await authAPI.updateProfile(userData)
      setUserProfile(updatedProfile)

      // Update the session with new user data if name changed
      if (userData.name && userData.name !== session?.user?.name) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: userData.name,
          },
        })
      }

      return updatedProfile
    } catch (error: any) {
      console.error("Error updating user profile:", error)
      setProfileError(error.message || "Failed to update user profile")
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error: any) {
      console.error("Login error:", error)

      // Clean up error message if needed
      let errorMessage = error.message || "Authentication failed"

      // If the error message is too technical or contains JSON parsing errors,
      // replace it with a more user-friendly message
      if (errorMessage.includes("JSON") || errorMessage.includes("Unexpected token")) {
        errorMessage = "Invalid email or password"
      }

      throw new Error(errorMessage)
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      // Use the authAPI to register the user
      const response = await authAPI.signup({ email, password })

      // After successful signup, automatically log the user in
      await login(email, password)

      return response
    } catch (error: any) {
      console.error("Signup error:", error)

      // Extract error message from the API response if available
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([key, value]) => `${key} ${value}`)
          .join(", ")
        throw new Error(errorMessages)
      }

      throw new Error(error.message || "Failed to create account")
    }
  }

  const logout = async () => {
    localStorage.removeItem("isLoggedIn")
    setUserProfile(null)
    await signOut({ redirect: false })
    router.push("/")
  }

  return {
    session,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    userProfile,
    profileLoading,
    profileError,
    fetchUserProfile,
    updateUserProfile,
  }
}
