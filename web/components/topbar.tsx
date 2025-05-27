"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, User, Settings, LogOut, Search, MessageCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NotificationPopover from "./notification/notification-popover"

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout, userProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  // Check if we're on an auth page
  const isAuthPage = pathname === "/" || pathname === "/signup"

  if (isAuthPage) return null

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Search for:", searchQuery)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Branding or Page Title */}
        <div className="flex items-center">
          <Link href="/dashboard" className="text-xl font-bold text-orange-500">
            SmartMatch
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right: Notification & User Menu */}
        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>
          </Button> */}
          <NotificationPopover />
          <Link href="/message">
            <Button variant="ghost" size="icon" className="relative">
              <MessageCircle className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>

              {/* Có thể thêm badge nếu có tin nhắn mới */}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userProfile?.name || "User"}</span>
                  <span className="text-xs text-gray-500 font-normal">{userProfile?.email || ""}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
