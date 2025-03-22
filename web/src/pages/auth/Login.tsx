"use client"

import type React from "react"
import { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Container, Box, Typography, TextField, Button, Link, Paper, CircularProgress } from "@mui/material"
import { useAuth } from "../../contexts/AuthContext"
import styles from "./Auth.module.css"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { login, isLoading } = useAuth()

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await login(email, password)
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box className={styles.authContainer}>
        <Paper elevation={3} className={styles.authPaper}>
          <Typography component="h1" variant="h4" className={styles.authTitle}>
            Sign In
          </Typography>
          <Typography variant="body2" color="textSecondary" className={styles.authSubtitle}>
            Welcome back! Please sign in to continue.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} className={styles.authForm}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={styles.authButton}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
            <Box className={styles.authLinks}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login

