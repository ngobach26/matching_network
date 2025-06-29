"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userAPI, driverAPI, type User, type Driver } from "@/lib/api-client"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Modal detail states
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null)
  const [loadingDriver, setLoadingDriver] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userAPI.getListUsers()
        setUsers(data)
      } catch (err) {
        console.error("Failed to load users", err)
      }
    }

    fetchUsers()
  }, [])

  const handleViewDetail = async (user: User) => {
    setSelectedUser(user)
    setDriverInfo(null)
    setDetailOpen(true)
    if (user.roles.includes("driver")) {
      setLoadingDriver(true)
      try {
        const driver = await driverAPI.getDriver(user.id)
        setDriverInfo(driver)
      } catch {
        setDriverInfo(null)
      } finally {
        setLoadingDriver(false)
      }
    }
  }

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter)

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage platform users and their roles</CardDescription>
            </div>
            {/* <Button className="bg-orange-500 hover:bg-orange-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Input
              placeholder="Search users..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="rider">Rider</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="candidate">Candidate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name || "No Name"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`${role === "rider"
                                  ? "bg-orange-100 text-orange-800"
                                  : role === "driver"
                                    ? "bg-blue-100 text-blue-800"
                                    : role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : role === "reviewer"
                                        ? "bg-green-100 text-green-800"
                                        : role === "candidate"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : ""
                                }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View detail"
                            onClick={() => handleViewDetail(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* --------- User Detail Modal --------- */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar_url || "/avatar-placeholder.png"}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <div className="font-lg text-gray-500 font-mono">ID: {selectedUser.id}</div>
                  <div className="text-lg font-bold">{selectedUser.name}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                  <div className="flex gap-2 mt-2">
                    {selectedUser.roles.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Phone:</strong> {selectedUser.phone_number || "-"}</div>
                <div><strong>Date of birth:</strong> {selectedUser.date_of_birth || "-"}</div>
                <div><strong>Address:</strong> {selectedUser.address || "-"}</div>
                <div><strong>Bio:</strong> {selectedUser.bio || "-"}</div>
              </div>
              {selectedUser.cover_image_url && (
                <div>
                  <img
                    src={selectedUser.cover_image_url}
                    alt="Cover"
                    className="rounded-lg w-full max-h-32 object-cover border"
                  />
                </div>
              )}

              {/* DRIVER INFO (if any) */}
              {selectedUser.roles.includes("driver") && (
                <div>
                  <div className="font-semibold mt-3 mb-1">Driver Information</div>
                  {loadingDriver ? (
                    <div className="text-gray-500 text-sm">Loading driver info...</div>
                  ) : driverInfo ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>License:</strong>{" "}
                          {driverInfo.driver_license || "-"}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          {driverInfo.status || "-"}
                        </div>
                        <div>
                          <strong>Total Rides:</strong>{" "}
                          {driverInfo.total_rides ?? 0}
                        </div>
                        <div>
                          <strong>Rating Average:</strong>{" "}
                          {driverInfo.rating_average !== null && driverInfo.rating_average !== undefined
                            ? Number(driverInfo.rating_average).toFixed(1)
                            : "-"}
                        </div>
                        <div>
                          <strong>Rating Count:</strong>{" "}
                          {driverInfo.rating_count !== null && driverInfo.rating_count !== undefined
                            ? driverInfo.rating_count
                            : "-"}
                        </div>
                        <div>
                          <strong>Created At:</strong>{" "}
                          {driverInfo.created_at
                            ? new Date(driverInfo.created_at).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                      {driverInfo.vehicle && (
                        <div className="border rounded p-3 mt-2 bg-gray-50">
                          <div className="font-semibold mb-1 text-sm">Vehicle</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <strong>Type:</strong> {driverInfo.vehicle.vehicle_type || "-"}
                            </div>
                            <div>
                              <strong>Brand:</strong> {driverInfo.vehicle.brand || "-"}
                            </div>
                            <div>
                              <strong>Model:</strong> {driverInfo.vehicle.model || "-"}
                            </div>
                            <div>
                              <strong>Plate Number:</strong> {driverInfo.vehicle.plate_number || "-"}
                            </div>
                            <div>
                              <strong>Capacity:</strong> {driverInfo.vehicle.capacity ?? "-"}
                            </div>
                            <div>
                              <strong>Color:</strong> {driverInfo.vehicle.color || "-"}
                            </div>
                            <div>
                              <strong>Vehicle Created At:</strong>{" "}
                              {driverInfo.vehicle.created_at
                                ? new Date(driverInfo.vehicle.created_at).toLocaleString()
                                : "-"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm">No driver information found.</div>
                  )}
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* --------- End User Detail Modal --------- */}
    </div>
  )
}
