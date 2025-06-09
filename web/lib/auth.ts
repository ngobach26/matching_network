// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: {
                email: credentials.email,
                password: credentials.password,
              },
            }),
          })

          // Check if the response is ok (status in the range 200-299)
          if (!res.ok) {
            // Try to get the error message from the response
            let errorMessage = "Invalid email or password"

            // Check if the response is JSON
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              try {
                const errorData = await res.json()
                if (errorData.errors) {
                  errorMessage = Object.entries(errorData.errors)
                    .map(([key, value]) => `${key} ${value}`)
                    .join(", ")
                } else if (errorData.error) {
                  errorMessage = errorData.error
                }
              } catch (e) {
                // If JSON parsing fails, try to get text
                try {
                  const textError = await res.text()
                  if (textError) {
                    errorMessage = textError
                  }
                } catch (textError) {
                  // If text extraction fails, use default error message
                  console.error("Failed to extract error text:", textError)
                }
              }
            } else {
              // If not JSON, try to get the response as text
              try {
                const textError = await res.text()
                if (textError) {
                  errorMessage = textError
                }
              } catch (textError) {
                console.error("Failed to extract error text:", textError)
              }
            }

            throw new Error(errorMessage)
          }

          // If response is ok, parse the JSON
          const data = await res.json()

          if (data.token && data.user) {
            // Return object that conforms to our User type
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name || data.user.email,
              token: data.token, // This matches our User type that requires a token property
            }
          }

          throw new Error("Invalid response from server")
        } catch (error: any) {
          console.error("Login error:", error)
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],

  session: {
    strategy: "jwt", // Use JWT session
  },

  callbacks: {
    // First time user signs in: merge token into JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.token = user.token
      }
      return token
    },
    // When client calls getSession(): ensure session.user has all required fields
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          id: token.id,
          email: token.email as string,
          name: token.name || token.email,
        }
        session.token = token.token
      }
      return session
    },
  },

  pages: {
    signIn: "/",
    error: "/", // Will handle errors on the login page
  },
}
