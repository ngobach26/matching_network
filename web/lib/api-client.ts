import axios from "axios"
import { setCookie, deleteCookie } from "cookies-next"
import { getAuthToken } from "./api-client-interceptor"

// Base API client that points to Kong API Gateway
const apiClient = axios.create({
  baseURL: process.env.NEXT_KONG_PUBLIC_API || "http://localhost:8000",
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
      // We'll handle this in the Redux store instead of localStorage
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
  avatar_url?: string
  cover_image_url?: string
  phone_number?: string
  bio?: string
  date_of_birth?: string     // ISO string, ví dụ "2001-01-01"
  address?: string
  driver?: Driver
}
export interface Profile {
  user: User | null
  driver: Driver | null
}

export interface MatchingConfig {
  algorithm: "gale_shapley" | "hungarian"
  proximity_weight: number
  rating_weight: number
  price_weight?: number
  max_distance?: number
  matching_timeout?: number
  min_driver_rating?: number
}

export interface User {
  id: number
  email: string
  name: string
  roles: string[]
  avatar_url?: string
  cover_image_url?: string
  phone_number?: string
  bio?: string
  date_of_birth?: string
  address?: string
  driver?: Driver
}


// Coordinates interface
export interface Coordinates {
  lat: number
  lng: number
}
export interface Location {
  coordinate: Coordinates
  name: string
}

export interface Ride {
  _id: string
  rider_id: number
  pickup_location: Location
  dropoff_location: Location
  fare: Fare
  ride_type: 'bike' | 'car' | 'premium'
  estimated_duration: number
  estimated_distance: number
  geohash: string

  status: 'pending' | 'accepted' | 'arrived' | 'picked_up' | 'ongoing' | 'completed' | 'cancelled'

  cancellation_reason?: string
  cancelled_by?: 'rider' | 'driver' | 'system'
  payment_status: 'unpaid' | 'paid'

  created_at: string
  matched_at?: string
  arrived_at?: string
  start_at?: string
  end_at?: string

  driver_id?: number
  rating?: Rating
  distance?: number
}


export interface Rating {
  rating: number
  comment?: string
  created_at: string // ISO 8601 format: `datetime` in Python maps to string in TS
}

export type RideType = 'car' | 'bike' | 'premium'

// Vehicle interface
export interface Vehicle {
  vehicle_type: RideType;
  brand: string;
  model: string;
  plate_number: string;
  color?: string;
  capacity: number;
  created_at?: string;
  _id?: string; // nếu dùng MongoDB và trả về
}

// Driver interface
export interface Driver {
  user_id: number;
  driver_license: string;
  status: "pending" |"active" |"rejected" |"info_required" | "inactive";
  vehicle: Vehicle;

  total_rides?: number;
  rating_average: number;
  rating_count?: number;
  created_at?: string;
  _id?: string;
}

export interface DriverCreate {
  user_id: number;
  driver_license: string;
  vehicle: Vehicle;
}

export interface DriverUpdate {
  driver_license?: string;
  status?: "active" | "inactive";
  vehicle?: Vehicle;
}

// Add this interface for fare estimation
export interface FareEstimateRequest {
  estimated_distance: number
  estimated_duration: number
}
export interface Fare {
  base_fare: number
  distance_fare: number
  platform_fee: number
  total_fare: number
  driver_earnings: number
  time_fare?: number
  surge_multiplier?: number
  currency?: string
}

export interface FareEstimateResponse {
  bike: Fare
  car: Fare
  premium: Fare
}

export interface RideCreate {
  rider_id: number
  pickup_location: Location
  dropoff_location: Location
  fare: Fare
  ride_type: 'bike' | 'car' | 'premium'
  estimated_duration: number
  estimated_distance: number
  created_at?: string // Optional, defaulted by backend
}

export interface RatingCreate {
  rating: number
  comment?: string
  created_at?: string // Optional, defaulted by backend
}

export interface RideUpdateRequest {
  driver_id?: number
  status?: 'accepted' | 'arrived' | 'picked_up' | 'ongoing' | 'completed' | 'cancelled'
  payment_status?: 'paid' | 'unpaid'
  cancellation_reason?: string
  cancelled_by?: 'rider' | 'driver' | 'system'
  geohash?: string
}

export interface DriverDecisionResponse {
  message: string
  ride: RideDetail
}

export interface RideDetail {
  ride: Ride
  rider: User | null
  driver: User | null
}

export interface DriverEarning {
  driver_id: number
  start_time: string   // ISO format, vd: "2024-06-20T00:00:00+07:00"
  end_time: string     // ISO format, vd: "2024-06-20T23:59:59+07:00"
  ride_count: number
  total_earning: number
}

export interface DriverDetail {
  driver: Driver | null
  user: User | null
}

export interface DriverStatusUpdate {
  new_status: "active" | "rejected" | "info_required" | "pending" | "inactive";
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

  signup: async (userData: {
    name: string
    email: string
    password: string
    phone_number?: string
    date_of_birth?: string
  }) => {
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

    // Clear auth cookie
    deleteCookie("authToken")

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

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<{ message: string }> => {
    const requestBody = {
      user: {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      },
    }
    const response = await apiClient.patch("/api/users/password", requestBody)
    return response.data
  },
}

export const userAPI = {
  getListUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/api/users/users/")
    return response.data
  },
  // Thêm API fetch user theo ID
  getUserById: async (userId: number | string): Promise<User | null> => {
    try {
      const response = await apiClient.get(`/api/users/users/${userId}`)
      return response.data.user
    } catch (e) {
      return null
    }
  },

  // Kết hợp lấy cả User và Driver (profile)
  getProfile: async (userId: number): Promise<Profile> => {
    // Lấy song song, nếu lỗi vẫn trả về null
    const [user, driver] = await Promise.all([
      userAPI.getUserById(userId),
      driverAPI.getDriver(userId),
    ])
    return { user, driver }
  },
}

// Driver API functions
export const driverAPI = {
  createDriver: async (driver: Omit<DriverCreate, "created_at">): Promise<{ inserted_id: string }> => {
    const response = await apiClient.post("api/ride/drivers/", driver)
    return response.data
  },

  getDriver: async (userId: number): Promise<Driver> => {
    const response = await apiClient.get(`api/ride/drivers/${userId}`)
    return response.data
  },

  getDriverDetail: async (userId: number): Promise<DriverDetail> => {
    const response = await apiClient.get(`api/ride/drivers/detail/${userId}`)
    return response.data
  },

  updateDriver: async (userId: number, driver: Omit<DriverUpdate, "created_at">): Promise<{ updated: boolean }> => {
    const response = await apiClient.put(`api/ride/drivers/${userId}`, driver)
    return response.data
  },

  listDrivers: async (): Promise<Driver[]> => {
    const response = await apiClient.get("api/ride/drivers/")
    return response.data
  },

  updateDriverStatus: async (
    userId: number,
    statusUpdate: DriverStatusUpdate
  ): Promise<{ updated: boolean }> => {
    const response = await apiClient.post(`/api/ride/drivers/${userId}/update_status`, statusUpdate);
    return response.data;
  },  
}

// Ride API functions
export const rideAPI = {
  createRideRequest: async (rideRequest: RideCreate): Promise<Ride> => {
    const response = await apiClient.post("/api/ride/rides/", rideRequest)
    return response.data
  },

  getActiveRides: async (riderId: number): Promise<RideDetail[]> => {
    const response = await apiClient.get(`/api/ride/rides/active?rider_id=${riderId}`)
    return response.data
  },

  getDriverActiveRides: async (driver_id: number): Promise<RideDetail[]> => {
    const response = await apiClient.get(`/api/ride/rides/active?driver_id=${driver_id}`)
    return response.data
  },

  getRide: async (rideId: string): Promise<RideDetail> => {
    const response = await apiClient.get(`/api/ride/rides/${rideId}`)
    return response.data
  },  

  getListRides: async (): Promise<Ride[]> => {
    const response = await apiClient.get(`/api/ride/rides/`)
    return response.data
  },

  submitDriverDecision: async (
    requestId: string,
    driverId: number,
    accept: boolean,
  ): Promise<DriverDecisionResponse> => {
    const response = await apiClient.post(`/api/ride/rides/${requestId}/decision?`, {
      driver_id: String(driverId),
      accept,
    })
    return response.data
  },

  updateRideStatus: async (rideId: string, action: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/ride/rides/${rideId}/status`, { action })
    return response.data
  },

  getFareEstimate: async (request: FareEstimateRequest): Promise<FareEstimateResponse> => {
    const response = await apiClient.post("/api/ride/fare-estimate/", request)
    return response.data
  },

  submitRating: async (ride_id: string, ratingData: RatingCreate): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/ride/rides/${ride_id}/rating`, ratingData)
    return response.data
  },
  
  getRidesByDriver: async (driver_id: number): Promise<Ride[]> => {
    const response = await apiClient.get(`/api/ride/rides/driver/${driver_id}`)
    return response.data
  },

  // Lấy danh sách chuyến đi theo rider
  getRidesByRider: async (rider_id?: number): Promise<Ride[]> => {
    const response = await apiClient.get(`/api/ride/rides/rider/${rider_id}`)
    return response.data
  },

  getDriverEarningToday: async (driver_id: number): Promise<DriverEarning> => {
    const response = await apiClient.get(`/api/ride/rides/driver/${driver_id}/earning/today`)
    return response.data
  },
  
}

