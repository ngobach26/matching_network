"use client"

import type { Role } from "@/context/role-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, User, FileText, Briefcase, X } from "lucide-react"

interface RoleCardProps {
  role: Role
  onRemove: () => void
}

export function RoleCard({ role, onRemove }: RoleCardProps) {
  const getRoleIcon = () => {
    switch (role.type) {
      case "rider":
        return <User className="h-6 w-6 text-primary" />
      case "driver":
        return <Car className="h-6 w-6 text-primary" />
      case "reviewer":
        return <FileText className="h-6 w-6 text-primary" />
      case "candidate":
        return <Briefcase className="h-6 w-6 text-primary" />
    }
  }

  const getRoleTitle = () => {
    switch (role.type) {
      case "rider":
        return "Rider"
      case "driver":
        return "Driver"
      case "reviewer":
        return "Reviewer"
      case "candidate":
        return "Candidate"
    }
  }

  const getRoleDescription = () => {
    switch (role.type) {
      case "rider":
        return "Request rides and travel to your destinations"
      case "driver":
        return "Provide rides to users and earn money"
      case "reviewer":
        return "Review papers and provide feedback"
      case "candidate":
        return "Apply for jobs and track applications"
    }
  }

  return (
    <Card className="overflow-hidden border-2 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <CardTitle className="text-xl">{getRoleTitle()}</CardTitle>
        </div>
        <Badge variant={role.isComplete ? "default" : "outline"} className={role.isComplete ? "" : ""}>
          {role.isComplete ? "Complete" : "Incomplete"}
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{getRoleDescription()}</p>

        {role.type === "driver" && role.data && (
          <div className="mt-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Vehicle:</span> {role.data.vehicle}
            </p>
            <p className="text-sm">
              <span className="font-medium">License:</span> {role.data.license}
            </p>
          </div>
        )}

        {role.type === "reviewer" && role.data && (
          <div className="mt-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Expertise:</span> {role.data.expertise}
            </p>
          </div>
        )}

        {role.type === "candidate" && role.data && (
          <div className="mt-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Skills:</span> {role.data.skills}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={onRemove}
        >
          <X className="mr-2 h-4 w-4" /> Remove Role
        </Button>
      </CardFooter>
    </Card>
  )
}
