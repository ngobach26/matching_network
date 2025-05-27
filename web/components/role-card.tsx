"use client"

import type { Role } from "@/context/role-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, User, X, CreditCard, Users } from "lucide-react"

interface RoleCardProps {
  role: Role
  onRemove: () => void
}

export function RoleCard({ role, onRemove }: RoleCardProps) {
  const getRoleIcon = () => {
    switch (role.type) {
      case "rider":
        return <User className="h-6 w-6 text-orange-500" />
      case "driver":
        return <Car className="h-6 w-6 text-orange-500" />
    }
  }

  const getRoleTitle = () => {
    switch (role.type) {
      case "rider":
        return "Rider"
      case "driver":
        return "Driver"
    }
  }

  const getRoleDescription = () => {
    switch (role.type) {
      case "rider":
        return "Request rides and travel to your destinations"
      case "driver":
        return "Provide rides to users and earn money"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <CardTitle className="text-xl">{getRoleTitle()}</CardTitle>
        </div>
        <Badge variant={role.isComplete ? "default" : "outline"} className={role.isComplete ? "bg-green-500" : ""}>
          {role.isComplete ? "Complete" : "Incomplete"}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{getRoleDescription()}</p>

        {role.type === "driver" && role.data && (
          <div className="mt-4 space-y-1">
            {role.data.vehicle && (
              <p className="text-sm">
                <span className="font-medium">Vehicle:</span> {role.data.vehicle.model}
                {role.data.vehicle.color && ` (${role.data.vehicle.color})`}
              </p>
            )}
            {role.data.vehicle && (
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">Capacity:</span>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-orange-500" />
                  {role.data.vehicle.capacity} passengers
                </div>
              </div>
            )}
            <p className="text-sm">
              <span className="font-medium">License:</span> {role.data.driver_license}
            </p>
            {role.data.rating_average && (
              <p className="text-sm">
                <span className="font-medium">Rating:</span> {role.data.rating_average.toFixed(1)}/5.0
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <Badge
                variant="outline"
                className={role.data.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {role.data.status}
              </Badge>
            </p>
          </div>
        )}

        {role.type === "rider" && role.data && (
          <div className="mt-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">License/ID:</span> {role.data.license_number || "Not specified"}
            </p>
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">Payment Method:</span>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1 text-orange-500" />
                {role.data.payment_method || "Credit Card"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onRemove}
        >
          <X className="mr-2 h-4 w-4" /> Remove Role
        </Button>
      </CardFooter>
    </Card>
  )
}
