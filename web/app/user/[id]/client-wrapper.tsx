"use client"

import dynamic from "next/dynamic"

// Import the client component with no SSR
const UserProfileClient = dynamic(() => import("./user-profile-client"), {
  ssr: false,
  loading: () => <div>Loading user profile...</div>,
})

export default function ClientWrapper({ id }: { id: string }) {
  return <UserProfileClient id={id} />
}
