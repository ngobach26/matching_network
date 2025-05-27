"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle, Pencil, Check, X } from "lucide-react"
import clsx from "clsx"

interface ProfileActionsProps {
  isCurrentUser: boolean
  isFriend?: boolean
  isFriendRequestSent?: boolean
  onAddFriend?: () => void
  onMessage?: () => void
  onEditProfile?: () => void
  isLoadingAddFriend?: boolean
  isLoadingMessage?: boolean
  isLoadingEdit?: boolean
  // Thêm các props mở rộng nếu cần
  className?: string
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  isCurrentUser,
  isFriend,
  isFriendRequestSent,
  onAddFriend,
  onMessage,
  onEditProfile,
  isLoadingAddFriend,
  isLoadingMessage,
  isLoadingEdit,
  className,
}) => {
  if (isCurrentUser) {
    // Nếu đang xem profile của mình
    return (
      <div className={clsx("flex gap-2", className)}>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditProfile}
          disabled={isLoadingEdit}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    )
  }

  // Nếu là profile người khác
  return (
    <div className={clsx("flex gap-2", className)}>
      {isFriend ? (
        <Button size="sm" variant="secondary" disabled>
          <Check className="w-4 h-4 mr-2" /> Friends
        </Button>
      ) : isFriendRequestSent ? (
        <Button size="sm" variant="outline" disabled>
          <UserPlus className="w-4 h-4 mr-2" /> Request Sent
        </Button>
      ) : (
        <Button
          size="sm"
          variant="default"
          onClick={onAddFriend}
          disabled={isLoadingAddFriend}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isLoadingAddFriend ? "Adding..." : "Add Friend"}
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={onMessage}
        disabled={isLoadingMessage}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {isLoadingMessage ? "Opening..." : "Message"}
      </Button>
    </div>
  )
}

export default ProfileActions
