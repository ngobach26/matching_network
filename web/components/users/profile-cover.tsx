"use client"

import * as React from "react"
import clsx from "clsx"

interface ProfileCoverProps extends React.HTMLAttributes<HTMLDivElement> {
  coverUrl?: string
  fallbackText?: string
  children?: React.ReactNode
  className?: string
}

export const ProfileCover: React.FC<ProfileCoverProps> = ({
  coverUrl,
  fallbackText = "",
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "relative w-full h-[220px] sm:h-[320px] rounded-b-lg bg-muted overflow-hidden flex items-end",
        className
      )}
      {...props}
    >
      {/* Cover Image */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-400 text-lg font-semibold select-none">
          {fallbackText || "No cover image"}
        </div>
      )}

      {/* Overlay hiệu ứng làm mờ/đen nhẹ phía dưới để nổi avatar/text/action */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* Nơi cắm action/button ở góc phải cover (nếu cần) */}
      {children && (
        <div className="absolute top-4 right-4 z-10">{children}</div>
      )}
    </div>
  )
}

export default ProfileCover
