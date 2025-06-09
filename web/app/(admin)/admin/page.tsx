"use client"

import { useState, useEffect, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Car } from "lucide-react"
import { type Ride, type Driver, type User, adminAPI } from "@/lib/api-client"

type TimeRangeOption = {
  value: number
  label: string
  unit: "hour" | "day"
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: 3, label: "3 hours", unit: "hour" },
  { value: 6, label: "6 hours", unit: "hour" },
  { value: 12, label: "12 hours", unit: "hour" },
  { value: 1, label: "1 day", unit: "day" },
  { value: 3, label: "3 days", unit: "day" },
  { value: 7, label: "7 days", unit: "day" },
  { value: 30, label: "30 days", unit: "day" },
  { value: 90, label: "90 days", unit: "day" },
]

// Helper: group rides by time (hour or day) and area (geohash)
function groupRidesByTime(
  rides: { date: string; location: string }[],
  area: string,
  timeRange: TimeRangeOption
) {
  let filtered = area === "all" ? rides : rides.filter(r => r.location === area)
  const now = new Date()
  let byTime: Record<string, number> = {}

  if (timeRange.unit === "hour") {
    for (let i = timeRange.value - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setHours(d.getHours() - i)
      const key = d.toISOString().slice(0, 13) // "YYYY-MM-DDTHH"
      byTime[key] = 0
    }
    filtered.forEach(ride => {
      const hour = ride.date?.slice(0, 13)
      if (byTime[hour] !== undefined) byTime[hour]++
    })
    return Object.keys(byTime).map(time => ({
      date: time.slice(11, 13) + ":00", // HH:00
      count: byTime[time]
    }))
  } else {
    for (let i = timeRange.value - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0, 10) // "YYYY-MM-DD"
      byTime[key] = 0
    }
    filtered.forEach(ride => {
      const day = ride.date?.slice(0, 10)
      if (byTime[day] !== undefined) byTime[day]++
    })
    return Object.keys(byTime).map(date => ({
      date: date.slice(5), // "MM-DD"
      count: byTime[date]
    }))
  }
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [timeRangeIdx, setTimeRangeIdx] = useState(3) // default: 1 day (idx=3)
  const [area, setArea] = useState("all")
  const [areas, setAreas] = useState<{ value: string, label: string }[]>([{ value: "all", label: "All" }])

  const timeRange = TIME_RANGES[timeRangeIdx]

  // Chart data, always uses selected area
  const chartData = useMemo(() => {
    const chartRides = rides.map(ride => ({
      date: ride.created_at,
      location: ride.geohash,
    }))
    return groupRidesByTime(chartRides, area, timeRange)
  }, [rides, area, timeRange])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { users, drivers, rides } = await adminAPI.getAdminDashboard()
        setUsers(users)
        setDrivers(drivers)
        setRides(rides)

        // Extract unique geohash from rides
        const geohashSet = new Set<string>()
        rides.forEach((ride: Ride) => {
          if (ride.geohash) geohashSet.add(ride.geohash)
        })
        const geohashList = [{ value: "all", label: "All" }, ...Array.from(geohashSet).map(gh => ({
          value: gh,
          label: gh
        }))]
        setAreas(geohashList)
        if (!geohashList.find(a => a.value === area)) setArea("all")
      } catch (error) {
        console.error("Error fetching admin dashboard", error)
      }
    }
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <span className="text-2xl font-bold">{rides.filter((ride: Ride) => ride.status === "completed").length}</span>
            <span className="text-sm text-muted-foreground">Completed Rides</span>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="font-bold text-lg">Ride statistics over time</div>
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-1 text-sm"
              value={timeRangeIdx}
              onChange={e => setTimeRangeIdx(Number(e.target.value))}
            >
              {TIME_RANGES.map((tr, idx) => (
                <option key={tr.label} value={idx}>{tr.label}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-1 text-sm"
              value={area}
              onChange={e => setArea(e.target.value)}
            >
              {areas.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
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