// Payment API
export const paymentAPI = {
  createVnpayPayment: async ({
    serviceId,
    amount,
  }: {
    serviceId: number | string
    amount: number
  }): Promise<{ payment_url: string; invoice_id: number }> => {
    const response = await apiClient.post("/api/users/payments", {
      service_type: "riding",
      service_id: serviceId,
      amount,
      currency: "VND",
      payment_method: "vnpay",
    })

    return response.data
  },
}

export const adminAPI = {
  getAdminDashboard: async (): Promise<{
    users: User[]
    drivers: Driver[]
    rides: Ride[]
  }> => {
    try {
      const [users, drivers, rides] = await Promise.all([
        userAPI.getListUsers(),
        driverAPI.listDrivers(),
        rideAPI.getListRides(),
      ])
      return { users, drivers, rides }
    } catch (err) {
      console.error("Failed to load admin dashboard data", err)
      throw err
    }
  },
}

export const matchingAPI = {
  setConfig: async (geohash: string, config: MatchingConfig) => {
    const response = await apiClient.put(`/api/ride/matching-algorithm/?geohash=${geohash}`, config)
    return response.data
  },
  getConfig: async (geohash: string) => {
    const response = await apiClient.get(`/api/ride/matching-algorithm/?geohash=${geohash}`)
    return response.data
  },
  listGeohash: async (): Promise<string[]> => {
    const response = await apiClient.get("/api/ride/matching-algorithm/geohash-list")
    return response.data
  },
}

export const s3API = {
  getPresignedUrl: async (
    fileName: string,
    contentType: string
  ): Promise<{ url: string; s3_url: string }> => {
    // Đảm bảo endpoint đúng, ví dụ qua Kong: /api/s3/presign
    const response = await apiClient.post("/api/users/s3/presign", {
      file_name: fileName,
      content_type: contentType,
    })
    return response.data
  },
}

export default apiClient
