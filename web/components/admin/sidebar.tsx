"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Car, Settings, Network, ChevronLeft, ChevronRight, LogOut, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      group: "Overview",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      group: "Management",
    },
    {
      name: "Rides",
      href: "/admin/rides",
      icon: Car,
      group: "Management",
    },
    {
      name: "Drivers",
      href: "/admin/drivers",
      icon: ClipboardList,
      group: "Management",
    },
    {
      name: "Matching Algorithm",
      href: "/admin/matching-algorithm",
      icon: Network,
      group: "Configuration",
    },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: Settings,
    //   group: "Configuration",
    // },
  ]

  // Group navigation items
  const groupedNavItems = navItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, typeof navItems>,
  )

  const handleBackToPlatform = () => {
    router.push("/dashboard")
  }

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-xl font-bold text-orange-500">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Admin Info */}
      {!collapsed && (
        <div className="px-4 py-2">
          <p className="text-sm font-medium">{userProfile?.name || "Admin User"}</p>
          <p className="text-xs text-muted-foreground">{userProfile?.email || ""}</p>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {Object.entries(groupedNavItems).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group}</p>
              </div>
            )}
            <ul className="space-y-1 px-2">
              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          className={cn("w-full flex items-center gap-2 justify-center", collapsed && "p-2")}
          onClick={handleBackToPlatform}
          title={collapsed ? "Back to Platform" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Back to Platform</span>}
        </Button>
      </div>
    </aside>
  )
}
