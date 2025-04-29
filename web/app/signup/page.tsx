"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Car } from "lucide-react"
import { authAPI } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.passwordConfirmation) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Call the signup API with the expected format
      const response = await authAPI.signup({
        email: formData.email,
        password: formData.password,
      })

      // Check if signup was successful
      if (response.status && response.status.code === 200) {
        toast({
          title: "Account Created",
          description: response.status.message || "Your account has been created successfully. Please log in.",
        })

        // Redirect to login page
        router.push("/")
      } else {
        throw new Error("Signup failed")
      }
    } catch (error: any) {
      console.error("Signup failed:", error)
      toast({
        title: "Signup Failed",
        description: error.response?.data?.status?.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
        <p className="text-muted-foreground">Create your account</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">Enter your details to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
