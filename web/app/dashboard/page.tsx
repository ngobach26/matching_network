"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRoleContext } from "@/context/role-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, User, FileText, Briefcase, Settings } from "lucide-react"
import { RiderDashboard } from "@/components/dashboards/rider-dashboard"
import { DriverDashboard } from "@/components/dashboards/driver-dashboard"
import { ReviewerDashboard } from "@/components/dashboards/reviewer-dashboard"
import { CandidateDashboard } from "@/components/dashboards/candidate-dashboard"

export default function DashboardPage() {
  const { roles, hasRole } = useRoleContext()
  const [activeTab, setActiveTab] = useState(() => {
    if (hasRole("rider")) return "rider"
    if (hasRole("driver")) return "driver"
    if (hasRole("reviewer")) return "reviewer"
    if (hasRole("candidate")) return "candidate"
    return "rider"
  })
  const router = useRouter()

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleAdminClick = () => {
    router.push("/admin")
  }

  if (roles.length === 0) {
    router.push("/profile")
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleProfileClick}>
            Manage Roles
          </Button>
          <Button variant="outline" onClick={handleAdminClick}>
            <Settings className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          {hasRole("rider") && (
            <TabsTrigger value="rider" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Rider</span>
            </TabsTrigger>
          )}
          {hasRole("driver") && (
            <TabsTrigger value="driver" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Driver</span>
            </TabsTrigger>
          )}
          {hasRole("reviewer") && (
            <TabsTrigger value="reviewer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reviewer</span>
            </TabsTrigger>
          )}
          {hasRole("candidate") && (
            <TabsTrigger value="candidate" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Candidate</span>
            </TabsTrigger>
          )}
        </TabsList>

        {hasRole("rider") && (
          <TabsContent value="rider">
            <RiderDashboard />
          </TabsContent>
        )}

        {hasRole("driver") && (
          <TabsContent value="driver">
            <DriverDashboard />
          </TabsContent>
        )}

        {hasRole("reviewer") && (
          <TabsContent value="reviewer">
            <ReviewerDashboard />
          </TabsContent>
        )}

        {hasRole("candidate") && (
          <TabsContent value="candidate">
            <CandidateDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

