"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from "@mui/material"
import { useAuth } from "@/contexts/AuthContext"
import styles from "./login.module.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
    } catch (error) {
      setError("Invalid email or password. Try admin@example.com / password")
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box className={styles.container}>
        <Paper elevation={3} className={styles.paper}>
          <Typography component="h1" variant="h4" className={styles.title}>
            Sign In
          </Typography>
          <Typography variant="body2" color="textSecondary" className={styles.subtitle}>
            Welcome back! Please sign in to continue.
          </Typography>

          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
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
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
            <Box className={styles.links}>
              <Link href="/forgot-password">Forgot password?</Link>
              <Link href="/register">{"Don't have an account? Sign Up"}</Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

