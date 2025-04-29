import axios from "axios"
import { getCookie, setCookie, deleteCookie } from "cookies-next"

// Base API client that points to Kong API Gateway
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first, then localStorage as fallback
    const token = getCookie("authToken") || localStorage.getItem("authToken")
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
      localStorage.removeItem("authToken")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")

      // Only redirect if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

// Auth related API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/login", { email, password })

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

  signup: async (userData: any) => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/signup", userData)
    return response.data
  },

  logout: async () => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.post("/api/users/logout")

    // Clear auth cookie
    deleteCookie("authToken")

    return response.data
  },

  getCurrentUser: async () => {
    // Using the path defined in your Kong configuration
    const response = await apiClient.get("/api/users/me")
    return response.data
  },
}

// User related API calls
export const userAPI = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get(`/api/users/${userId}`)
    return response.data
  },

  updateProfile: async (userId: string, profileData: any) => {
    const response = await apiClient.put(`/api/users/${userId}`, profileData)
    return response.data
  },

  getRoles: async (userId: string) => {
    const response = await apiClient.get(`/api/users/${userId}/roles`)
    return response.data
  },

  addRole: async (userId: string, roleData: any) => {
    const response = await apiClient.post(`/api/users/${userId}/roles`, roleData)
    return response.data
  },

  removeRole: async (userId: string, roleId: string) => {
    const response = await apiClient.delete(`/api/users/${userId}/roles/${roleId}`)
    return response.data
  },
}

// Ride related API calls
export const rideAPI = {
  requestRide: async (rideData: any) => {
    const response = await apiClient.post("/api/matching/rides", rideData)
    return response.data
  },

  getRideHistory: async (userId: string) => {
    const response = await apiClient.get(`/api/matching/users/${userId}/rides`)
    return response.data
  },

  getActiveRides: async (userId: string) => {
    const response = await apiClient.get(`/api/matching/users/${userId}/rides/active`)
    return response.data
  },

  cancelRide: async (rideId: string) => {
    const response = await apiClient.post(`/api/matching/rides/${rideId}/cancel`)
    return response.data
  },

  rateRide: async (rideId: string, rating: number, comment: string) => {
    const response = await apiClient.post(`/api/matching/rides/${rideId}/rate`, { rating, comment })
    return response.data
  },
}

// Driver related API calls
export const driverAPI = {
  getAvailableRides: async () => {
    const response = await apiClient.get("/api/matching/rides/available")
    return response.data
  },

  acceptRide: async (rideId: string) => {
    const response = await apiClient.post(`/api/matching/rides/${rideId}/accept`)
    return response.data
  },

  completeRide: async (rideId: string) => {
    const response = await apiClient.post(`/api/matching/rides/${rideId}/complete`)
    return response.data
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const response = await apiClient.post(`/api/matching/drivers/location`, { latitude, longitude })
    return response.data
  },

  toggleAvailability: async (isAvailable: boolean) => {
    const response = await apiClient.post(`/api/matching/drivers/availability`, { isAvailable })
    return response.data
  },
}

export default apiClient
