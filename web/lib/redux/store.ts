import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import driverReducer from "./slices/driverSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    driver: driverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
