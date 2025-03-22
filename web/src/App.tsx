"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { SocketProvider } from "./contexts/SocketContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { SnackbarProvider } from "./contexts/SnackbarContext"

// Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import RoleSelection from "./pages/onboarding/RoleSelection"
import RoleOnboarding from "./pages/onboarding/RoleOnboarding"
import Dashboard from "./pages/dashboard/Dashboard"
import RiderDashboard from "./pages/rider/RiderDashboard"
import DriverDashboard from "./pages/driver/DriverDashboard"
import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard"
import CandidateDashboard from "./pages/candidate/CandidateDashboard"
import MentorDashboard from "./pages/mentor/MentorDashboard"
import MenteeDashboard from "./pages/mentee/MenteeDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import NotFound from "./pages/NotFound"

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3", // Blue
    },
    secondary: {
      main: "#4caf50", // Green
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
})

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.isAdmin ? <>{children}</> : <Navigate to="/dashboard" />
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                  path="/role-selection"
                  element={
                    <ProtectedRoute>
                      <RoleSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/onboarding/:role"
                  element={
                    <ProtectedRoute>
                      <RoleOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rider"
                  element={
                    <ProtectedRoute>
                      <RiderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/driver"
                  element={
                    <ProtectedRoute>
                      <DriverDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviewer"
                  element={
                    <ProtectedRoute>
                      <ReviewerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate"
                  element={
                    <ProtectedRoute>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor"
                  element={
                    <ProtectedRoute>
                      <MentorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentee"
                  element={
                    <ProtectedRoute>
                      <MenteeDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Redirect root to dashboard or login */}
                <Route path="/" element={<Navigate to="/dashboard" />} />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App

