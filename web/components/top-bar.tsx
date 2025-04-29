"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Car, FileText, Briefcase, ChevronDown, Search, MenuIcon } from "lucide-react"
import { useRoleContext, type RoleType } from "@/context/role-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getUsersByRole } from "@/data/users"
import { UserProfile } from "@/components/user-profile"
import { authAPI } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

export function TopBar() {
  const router = useRouter()
  const { roles, hasRole, addRole, removeRole } = useRoleContext()
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false)
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Available roles for selection
  const availableRoles: { type: RoleType; label: string; icon: any }[] = [
    { type: "rider", label: "Rider", icon: User },
    { type: "driver", label: "Driver", icon: Car },
    { type: "reviewer", label: "Reviewer", icon: FileText },
    { type: "candidate", label: "Candidate", icon: Briefcase },
  ]

  // Selected roles (initialize from context)
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>(roles.map((role) => role.type))

  // Update selectedRoles when context roles change
  useEffect(() => {
    setSelectedRoles(roles.map((role) => role.type))
  }, [roles])

  const handleRoleToggle = (roleType: RoleType, checked: boolean) => {
    if (checked) {
      if (!hasRole(roleType)) {
        // Add the role
        addRole({
          type: roleType,
          isComplete: false,
        })
      }
    } else {
      // Remove the role
      removeRole(roleType)
    }
  }

  const handleSaveRoles = () => {
    setIsRoleSelectOpen(false)

    if (roles.length > 0) {
      router.push("/dashboard")
    } else {
      router.push("/profile")
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    // Simulate search with mock data
    const results = []

    // Search users by role
    for (const role of ["rider", "driver", "reviewer", "candidate"] as RoleType[]) {
      const usersByRole = getUsersByRole(role).filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      results.push(...usersByRole.filter((user) => !results.some((r) => r.id === user.id)))
    }

    setSearchResults(results)
    setIsSearchResultsOpen(true)
  }

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId)
    setIsUserProfileOpen(true)
    setIsSearchResultsOpen(false)
    setIsSearchOpen(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authAPI.logout()

      // Clear local storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")

      // Redirect to login page
      router.push("/")

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error)

      // Even if the API call fails, we should still clear local storage and redirect
      localStorage.removeItem("authToken")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")
      router.push("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <div className="flex items-center gap-1 text-xl font-bold">
              <Car className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline-block">RideShare</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/profile")}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Admin
            </Button>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Search Bar */}
            <div className="relative mx-4 hidden md:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              {isSearchResultsOpen && searchResults.length > 0 && (
                <div className="absolute mt-1 w-full z-10 bg-background rounded-md border shadow-lg overflow-hidden">
                  <div className="p-2">
                    <h4 className="text-sm font-medium mb-2">Search Results</h4>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{user.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.roles.map((role: any) => (
                                <Badge key={role.type} variant="outline" className="text-xs">
                                  {role.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Role Selector */}
            <Popover open={isRoleSelectOpen} onOpenChange={setIsRoleSelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
                  <span>Roles</span>
                  <Badge className="ml-1">{roles.length}</Badge>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Select Your Roles</h4>
                  <p className="text-sm text-muted-foreground">Choose the roles you want to use in the application.</p>
                  <Separator />
                  <div className="grid gap-3">
                    {availableRoles.map((role) => (
                      <div key={role.type} className="flex items-center gap-2">
                        <Checkbox
                          id={`role-${role.type}`}
                          checked={selectedRoles.includes(role.type)}
                          onCheckedChange={(checked) => handleRoleToggle(role.type, checked as boolean)}
                        />
                        <Label
                          htmlFor={`role-${role.type}`}
                          className="flex items-center gap-2 font-normal cursor-pointer"
                        >
                          <role.icon className="h-4 w-4 text-primary" />
                          <span>{role.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveRoles}>Save</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRoleSelectOpen(true)}>Change Roles</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin")}>Admin</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navigate to different sections of the app.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="justify-start" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" className="justify-start" onClick={() => router.push("/profile")}>
                Profile
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" className="justify-start" onClick={() => router.push("/admin")}>
                Admin
              </Button>
            </SheetClose>
            <Separator />
            <div className="p-2">
              <h4 className="font-medium mb-2">Your Roles</h4>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <div key={role.type} className="flex items-center gap-2">
                    <Checkbox
                      id={`mobile-role-${role.type}`}
                      checked={selectedRoles.includes(role.type)}
                      onCheckedChange={(checked) => handleRoleToggle(role.type, checked as boolean)}
                    />
                    <Label
                      htmlFor={`mobile-role-${role.type}`}
                      className="flex items-center gap-2 font-normal cursor-pointer"
                    >
                      <role.icon className="h-4 w-4 text-primary" />
                      <span>{role.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="p-2">
              <ThemeToggle />
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Mobile Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Users</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search by name or role..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
              />
            </div>
            <Button type="submit" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Results</h4>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.roles.map((role: any) => (
                          <Badge key={role.type} variant="outline" className="text-xs">
                            {role.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfile
          user={
            getUsersByRole("rider").find((u) => u.id === selectedUserId) ||
            getUsersByRole("driver").find((u) => u.id === selectedUserId) ||
            getUsersByRole("reviewer").find((u) => u.id === selectedUserId) ||
            getUsersByRole("candidate").find((u) => u.id === selectedUserId) || {
              id: "unknown",
              name: "Unknown User",
              username: "unknown",
              roles: [],
              joinedDate: new Date().toISOString(),
              isPublic: true,
            }
          }
          isOpen={isUserProfileOpen}
          onClose={() => {
            setIsUserProfileOpen(false)
            setSelectedUserId(null)
          }}
        />
      )}
    </>
  )
}

// Add the default export that's being imported elsewhere
export default TopBar
