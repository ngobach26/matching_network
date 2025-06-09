"use client"

import { useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardList, CheckCircle, XCircle, Eye, Trash, FileText, Car, FileCheck
} from "lucide-react"
import clsx from "clsx"

// Mock data mẫu ứng viên
const mockApplications = [
  {
    id: "drv-001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    submittedAt: "2024-05-19T09:12:00Z",
    region: "Hà Nội",
    vehicleType: "4 chỗ",
    plateNumber: "30A-123.45",
    idNumber: "012345678",
    attachments: [
      { type: "Bằng lái", url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308" },
      { type: "Đăng ký xe", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    ],
    status: "pending", // pending | approved | rejected
    note: "",
  },
  {
    id: "drv-002",
    name: "Phạm Thị B",
    email: "phamb@gmail.com",
    submittedAt: "2024-05-21T14:36:00Z",
    region: "Hồ Chí Minh",
    vehicleType: "7 chỗ",
    plateNumber: "51B-987.65",
    idNumber: "987654321",
    attachments: [
      { type: "Bằng lái", url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308" },
    ],
    status: "approved",
    note: "Đã xác minh đủ",
  },
  {
    id: "drv-003",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    submittedAt: "2024-05-20T16:22:00Z",
    region: "Thanh Hóa",
    vehicleType: "Xe máy",
    plateNumber: "36H-012.34",
    idNumber: "555667788",
    attachments: [],
    status: "rejected",
    note: "Thiếu giấy đăng ký xe",
  },
]

// Các khu vực
const REGIONS = [
  "Tất cả", "Hà Nội", "Hồ Chí Minh", "Thanh Hóa", "Đà Nẵng"
]

// Các trạng thái
const STATUS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function DriverApplicationsPage() {
  const [applications, setApplications] = useState(mockApplications)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [region, setRegion] = useState("Tất cả")
  const [detail, setDetail] = useState<any | null>(null) // show detail modal

  // Lọc danh sách theo search, status, region
  const filtered = applications.filter(app => {
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.plateNumber.toLowerCase().includes(q)
    const matchesStatus = status === "all" || app.status === status
    const matchesRegion = region === "Tất cả" || app.region === region
    return matchesSearch && matchesStatus && matchesRegion
  })

  // Các action cơ bản (mock, update local state)
  function handleApprove(id: string) {
    setApplications(apps =>
      apps.map(app => app.id === id ? { ...app, status: "approved" } : app)
    )
  }
  function handleReject(id: string) {
    setApplications(apps =>
      apps.map(app => app.id === id ? { ...app, status: "rejected" } : app)
    )
  }
  function handleDelete(id: string) {
    setApplications(apps => apps.filter(app => app.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-orange-500" />
                  Drivers Applications
                </span>
              </CardTitle>
              <CardDescription>Quản lý hồ sơ đăng ký tài xế trên hệ thống</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc biển số..."
              className="max-w-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ứng viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{formatDate(app.submittedAt)}</TableCell>
                      <TableCell>{app.region}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Car className="h-4 w-4 text-blue-500" />
                          {app.vehicleType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">{app.plateNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={clsx(
                            app.status === "pending" && "bg-yellow-100 text-yellow-700",
                            app.status === "approved" && "bg-green-100 text-green-700",
                            app.status === "rejected" && "bg-red-100 text-red-700"
                          )}
                        >
                          {STATUS.find(s => s.value === app.status)?.label || app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setDetail(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(app.id)}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleReject(app.id)}>
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(app.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy hồ sơ phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} / {applications.length} hồ sơ
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal: Chi tiết ứng viên */}
      {detail && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg relative p-6">
            <button className="absolute top-2 right-2 p-1" onClick={() => setDetail(null)}>
              <XCircle className="w-6 h-6 text-gray-400 hover:text-red-400" />
            </button>
            <div className="mb-4">
              <div className="text-xl font-bold mb-1">{detail.name}</div>
              <div className="text-sm text-muted-foreground mb-1">{detail.email}</div>
              <div className="text-xs text-gray-500 mb-3">Ngày đăng ký: {formatDate(detail.submittedAt)}</div>
              <div className="flex gap-2 mb-2">
                <Badge>{detail.region}</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {detail.vehicleType}
                </Badge>
                <Badge variant="outline" className="bg-slate-100 text-slate-700">
                  {detail.plateNumber}
                </Badge>
              </div>
              <div className="flex gap-2 items-center mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs text-gray-500">CCCD/CMND:</span>
                <span className="text-xs font-semibold">{detail.idNumber.replace(/.(?=.{3})/g, "*")}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-sm">Trạng thái: </span>
                <Badge
                  className={clsx(
                    detail.status === "pending" && "bg-yellow-100 text-yellow-700",
                    detail.status === "approved" && "bg-green-100 text-green-700",
                    detail.status === "rejected" && "bg-red-100 text-red-700"
                  )}
                >
                  {STATUS.find(s => s.value === detail.status)?.label || detail.status}
                </Badge>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-sm">Ghi chú: </span>
                <span className="text-sm text-gray-700">{detail.note || "—"}</span>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">Tài liệu kèm theo:</div>
                {detail.attachments.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {detail.attachments.map((att: any, i: number) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener" className="block">
                        <img src={att.url} alt={att.type} className="w-20 h-14 rounded border object-cover" />
                        <div className="text-xs text-center">{att.type}</div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">Không có tài liệu</div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              {detail.status === "pending" && (
                <>
                  <Button className="bg-green-500 hover:bg-green-600" onClick={() => { handleApprove(detail.id); setDetail(null); }}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600" onClick={() => { handleReject(detail.id); setDetail(null); }}>
                    <XCircle className="w-4 h-4 mr-1" /> Từ chối
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
