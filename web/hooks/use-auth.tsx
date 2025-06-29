"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { authAPI, type UserProfile } from "@/lib/api-client"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setUser, clearUser, fetchUserProfile, setUserId } from "@/lib/redux/slices/userSlice"
import { clearDriver } from "@/lib/redux/slices/driverSlice"

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const {
    profile: userProfile,
    userId,
    isAuthenticated,
    status: profileStatus,
    error: profileError,
  } = useAppSelector((state) => state.user)
  const [profileLoading, setProfileLoading] = useState(false)

  // Set userId in Redux when session changes
  useEffect(() => {
    if (session?.user?.id && !userId) {
      dispatch(setUserId(Number(session.user.id)))
    }
  }, [session, userId, dispatch])

  const fetchUserProfileData = async () => {
    if (!isAuthenticated) return null

    try {
      const resultAction = await dispatch(fetchUserProfile()).unwrap()
      return resultAction
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  const updateUserProfileData = async (userData: Partial<UserProfile>) => {
    if (!isAuthenticated) return null

    setProfileLoading(true)

    try {
      // Update the profile in the API
      const updatedProfile = await authAPI.updateProfile(userData)

      // Update Redux store
      dispatch(setUser(updatedProfile))

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

      // After successful login, fetch the user profile and update Redux
      if (result?.ok) {
        const profile = await authAPI.getCurrentUser()
        dispatch(setUser(profile))
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

  // Accepts a user object instead of just email and password
  const signup = async (userData: {
    name: string
    email: string
    password: string
    phone_number: string
    date_of_birth?: string
  }) => {
    try {
      // Use the authAPI to register the user
      const response = await authAPI.signup(userData)

      // After successful signup, automatically log the user in
      // You can still use email and password to log in
      await login(userData.email, userData.password)

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
    setTimeout(() => {
      dispatch(clearUser())
      dispatch(clearDriver())
    }, 1000)

    // Nếu muốn signOut ngay sau khi dispatch, thì gọi ở trong setTimeout

    await signOut({ redirect: false })
    router.push("/")
  }

  // ====== THÊM API ĐỔI MẬT KHẨU TẠI ĐÂY ======
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) => {
    try {
      const result = await authAPI.changePassword(currentPassword, newPassword, newPasswordConfirmation)
      return result
    } catch (error: any) {
      throw error
    }
  }
  // ====== KẾT THÚC PHẦN THÊM ======

  useEffect(() => {
    // Chỉ fetch khi trạng thái là "authenticated" và session còn hợp lệ
    if (status === "authenticated" && !userProfile && session?.user?.id) {
      authAPI.getCurrentUser()
        .then((profile) => {
          if (profile) {
            dispatch(setUser(profile))
          }
        })
        .catch((err) => {
          console.error("Failed to load user profile on init", err)
        })
    }

    // Nếu status là "unauthenticated" thì nên clear luôn userProfile (optional)
    if (status === "unauthenticated" && userProfile) {
      dispatch(clearUser())
    }

  }, [status, userProfile, session, dispatch])

  return {
    session,
    userId,
    isAuthenticated: isAuthenticated || status === "authenticated",
    isLoading: status === "loading" || profileStatus === "loading",
    login,
    signup,
    logout,
    userProfile,
    profileLoading,
    profileError,
    fetchUserProfile: fetchUserProfileData,
    updateUserProfile: updateUserProfileData,
    changePassword, // THÊM VÀO RETURN ĐỂ SỬ DỤNG Ở COMPONENT
  }
}
