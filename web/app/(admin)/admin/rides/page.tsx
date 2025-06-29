"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Eye, Edit } from "lucide-react"
import { rideAPI, type Ride, type RideDetail, type User, type Fare } from "@/lib/api-client"

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [openDetail, setOpenDetail] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [rideDetail, setRideDetail] = useState<RideDetail | null>(null)

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

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      searchQuery === "" ||
      ride._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.rider_id.toString().includes(searchQuery) ||
      (ride.driver_id ? ride.driver_id.toString().includes(searchQuery) : false)
    const matchesStatus = statusFilter === "all" || ride.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const handleViewDetail = async (rideId: string) => {
    setOpenDetail(true)
    setDetailLoading(true)
    setRideDetail(null)
    try {
      const detail = await rideAPI.getRide(rideId)
      setRideDetail(detail)
    } catch (err) {
      setRideDetail(null)
    }
    setDetailLoading(false)
  }

  // Card info cho người dùng (driver/rider)
  const renderUserInfo = (user: User | null, roleLabel: string) => {
    if (!user) return <div className="text-muted-foreground">No {roleLabel} found</div>
    return (
      <div className="space-y-1">
        <div className="font-semibold text-base flex items-center">
          {user.name}
          {user.roles?.includes("driver") && (
            <Badge className="ml-2 bg-orange-500">{roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}</Badge>
          )}
        </div>
        <div className="text-xs">ID: {user.id}</div>
        <div className="text-xs">Email: {user.email}</div>
        {user.phone_number && <div className="text-xs">Phone: {user.phone_number}</div>}
        {user.address && <div className="text-xs">Address: {user.address}</div>}
        {user.bio && <div className="text-xs">Bio: {user.bio}</div>}
        {user.date_of_birth && <div className="text-xs">Date of birth: {user.date_of_birth}</div>}
      </div>
    )
  }

  // Table fare
  const renderFareInfo = (fare: Fare | undefined) => {
    if (!fare) return <div className="text-muted-foreground">No fare information</div>
    const format = (val: number | undefined) =>
      typeof val === "number"
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: fare.currency || "VND" }).format(val)
        : "0 ₫"
    return (
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="pr-2 font-medium">Base fare:</td><td className="text-right">{format(fare.base_fare)}</td></tr>
          <tr><td className="pr-2 font-medium">Distance fare:</td><td className="text-right">{format(fare.distance_fare)}</td></tr>
          <tr><td className="pr-2 font-medium">Time fare:</td><td className="text-right">{fare.time_fare !== undefined ? format(fare.time_fare) : "0 ₫"}</td></tr>
          <tr><td className="pr-2 font-medium">Surge multiplier:</td><td className="text-right">{fare.surge_multiplier !== undefined ? `×${fare.surge_multiplier}` : "×1"}</td></tr>
          <tr><td className="pr-2 font-medium">Platform fee:</td><td className="text-right">{format(fare.platform_fee)}</td></tr>
          <tr><td className="pr-2 font-medium">Driver earnings:</td><td className="text-right">{format(fare.driver_earnings)}</td></tr>
          <tr><td className="pr-2 font-medium">Total fare:</td><td className="text-right">{format(fare.total_fare)}</td></tr>
          <tr><td className="pr-2 font-medium">Currency:</td><td className="text-right">{fare.currency || "VND"}</td></tr>
        </tbody>
      </table>
    )
  }

  // Ride info
  const renderRideInfo = (ride: Ride) => (
    <div className="space-y-1 text-sm">
      <div><b>ID:</b> {ride._id}</div>
      <div className="flex items-center gap-2"><b>Status:</b> <Badge className={getStatusBadgeColor(ride.status)}>{ride.status}</Badge></div>
      <div><b>Type:</b> {ride.ride_type}</div>
      <div><b>Pickup:</b> {ride.pickup_location?.name || JSON.stringify(ride.pickup_location)}</div>
      <div><b>Dropoff:</b> {ride.dropoff_location?.name || JSON.stringify(ride.dropoff_location)}</div>
      <div>
        <b>Estimated distance:</b>{" "}
        {typeof ride.estimated_distance === "number" ? `${(ride.estimated_distance / 1000).toFixed(2)} km` : "—"}
      </div>
      <div><b>Created at:</b> {ride.created_at}</div>
      {ride.matched_at && <div><b>Matched at:</b> {ride.matched_at}</div>}
      {ride.arrived_at && <div><b>Arrived at:</b> {ride.arrived_at}</div>}
      {ride.start_at && <div><b>Start at:</b> {ride.start_at}</div>}
      {ride.end_at && <div><b>End at:</b> {ride.end_at}</div>}
      <div><b>Payment status:</b> {ride.payment_status}</div>
      {ride.cancellation_reason && <div><b>Cancel reason:</b> {ride.cancellation_reason}</div>}
      {ride.cancelled_by && <div><b>Cancelled by:</b> {ride.cancelled_by}</div>}
      {ride.rating && (
        <div>
          <b>Rating:</b> {ride.rating.rating} / 5
          {ride.rating.comment && <span> – "{ride.rating.comment}"</span>}
        </div>
      )}
    </div>
  )

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
                    <TableRow key={ride._id}>
                      <TableCell className="font-medium">{ride._id}</TableCell>
                      <TableCell>{ride.rider_id}</TableCell>
                      <TableCell>{ride.driver_id || "—"}</TableCell>
                      <TableCell>
                        {typeof ride.estimated_distance === "number"
                          ? `${(ride.estimated_distance / 1000).toFixed(2)} km`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {ride.fare?.total_fare
                          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ride.fare.total_fare)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(ride.status)}>{ride.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetail(ride._id)}>
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

      {/* MODAL CHI TIẾT: responsive, max width, scroll nếu overflow */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent
          className="max-w-3xl w-full p-0 overflow-hidden"
          style={{
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DialogHeader className="sticky top-0 z-10 bg-background px-6 pt-6 pb-2">
            <DialogTitle>Ride Details</DialogTitle>
            {/* <DialogDescription>View all information about this ride</DialogDescription> */}
          </DialogHeader>
          {detailLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : rideDetail ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm min-h-[160px]">
                <h4 className="font-semibold mb-2 text-lg">Driver</h4>
                {renderUserInfo(rideDetail.driver, "Driver")}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm min-h-[160px]">
                <h4 className="font-semibold mb-2 text-lg">Rider</h4>
                {renderUserInfo(rideDetail.rider, "Rider")}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm min-h-[200px]">
                <h4 className="font-semibold mb-2 text-lg">Ride Info</h4>
                {renderRideInfo(rideDetail.ride)}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm min-h-[200px]">
                <h4 className="font-semibold mb-2 text-lg">Fare Info</h4>
                {renderFareInfo(rideDetail.ride.fare)}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-destructive">Failed to load ride detail.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
