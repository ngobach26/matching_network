"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Car, FileText, Briefcase, UserPlus, Edit, Trash, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
// Import the MobileNav component
import { MobileNav } from "@/components/MobileNav"

export default function AdminPage() {
  const [matchingAlgorithm, setMatchingAlgorithm] = useState("proximity")
  const [proximityWeight, setProximityWeight] = useState([70])
  const [ratingWeight, setRatingWeight] = useState([50])
  const [priceWeight, setPriceWeight] = useState([30])
  const router = useRouter()

  // Add the MobileNav component to the return statement
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="hidden md:flex">
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary/20 p-3 mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold">248</span>
            <span className="text-sm text-muted-foreground">Total Users</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3">
              <Car className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold">124</span>
            <span className="text-sm text-muted-foreground">Active Drivers</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3">
              <FileText className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold">56</span>
            <span className="text-sm text-muted-foreground">Paper Reviews</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mb-3">
              <Briefcase className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold">89</span>
            <span className="text-sm text-muted-foreground">Job Applications</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage platform users and their roles</CardDescription>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <Input placeholder="Search users..." className="max-w-sm" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="rider">Rider</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="candidate">Candidate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell>john.doe@example.com</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            Rider
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            Driver
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jane Smith</TableCell>
                      <TableCell>jane.smith@example.com</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Reviewer
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Robert Johnson</TableCell>
                      <TableCell>robert.j@example.com</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          >
                            Candidate
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Showing 3 of 248 users</div>
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
        </TabsContent>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle>Entity Management</CardTitle>
              <CardDescription>Manage drivers, ride requests, papers, and jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="drivers">
                <TabsList className="mb-4">
                  <TabsTrigger value="drivers">Drivers</TabsTrigger>
                  <TabsTrigger value="rides">Ride Requests</TabsTrigger>
                  <TabsTrigger value="papers">Papers</TabsTrigger>
                  <TabsTrigger value="jobs">Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="drivers">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Michael Johnson</TableCell>
                          <TableCell>Toyota Camry (White)</TableCell>
                          <TableCell>DL-12345</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Active</Badge>
                          </TableCell>
                          <TableCell>4.8/5</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Sarah Williams</TableCell>
                          <TableCell>Honda Civic (Blue)</TableCell>
                          <TableCell>DL-67890</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Active</Badge>
                          </TableCell>
                          <TableCell>4.6/5</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="rides">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Rider</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Pickup</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">RID-1234</TableCell>
                          <TableCell>John Doe</TableCell>
                          <TableCell>Michael Johnson</TableCell>
                          <TableCell>123 Main St</TableCell>
                          <TableCell>456 Park Ave</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500">In Transit</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">RID-5678</TableCell>
                          <TableCell>Alice Brown</TableCell>
                          <TableCell>Sarah Williams</TableCell>
                          <TableCell>789 Oak St</TableCell>
                          <TableCell>101 Pine Ave</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Matching Configuration</CardTitle>
              <CardDescription>Configure the matching algorithm and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Matching Algorithm</Label>
                <Select value={matchingAlgorithm} onValueChange={setMatchingAlgorithm}>
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proximity">Proximity-based</SelectItem>
                    <SelectItem value="rating">Rating-based</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Proximity + Rating)</SelectItem>
                    <SelectItem value="custom">Custom Weighted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {matchingAlgorithm === "custom" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="proximityWeight">Proximity Weight</Label>
                      <span className="text-sm text-muted-foreground">{proximityWeight}%</span>
                    </div>
                    <Slider
                      id="proximityWeight"
                      value={proximityWeight}
                      onValueChange={setProximityWeight}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="ratingWeight">Rating Weight</Label>
                      <span className="text-sm text-muted-foreground">{ratingWeight}%</span>
                    </div>
                    <Slider id="ratingWeight" value={ratingWeight} onValueChange={setRatingWeight} max={100} step={5} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="priceWeight">Price Weight</Label>
                      <span className="text-sm text-muted-foreground">{priceWeight}%</span>
                    </div>
                    <Slider id="priceWeight" value={priceWeight} onValueChange={setPriceWeight} max={100} step={5} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxDistance">Maximum Matching Distance (miles)</Label>
                <Input id="maxDistance" type="number" defaultValue="10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Matching Timeout (seconds)</Label>
                <Input id="timeout" type="number" defaultValue="30" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure global platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" defaultValue="Multi-Role Platform" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <Select defaultValue="off">
                  <SelectTrigger id="maintenanceMode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="on">On (Emergency)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTheme">Default Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="defaultTheme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <MobileNav />
    </div>
  )
}
