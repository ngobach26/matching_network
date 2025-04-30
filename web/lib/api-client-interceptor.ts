import { getSession } from "next-auth/react"
import { getCookie } from "cookies-next"

// Function to get the auth token from NextAuth session
export async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const session = await getSession()
      if (session?.token) {
        return session.token
      }

      // Fallback to cookie if session token is not available
      const authToken = getCookie("authToken")
      if (authToken) {
        return authToken as string
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
  }
  return null
}
