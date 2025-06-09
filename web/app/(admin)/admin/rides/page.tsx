"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit } from "lucide-react"
import { rideAPI, type Ride } from "@/lib/api-client"

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const data = await rideAPI.getListRides()
        setRides(data)
      } catch (err) {
        console.error("Failed to load rides", err)
      }
    }

    fetchRides()
  }, [])

  // Filter rides based on search query and status filter
  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      searchQuery === "" ||
      ride._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.rider_id.toString().includes(searchQuery) ||
      ride.driver_id.toString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || ride.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-blue-500"
      case "picked_up":
      case "ongoing":
        return "bg-orange-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rides</CardTitle>
              <CardDescription>View and manage ride requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Input
              placeholder="Search by ID, rider, or driver..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell className="font-medium">{ride.id}</TableCell>
                      <TableCell>{ride.rider_id}</TableCell>
                      <TableCell>{ride.driver_id || "—"}</TableCell>
                      <TableCell>{ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : "—"}</TableCell>
                      <TableCell>
                        {ride.estimated_fare
                          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              ride.estimated_fare,
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(ride.status)}>{ride.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No rides found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRides.length} of {rides.length} rides
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
    </div>
  )
}
