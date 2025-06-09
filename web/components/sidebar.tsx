"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Car, ChevronRight, Menu, X, CarTaxiFrontIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Check if we're on an auth page
  const isAuthPage = pathname === "/" || pathname === "/signup"

  useEffect(() => {
    setCollapsed(true)
  }, [pathname])

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isAuthPage) return null

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Ride",
      href: "/ride",
      icon: Car,
    },
    {
      name: "Drive",
      href: "/drive",
      icon: CarTaxiFrontIcon,
    },
  ]

  // Mobile sidebar using Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-100",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "h-[calc(100vh-4rem)] sticky top-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-20 flex flex-col",
        collapsed ? "w-[70px] items-center" : "w-64 items-start"
      )}
    >
      {/* Nút collapse - căn theo flex direction */}
      <div className={cn(
        "p-2 transition-all w-full",
        collapsed ? "flex justify-center" : "flex justify-end"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className={cn(
        "flex-1 overflow-y-auto p-2 flex flex-col gap-2 w-full",
        collapsed ? "items-center" : "items-start"
      )}>
        <ul className={cn(
          "flex flex-col gap-2 w-full",
          collapsed ? "items-center" : "items-start"
        )}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href} className={cn("w-full", collapsed && "flex justify-center")}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full",
                    isActive
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    collapsed ? "justify-center px-0" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span>{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
