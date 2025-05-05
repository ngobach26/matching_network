import axios from "axios"
import { setCookie, deleteCookie } from "cookies-next"
import { getAuthToken } from "./api-client-interceptor"

// Base API client that points to Kong API Gateway
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Update the request interceptor to use the NextAuth session token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from NextAuth session or cookie
    const token = await getAuthToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear auth data
      deleteCookie("authToken")
      localStorage.removeItem("isLoggedIn")

      // Only redirect if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

// User profile interface
export interface UserProfile {
  id: number
  email: string
  name: string
  roles: string[]
}

// Update the login function to work with NextAuth
export const authAPI = {
  login: async (email: string, password: string) => {
    // Format the request body according to the API specification
    const requestBody = {
      user: {
        email,
        password,
      },
    }

    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/login", requestBody)

    // Store token in cookie for better security
    if (response.data.token) {
      setCookie("authToken", response.data.token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
    }

    return response.data
  },

  signup: async (userData: { email: string; password: string }) => {
    // Format the request body according to the API specification
    const requestBody = {
      user: userData,
    }

    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/signup", requestBody)
    return response.data
  },

  logout: async () => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/logout")

    // Clear auth cookie and localStorage
    deleteCookie("authToken")
    localStorage.removeItem("isLoggedIn")

    return response.data
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.get("/api/users/me")
    return response.data.user
  },

  updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    // Format the request body according to the API specification
    const requestBody = {
      user: userData,
    }

    // Using the path defined in your Kong configuration with PATCH method
    const response = await apiClient.patch("/api/users/me", requestBody)
    return response.data.user
  },
}

export default apiClient
