"use client"

import { useRouter } from "next/navigation"
import { Home, User, Car, Settings } from "lucide-react"
import { useRoleContext } from "@/context/role-context"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function MobileNav() {
  const pathname = useRouter().pathname
  const router = useRouter()
  const { roles, hasRole } = useRoleContext()

  // Use state instead of useSearchParams to avoid Suspense requirement
  const [currentTab, setCurrentTab] = useState<string | null>(null)

  // Parse the tab parameter from the URL on the client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setCurrentTab(params.get("tab"))
    }
  }, [pathname])

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard" && !currentTab,
      show: roles.length > 0,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile",
      show: true,
    },
    {
      label: "Rider",
      href: "/dashboard?tab=rider",
      icon: User,
      active: pathname === "/dashboard" && currentTab === "rider",
      show: hasRole("rider"),
    },
    {
      label: "Driver",
      href: "/dashboard?tab=driver",
      icon: Car,
      active: pathname === "/dashboard" && currentTab === "driver",
      show: hasRole("driver"),
    },
    {
      label: "Admin",
      href: "/admin",
      icon: Settings,
      active: pathname === "/admin",
      show: true,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems
          .filter((item) => item.show)
          .slice(0, 5)
          .map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted",
                item.active && "text-primary",
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
      </div>
    </div>
  )
}

