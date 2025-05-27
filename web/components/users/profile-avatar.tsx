"use client"

import * as React from "react"
import clsx from "clsx"

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarUrl?: string
  alt?: string
  size?: number | string // px, ví dụ: 120, "100px"
  editable?: boolean // nếu muốn show nút edit nhỏ
  onEditClick?: () => void
  fallbackIcon?: React.ReactNode
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  alt = "Avatar",
  size = 120,
  editable = false,
  onEditClick,
  fallbackIcon,
  className,
  ...props
}) => {
  const px = typeof size === "number" ? `${size}px` : size

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center",
        className
      )}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
      {...props}
    >
      {/* Ảnh avatar hoặc fallback */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-5xl select-none border-4 border-white dark:border-gray-900 shadow-lg">
          {fallbackIcon || (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={1.5} />
              <path stroke="currentColor" strokeWidth={1.5} d="M4 20c0-4 16-4 16 0" />
            </svg>
          )}
        </div>
      )}

      {/* Nút edit nhỏ nằm dưới phải */}
      {editable && (
        <button
          onClick={onEditClick}
          className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 rounded-full p-2 border border-gray-200 dark:border-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          title="Change avatar"
          type="button"
        >
          {/* icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ProfileAvatar
