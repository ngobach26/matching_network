"use client"

import { useState, useEffect, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Car } from "lucide-react"
import { type Ride, type Driver, type User, adminAPI } from "@/lib/api-client"
const AREAS = [
  { value: "all", label: "Tất cả" },
  { value: "HaNoi", label: "Hà Nội" },
  { value: "HoChiMinh", label: "Hồ Chí Minh" },
  { value: "ThanhHoa", label: "Thanh Hóa" },
  // Thêm các khu vực thực tế bạn có
]

// Tạo mock data mẫu hoặc filter từ rides
function groupRidesByDate(
  rides: { date: string; location: string }[],
  area = "all",
  range = 7
) {
  let filtered = area === "all" ? rides : rides.filter(r => r.location === area)
  // Khai báo byDate với kiểu index signature
  const byDate: Record<string, number> = {}
  const today = new Date()
  for (let i = range - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    byDate[key] = 0
  }
  filtered.forEach(ride => {
    const day = ride.date?.slice(0, 10)
    if (byDate[day] !== undefined) byDate[day]++
  })
  return Object.keys(byDate).map(date => ({
    date: date.slice(5), // "MM-DD"
    count: byDate[date]
  }))
}



export const mockRides = [
  // Tuần này (7 ngày gần nhất)
  { id: 1, date: "2025-05-20T09:00:00Z", location: "HaNoi" },
  { id: 2, date: "2025-05-20T11:10:00Z", location: "HaNoi" },
  { id: 3, date: "2025-05-21T08:50:00Z", location: "ThanhHoa" },
  { id: 4, date: "2025-05-21T18:40:00Z", location: "HaNoi" },
  { id: 5, date: "2025-05-22T09:30:00Z", location: "HoChiMinh" },
  { id: 6, date: "2025-05-22T10:15:00Z", location: "ThanhHoa" },
  { id: 7, date: "2025-05-22T15:20:00Z", location: "HaNoi" },
  { id: 8, date: "2025-05-23T13:10:00Z", location: "HaNoi" },
  { id: 9, date: "2025-05-24T07:40:00Z", location: "HoChiMinh" },
  { id: 10, date: "2025-05-24T14:10:00Z", location: "ThanhHoa" },
  { id: 11, date: "2025-05-25T08:10:00Z", location: "ThanhHoa" },
  { id: 12, date: "2025-05-25T18:50:00Z", location: "HaNoi" },
  { id: 13, date: "2025-05-26T10:45:00Z", location: "HoChiMinh" },
  { id: 14, date: "2025-05-26T13:00:00Z", location: "ThanhHoa" },
  // Một số cũ hơn cho thử 30 ngày
  { id: 15, date: "2025-05-13T09:15:00Z", location: "HaNoi" },
  { id: 16, date: "2025-05-16T15:20:00Z", location: "HaNoi" },
  { id: 17, date: "2025-05-17T11:40:00Z", location: "HoChiMinh" },
  { id: 18, date: "2025-05-17T17:25:00Z", location: "ThanhHoa" },
  { id: 19, date: "2025-05-18T07:30:00Z", location: "ThanhHoa" },
  { id: 20, date: "2025-05-10T19:20:00Z", location: "HoChiMinh" },
]

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [rides, setRides] = useState<any[]>(mockRides)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [timeRange, setTimeRange] = useState(7)
  const [area, setArea] = useState("all")
  const chartData = useMemo(() =>
    groupRidesByDate(rides, area, timeRange)
  , [rides, area, timeRange])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { users, drivers, rides } = await adminAPI.getAdminDashboard()
        setUsers(users)
        setDrivers(drivers)
        setRides(rides)
      } catch (error) {
        console.error("Error fetching admin dashboard", error)
      }
    }
  
    fetchDashboardData()
  }, [])
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform and monitor key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-orange-100 p-3 mb-3">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-2xl font-bold">{users.length}</span>
            <span className="text-sm text-muted-foreground">Total Users</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Car className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-2xl font-bold">{drivers.length}</span>
            <span className="text-sm text-muted-foreground">Active Drivers</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Car className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-2xl font-bold">{rides.length}</span>
            <span className="text-sm text-muted-foreground">Total Rides</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <Car className="h-6 w-6 text-purple-500" />
            </div>
            <span className="text-2xl font-bold">{rides.filter((ride: { status: string }) => ride.status === "completed").length}</span>
            <span className="text-sm text-muted-foreground">Completed Rides</span>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="font-bold text-lg">Thống kê chuyến đi theo thời gian</div>
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-1 text-sm"
              value={timeRange}
              onChange={e => setTimeRange(Number(e.target.value))}
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={90}>3 tháng</option>
              {/* Có thể thêm "Tùy chỉnh" ở đây */}
            </select>
            <select
              className="border rounded px-3 py-1 text-sm"
              value={area}
              onChange={e => setArea(e.target.value)}
            >
              {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
        </div>
        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#fb923c" fillOpacity={1} fill="url(#colorRide)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
