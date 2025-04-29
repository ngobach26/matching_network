"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRoleContext, type RoleType } from "@/context/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, User, FileText, Briefcase, Plus } from "lucide-react"
import { RoleCard } from "@/components/role-card"
import { RiderForm } from "@/components/role-forms/rider-form"
import { DriverForm } from "@/components/role-forms/driver-form"
import { ReviewerForm } from "@/components/role-forms/reviewer-form"
import { CandidateForm } from "@/components/role-forms/candidate-form"

export default function ProfilePage() {
  const { roles, addRole, removeRole } = useRoleContext()
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const router = useRouter()

  const handleAddRole = (type: RoleType) => {
    setSelectedRole(type)
  }

  const handleRoleSubmit = (data: any) => {
    if (selectedRole) {
      addRole({
        type: selectedRole,
        isComplete: true,
        data,
      })
      setIsAddRoleOpen(false)
      setSelectedRole(null)
    }
  }

  const handleRemoveRole = (type: RoleType) => {
    removeRole(type)
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const renderRoleForm = () => {
    switch (selectedRole) {
      case "rider":
        return <RiderForm onSubmit={handleRoleSubmit} />
      case "driver":
        return <DriverForm onSubmit={handleRoleSubmit} />
      case "reviewer":
        return <ReviewerForm onSubmit={handleRoleSubmit} />
      case "candidate":
        return <CandidateForm onSubmit={handleRoleSubmit} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        {roles.length > 0 && (
          <Button onClick={handleGoToDashboard} className="bg-orange-500 hover:bg-orange-600">
            Go to Dashboard
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-orange-500 hover:bg-orange-600">Save Changes</Button>
        </CardFooter>
      </Card>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Roles</h2>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a New Role</DialogTitle>
                <DialogDescription>Select a role to add to your profile</DialogDescription>
              </DialogHeader>

              {!selectedRole ? (
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("rider")}
                  >
                    <User className="h-8 w-8 text-orange-500" />
                    <span>Rider</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("driver")}
                  >
                    <Car className="h-8 w-8 text-orange-500" />
                    <span>Driver</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("reviewer")}
                  >
                    <FileText className="h-8 w-8 text-orange-500" />
                    <span>Reviewer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleAddRole("candidate")}
                  >
                    <Briefcase className="h-8 w-8 text-orange-500" />
                    <span>Candidate</span>
                  </Button>
                </div>
              ) : (
                <div className="py-4">{renderRoleForm()}</div>
              )}

              {selectedRole && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>
                    Back
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {roles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="text-center mb-4">
                <p className="text-muted-foreground">You haven't added any roles yet.</p>
                <p className="text-muted-foreground">Add a role to access different features of the platform.</p>
              </div>
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Role
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <RoleCard key={role.type} role={role} onRemove={() => handleRemoveRole(role.type)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

