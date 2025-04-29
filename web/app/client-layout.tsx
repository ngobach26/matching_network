"use client"

import type React from "react"

import { ThemeProvider as MuiThemeProvider } from "@/components/ThemeProvider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider>{children}</MuiThemeProvider>
}
