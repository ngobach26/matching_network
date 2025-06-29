"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Eye, LoaderCircle } from "lucide-react"
import clsx from "clsx"
import { driverAPI } from "@/lib/api-client"

// Driver status type and mapping
export type DriverStatusType = "active" | "rejected" | "info_required" | "pending" | "inactive";
const DRIVER_STATUS: Record<DriverStatusType, string> = {
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
  info_required: "Info required",
  inactive: "Inactive",
}
const DRIVER_STATUS_STYLE: Record<DriverStatusType, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  info_required: "bg-orange-100 text-orange-700",
  inactive: "bg-gray-200 text-gray-600",
}
const STATUS_BUTTON_STYLE: Record<DriverStatusType, string> = {
  active: "bg-green-500 hover:bg-green-600",
  rejected: "bg-red-500 hover:bg-red-600",
  pending: "bg-blue-500 hover:bg-blue-600",
  info_required: "bg-orange-500 hover:bg-orange-600",
  inactive: "bg-gray-400 hover:bg-gray-500",
}
const STATUS_ACTIONS: Record<DriverStatusType, { label: string; to: DriverStatusType }[]> = {
  pending: [
    { label: "Activate", to: "active" },
    { label: "Reject", to: "rejected" },
    { label: "Request More Info", to: "info_required" },
  ],
  info_required: [
    { label: "Resubmit Info", to: "pending" },
    { label: "Request More Info", to: "info_required" },
  ],
  active: [
    { label: "Deactivate", to: "inactive" },
  ],
  inactive: [
    { label: "Activate", to: "active" },
  ],
  rejected: [],
}
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...Object.entries(DRIVER_STATUS).map(([key, label]) => ({
    value: key,
    label,
  }))
] as { value: string; label: string }[]

function formatDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function DriversListPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<DriverStatusType | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState("")

  // Fetch driver list
  useEffect(() => {
    driverAPI.listDrivers()
      .then(setDrivers)
      .finally(() => setLoading(false))
  }, [])

  // Open modal and fetch driver detail
  const handleOpenDetail = async (userId: number) => {
    setDetailId(userId)
    setDetailLoading(true)
    try {
      const data = await driverAPI.getDriverDetail(userId)
      setDetail(data)
    } catch (e) {
      setDetail(null)
    }
    setDetailLoading(false)
  }

  // Update driver status
  const handleUpdateStatus = async (toStatus: DriverStatusType) => {
    if (!detail) return
    setStatusUpdating(toStatus)
    try {
      await driverAPI.updateDriverStatus(detail.driver.user_id, { new_status: toStatus })
      // Refetch detail + list
      const [newDetail, newList] = await Promise.all([
        driverAPI.getDriverDetail(detail.driver.user_id),
        driverAPI.listDrivers()
      ])
      setDetail(newDetail)
      setDrivers(newList)
    } finally {
      setStatusUpdating(null)
    }
  }
  useEffect(() => {
    if (detail && detail.driver) {
      setEditMode(false)
      setEditForm({
        driver_license: detail.driver.driver_license || "",
        vehicle: { ...detail.driver.vehicle } || {}
      })
      setEditError("")
      setEditSuccess("")
    }
  }, [detailId, detail])

  // Hàm handle change form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("vehicle.")) {
      const vkey = name.replace("vehicle.", "")
      setEditForm((prev: any) => ({
        ...prev,
        vehicle: { ...prev.vehicle, [vkey]: value }
      }))
    } else {
      setEditForm((prev: any) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Hàm lưu cập nhật driver
  const handleSaveEdit = async () => {
    setEditError("")
    setEditSuccess("")
    setEditLoading(true)
    try {
      await driverAPI.updateDriver(detail.driver.user_id, {
        driver_license: editForm.driver_license,
        vehicle: editForm.vehicle
      })
      // Refetch data
      const [newDetail, newList] = await Promise.all([
        driverAPI.getDriverDetail(detail.driver.user_id),
        driverAPI.listDrivers()
      ])
      setDetail(newDetail)
      setDrivers(newList)
      setEditSuccess("Updated successfully!")
      setEditMode(false)
    } catch (err: any) {
      setEditError("Update failed!")
    } finally {
      setEditLoading(false)
    }
  }

  // Filter/search
  const filtered = drivers.filter(d => {
    const q = search.trim().toLowerCase()
    const statusOk =
      statusFilter === "all" ||
      d.status === statusFilter
    return (
      statusOk &&
      (
        !q ||
        d.user_id?.toString().includes(q) ||
        d.driver_license?.toLowerCase().includes(q) ||
        d.vehicle?.plate_number?.toLowerCase().includes(q)
      )
    )
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-500" />
              Driver List
            </span>
          </CardTitle>
          <CardDescription>Manage all drivers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Input
              placeholder="Search by User ID, license or plate number..."
              className="max-w-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Rides</TableHead>
                  <TableHead>Average Rating</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      <LoaderCircle className="animate-spin inline mr-2" /> Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No driver found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(driver => {
                    const status = driver.status as DriverStatusType;
                    return (
                      <TableRow key={driver.user_id}>
                        <TableCell>{driver.user_id}</TableCell>
                        <TableCell>{driver.driver_license}</TableCell>
                        <TableCell>{driver.vehicle?.vehicle_type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 text-slate-700">
                            {driver.vehicle?.plate_number}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={DRIVER_STATUS_STYLE[status]}>
                            {DRIVER_STATUS[status] || status}
                          </Badge>
                        </TableCell>
                        <TableCell>{driver.total_rides ?? 0}</TableCell>
                        <TableCell>{Number(driver.rating_average || 0).toFixed(2)}</TableCell>
                        <TableCell>{formatDate(driver.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetail(driver.user_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} / {drivers.length} drivers
          </div>
        </CardFooter>
      </Card>

      {/* Driver Detail Modal */}
      {/* Driver Detail Modal */}
      {detailId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg relative p-6">
            <button className="absolute top-2 right-2 p-1" onClick={() => { setDetailId(null); setDetail(null); }}>
              <span className="text-gray-400 hover:text-red-400">✕</span>
            </button>
            {detailLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoaderCircle className="animate-spin mr-2" /> Loading detail...
              </div>
            ) : !detail ? (
              <div className="text-center text-red-400">Failed to load driver detail.</div>
            ) : (
              <div>
                {/* -------- User info -------- */}
                <div className="text-xl font-bold mb-1">
                  Driver #{detail.driver.user_id}
                </div>
                <div className="flex gap-3 items-center mb-2">
                  {detail.user?.avatar_url && (
                    <img
                      src={detail.user.avatar_url}
                      alt={detail.user.name || "Avatar"}
                      className="w-10 h-10 rounded-full border object-cover"
                    />
                  )}
                  <div>
                    <div className="text-base font-semibold">{detail.user?.name || "-"}</div>
                    <div className="text-xs text-muted-foreground">{detail.user?.email || "-"}</div>
                    <div className="text-xs text-gray-500">{detail.user?.phone_number && `Phone: ${detail.user.phone_number}`}</div>
                  </div>
                </div>
                {detail.user?.address && (
                  <div className="mb-1 text-xs text-gray-500">Address: {detail.user.address}</div>
                )}
                {detail.user?.bio && (
                  <div className="mb-1 text-xs text-gray-500">Bio: {detail.user.bio}</div>
                )}
                {detail.user?.date_of_birth && (
                  <div className="mb-1 text-xs text-gray-500">DOB: {formatDate(detail.user.date_of_birth)}</div>
                )}
                {detail.user?.cover_image_url && (
                  <img
                    src={detail.user.cover_image_url}
                    alt="cover"
                    className="w-full rounded mb-3 max-h-32 object-cover border"
                  />
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Created at: {formatDate(detail.driver.created_at)}
                </div>

                {/* -------- Edit Mode -------- */}
                {editMode ? (
                  <div className="mt-2 space-y-2">
                    <div className="text-base font-semibold mb-1">Edit Driver Information</div>
                    <div className="mb-2">
                      <label className="text-xs font-semibold">Driver License</label>
                      <Input
                        name="driver_license"
                        value={editForm.driver_license}
                        onChange={handleEditFormChange}
                        className="mt-1"
                        disabled={editLoading}
                      />
                    </div>
                    <div className="font-semibold text-xs mt-4 mb-1">Vehicle Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-semibold">Type</label>
                        <Input
                          name="vehicle.vehicle_type"
                          value={editForm.vehicle.vehicle_type}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Brand</label>
                        <Input
                          name="vehicle.brand"
                          value={editForm.vehicle.brand}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Model</label>
                        <Input
                          name="vehicle.model"
                          value={editForm.vehicle.model}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Plate Number</label>
                        <Input
                          name="vehicle.plate_number"
                          value={editForm.vehicle.plate_number}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Capacity</label>
                        <Input
                          name="vehicle.capacity"
                          type="number"
                          value={editForm.vehicle.capacity}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Color</label>
                        <Input
                          name="vehicle.color"
                          value={editForm.vehicle.color}
                          onChange={handleEditFormChange}
                          disabled={editLoading}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {/* Hiển thị lỗi/thành công */}
                    {editError && <div className="text-red-500 text-xs mt-2">{editError}</div>}
                    {editSuccess && <div className="text-green-600 text-xs mt-2">{editSuccess}</div>}
                    <div className="flex gap-2 mt-3">
                      <Button className="bg-orange-500" onClick={handleSaveEdit} disabled={editLoading}>
                        {editLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} disabled={editLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* -------- Driver info (View mode) -------- */}
                    <div className="flex gap-2 mb-2">
                      <Badge>{detail.driver.vehicle?.vehicle_type || "-"}</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {detail.driver.vehicle?.brand || "-"} {detail.driver.vehicle?.model || ""}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700">
                        {detail.driver.vehicle?.plate_number || "-"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-xs text-gray-500">License:</span>
                      <span className="text-xs font-semibold">{detail.driver.driver_license || "-"}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-sm">Status: </span>
                      <Badge className={DRIVER_STATUS_STYLE[detail.driver.status as DriverStatusType]}>
                        {DRIVER_STATUS[detail.driver.status as DriverStatusType] || detail.driver.status}
                      </Badge>
                    </div>
                    <div className="mb-2 flex gap-2 flex-wrap text-sm">
                      <div>
                        <span className="font-semibold">Total Rides:</span> {detail.driver.total_rides ?? 0}
                      </div>
                      <div>
                        <span className="font-semibold">Average Rating:</span>{" "}
                        {detail.driver.rating_average !== null && detail.driver.rating_average !== undefined
                          ? Number(detail.driver.rating_average).toFixed(2)
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Rating Count:</span>{" "}
                        {detail.driver.rating_count !== null && detail.driver.rating_count !== undefined
                          ? detail.driver.rating_count
                          : "-"}
                      </div>
                    </div>

                    {/* Vehicle details box */}
                    {detail.driver.vehicle && (
                      <div className="border rounded p-3 mt-2 bg-gray-50">
                        <div className="font-semibold mb-1 text-sm">Vehicle Details</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <strong>Type:</strong> {detail.driver.vehicle.vehicle_type || "-"}
                          </div>
                          <div>
                            <strong>Brand:</strong> {detail.driver.vehicle.brand || "-"}
                          </div>
                          <div>
                            <strong>Model:</strong> {detail.driver.vehicle.model || "-"}
                          </div>
                          <div>
                            <strong>Plate Number:</strong> {detail.driver.vehicle.plate_number || "-"}
                          </div>
                          <div>
                            <strong>Capacity:</strong> {detail.driver.vehicle.capacity ?? "-"}
                          </div>
                          <div>
                            <strong>Color:</strong> {detail.driver.vehicle.color || "-"}
                          </div>
                          <div>
                            <strong>Vehicle Created At:</strong>{" "}
                            {detail.driver.vehicle.created_at
                              ? formatDate(detail.driver.vehicle.created_at)
                              : "-"}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Edit button */}
                    <div className="mt-4 flex gap-2">
                      <Button className="bg-orange-500" onClick={() => setEditMode(true)}>
                        Edit Driver
                      </Button>
                    </div>
                    {/* Status update buttons giữ nguyên */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(STATUS_ACTIONS[detail.driver.status as DriverStatusType] || []).map(action => (
                        <Button
                          key={action.to}
                          className={STATUS_BUTTON_STYLE[action.to]}
                          onClick={() => handleUpdateStatus(action.to)}
                          disabled={!!statusUpdating}
                        >
                          {statusUpdating === action.to && <LoaderCircle className="animate-spin h-4 w-4 mr-1" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
