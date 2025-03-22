"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from "@mui/material"
import { useAuth } from "@/contexts/AuthContext"
import styles from "./register.module.css"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { register, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await register(name, email, password)
    } catch (error) {
      setError("Registration failed. Please try again.")
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box className={styles.container}>
        <Paper elevation={3} className={styles.paper}>
          <Typography component="h1" variant="h4" className={styles.title}>
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" className={styles.subtitle}>
            Join our platform and start matching!
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
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
            <Box className={styles.links}>
              <Link href="/login">{"Already have an account? Sign In"}</Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

