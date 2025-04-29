"use client"

import dynamic from "next/dynamic"

// Import the dashboard client component with ssr: false
const DashboardClient = dynamic(() => import("./dashboard-client"), {
  ssr: false,
  loading: () => <p>Loading dashboard...</p>,
})

export default function ClientWrapper() {
  return <DashboardClient />
}
