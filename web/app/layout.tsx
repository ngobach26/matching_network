import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { RoleProvider } from "@/context/role-context"
import { ThemeProvider } from "@/components/ThemeProvider"
import { NotificationProvider } from "@/context/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Multi-Role Platform",
  description: "A platform where users can have multiple roles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <RoleProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'