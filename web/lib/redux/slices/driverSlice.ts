import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { driverAPI, DriverCreate, type Driver, type Vehicle } from "@/lib/api-client"
import type { RootState } from "../store"

interface DriverState {
  driverProfile: Driver | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  isRegistered: boolean
}

const initialState: DriverState = {
  driverProfile: null,
  status: "idle",
  error: null,
  isRegistered: false,
}

// Lấy driver profile
export const fetchDriverProfile = createAsyncThunk(
  "driver/fetchProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = (getState() as RootState).user.userId
      if (!userId) {
        return rejectWithValue("User ID not found")
      }

      const driverData = await driverAPI.getDriver(userId)
      return { driver: driverData }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return rejectWithValue("Not registered as driver")
      }
      return rejectWithValue(error.message || "Failed to fetch driver profile")
    }
  }
)

// Tạo driver profile
export const createDriverProfile = createAsyncThunk(
  "driver/createProfile",
  async (
    {
      driver_license,
      vehicleData
    }: {
      driver_license: string
      vehicleData: Vehicle
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const userId = (getState() as RootState).user.userId
      if (!userId) {
        return rejectWithValue("User ID not found")
      }

      const driverPayload: DriverCreate = {
        user_id: userId,
        driver_license,
        vehicle: vehicleData,
      }

      await driverAPI.createDriver(driverPayload)

      // Lấy lại profile sau khi tạo
      const driverData = await driverAPI.getDriver(userId)

      return { driver: driverData }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create driver profile")
    }
  }
)

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearDriver: (state) => {
      state.driverProfile = null
      state.isRegistered = false
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverProfile.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.driverProfile = action.payload.driver
        state.isRegistered = !!action.payload.driver
      })
      .addCase(fetchDriverProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
        if (action.payload === "Not registered as driver") {
          state.isRegistered = false
          state.driverProfile = null
        }
      })
      .addCase(createDriverProfile.pending, (state) => {
        state.status = "loading"
      })
      .addCase(createDriverProfile.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.driverProfile = action.payload.driver
        state.isRegistered = !!action.payload.driver
      })
      .addCase(createDriverProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearDriver } = driverSlice.actions
export default driverSlice.reducer
