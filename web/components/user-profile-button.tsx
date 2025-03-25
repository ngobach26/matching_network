"use client"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getUserById } from "@/data/users"
import { User } from "lucide-react"

interface UserProfileButtonProps extends ButtonProps {
  userId: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  label?: string
}

export function UserProfileButton({
  userId,
  variant = "outline",
  size = "sm",
  showIcon = false,
  label = "View Profile",
  className,
  ...props
}: UserProfileButtonProps) {
  const router = useRouter()
  const user = getUserById(userId)

  if (!user) {
    return null
  }

  const handleViewProfile = () => {
    router.push(`/user/${userId}`)
  }

  return (
    <Button variant={variant} size={size} onClick={handleViewProfile} className={className} {...props}>
      {showIcon && <User className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  )
}

