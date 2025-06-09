// (main)/message/page.tsx
"use client"

import MessageDesktopPage from "@/components/message/message-desktop"
import MessageMobilePage from "@/components/message/message-mobile"

export default function MessagePageWrapper() {
  return (
    <>
      <div className="block md:hidden">
        <MessageMobilePage />
      </div>
      <div className="hidden md:block">
        <MessageDesktopPage />
      </div>
    </>
  )
}
