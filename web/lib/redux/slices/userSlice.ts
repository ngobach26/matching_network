import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authAPI, type UserProfile } from "@/lib/api-client"

interface UserState {
  userId: number | null
  profile: UserProfile | null
  isAuthenticated: boolean
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: UserState = {
  userId: null,
  profile: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
}

export const fetchUserProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authAPI.getCurrentUser()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch user profile")
  }
})

export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials.email, credentials.password)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to login")
    }
  },
)

export const signupUser = createAsyncThunk(
  "user/signup",
  async (userData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to signup")
    }
  },
)

export const logoutUser = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout()
    return null
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to logout")
  }
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
      state.userId = action.payload.id
      state.isAuthenticated = true
    },
    setUserId: (state, action: PayloadAction<number>) => {
      state.userId = action.payload
    },
    clearUser: (state) => {
      state.profile = null
      state.userId = null
      state.isAuthenticated = false
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.profile = action.payload
        state.userId = action.payload.id
        state.isAuthenticated = true
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.profile = action.payload
        state.userId = action.payload.id
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.profile = action.payload
        state.userId = action.payload.id
        state.isAuthenticated = true
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.profile = null
        state.userId = null
        state.isAuthenticated = false
        state.status = "idle"
      })
  },
})

export const { setUser, setUserId, clearUser } = userSlice.actions
export default userSlice.reducer
