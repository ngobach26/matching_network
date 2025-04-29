"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoleContext } from "@/context/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Car } from "lucide-react"
import { authAPI } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { getCookie } from "cookies-next"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { roles, setRoleList } = useRoleContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  useEffect(() => {
    // Check if user is already logged in
    const token = getCookie("authToken") || localStorage.getItem("authToken")
    const loggedInStatus = localStorage.getItem("isLoggedIn")

    if (token && loggedInStatus === "true") {
      setIsLoggedIn(true)

      // Fetch current user data including roles
      const fetchUserData = async () => {
        try {
          const userData = await authAPI.getCurrentUser()
          
          if (userData && userData.user && userData.user.roles) {
            setRoleList(userData.user.roles)
          }

          // Redirect based on roles or the redirectTo parameter
          if (redirectTo) {
            router.push(redirectTo)
          } else if (userData.user && userData.user.roles && userData.user.roles.length > 0) {
            router.push("/dashboard")
          } else {
            router.push("/profile")
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          // If we can't fetch user data, clear login state
          localStorage.removeItem("authToken")
          localStorage.removeItem("isLoggedIn")
          setIsLoggedIn(false)
        }
      }

      fetchUserData()
    }
  }, [router, redirectTo])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the login API
      const response = await authAPI.login(email, password)

      // Check if login was successful
      if (response.status && response.status.code === 200) {
        // Store login status and user data
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("user", JSON.stringify(response.user))

        // Update roles in context if available
        if (response.user && response.user.roles) {
          setRoleList(response.user.roles)
        }

        setIsLoggedIn(true)

        // Show success message
        toast({
          title: "Login Successful",
          description: response.status.message || "Welcome back!",
        })

        // Redirect based on roles or the redirectTo parameter
        if (redirectTo) {
          router.push(redirectTo)
        } else if (response.user.roles && response.user.roles.length > 0) {
          router.push("/dashboard")
        } else {
          router.push("/profile")
        }
      } else {
        throw new Error("Login failed")
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: error.response?.data?.status?.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Car className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">RideShare</h1>
        <p className="text-muted-foreground">Your multi-role platform</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Sign in to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
