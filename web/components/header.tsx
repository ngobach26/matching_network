"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Car, User, ChevronDown } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"

export function Header() {
  const { isAuthenticated, logout, userProfile } = useAuth()
  const router = useRouter()
  const { isRegistered: isDriverRegistered } = useAppSelector((state) => state.driver)

  const handleLogout = async () => {
    await logout()
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            SmartMatch
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/ride" className="text-gray-700 hover:text-orange-500 font-medium">
                Ride
              </Link>
              <Link href="/drive" className="text-gray-700 hover:text-orange-500 font-medium">
                Drive
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{userProfile?.name || userProfile?.email || "Account"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/ride")}>
                    <Car className="mr-2 h-4 w-4" />
                    <span>Ride</span>
                  </DropdownMenuItem>
                  {isDriverRegistered && (
                    <DropdownMenuItem onClick={() => handleNavigation("/drive")}>
                      <Car className="mr-2 h-4 w-4" />
                      <span>Drive</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-gray-700 hover:text-orange-500 font-medium">
                Sign In
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-500 hover:bg-orange-600">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button - to be implemented */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}
