import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { driverAPI, DriverCreate, type Driver, type Vehicle } from "@/lib/api-client"
import type { RootState } from "../store"

interface DriverState {
  profile: Driver | null
  vehicle: Vehicle | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  isRegistered: boolean
}

const initialState: DriverState = {
  profile: null,
  vehicle: null,
  status: "idle",
  error: null,
  isRegistered: false,
}

export const fetchDriverProfile = createAsyncThunk("driver/fetchProfile", async (_, { getState, rejectWithValue }) => {
  try {
    const userId = (getState() as RootState).user.userId
    if (!userId) {
      return rejectWithValue("User ID not found")
    }

    const driverData = await driverAPI.getDriver(userId)

    // Fetch vehicle data
    try {
      return { driver: driverData}
    } catch (vehicleError) {
      console.error("Error fetching vehicle data:", vehicleError)
      return { driver: driverData, vehicle: null }
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return rejectWithValue("Not registered as driver")
    }
    return rejectWithValue(error.message || "Failed to fetch driver profile")
  }
})

export const createDriverProfile = createAsyncThunk(
  "driver/createProfile",
  async (
    data: {
      driverData: Omit<DriverCreate, "user_id" | "vehicle">;
      vehicleData: Vehicle;
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
        driver_license: data.driverData.driver_license,
        status: data.driverData.status,
        vehicle: data.vehicleData,
      }

      const driverResponse = await driverAPI.createDriver(driverPayload)

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
      state.profile = null
      state.vehicle = null
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
        state.profile = action.payload.driver
        state.isRegistered = true
      })
      .addCase(fetchDriverProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
        if (action.payload === "Not registered as driver") {
          state.isRegistered = false
        }
      })
      .addCase(createDriverProfile.pending, (state) => {
        state.status = "loading"
      })
      .addCase(createDriverProfile.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.profile = action.payload.driver
        state.isRegistered = true
      })
      .addCase(createDriverProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearDriver } = driverSlice.actions
export default driverSlice.reducer
