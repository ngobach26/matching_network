"use client"

import dynamic from "next/dynamic"

// Import the user profile client component with ssr: false
const UserProfileClient = dynamic(() => import("./user-profile-client"), {
  ssr: false,
  loading: () => <p>Loading user profile...</p>,
})

export default function ClientWrapper({ id }: { id: string }) {
  return <UserProfileClient id={id} />
}
