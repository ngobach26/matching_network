"use client"

import dynamic from "next/dynamic"

// Import the client component with no SSR
const DashboardClient = dynamic(() => import("./dashboard-client"), {
  ssr: false,
  loading: () => <div>Loading dashboard...</div>,
})

export default function ClientWrapper() {
  return <DashboardClient />
}
