"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("Multi-Role Platform")
  const [supportEmail, setSupportEmail] = useState("support@example.com")
  const [maintenanceMode, setMaintenanceMode] = useState("off")
  const [defaultTheme, setDefaultTheme] = useState("light")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSaveSettings = () => {
    // Simulate API call
    setSaveSuccess(false)
    setSaveError(null)

    // Simulate successful save
    setTimeout(() => {
      setSaveSuccess(true)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-800" />
                  <AlertDescription>Settings saved successfully!</AlertDescription>
                </Alert>
              )}

              {saveError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <Select value={maintenanceMode} onValueChange={setMaintenanceMode}>
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

              {maintenanceMode === "scheduled" && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceDate">Maintenance Date</Label>
                  <Input id="maintenanceDate" type="datetime-local" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  placeholder="Enter message to display during maintenance"
                  className="resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Configure how the platform looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultTheme">Default Theme</Label>
                <Select value={defaultTheme} onValueChange={setDefaultTheme}>
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

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Select defaultValue="orange">
                  <SelectTrigger id="primaryColor">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowUserThemes">Allow User Theme Selection</Label>
                  <p className="text-sm text-muted-foreground">Let users choose their preferred theme</p>
                </div>
                <Switch id="allowUserThemes" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showLogo">Show Logo</Label>
                  <p className="text-sm text-muted-foreground">Display platform logo in the header</p>
                </div>
                <Switch id="showLogo" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Appearance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send important updates via email</p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications to mobile devices</p>
                </div>
                <Switch id="pushNotifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
                </div>
                <Switch id="smsNotifications" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger id="notificationFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch id="twoFactorAuth" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" />
                <p className="text-sm text-muted-foreground">
                  Time before inactive admin sessions are automatically logged out
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="passwordPolicy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                    <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                    <SelectItem value="custom">Custom Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ipRestriction">IP Address Restriction</Label>
                  <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses</p>
                </div>
                <Switch id="ipRestriction" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedIPs">Allowed IP Addresses</Label>
                <Textarea
                  id="allowedIPs"
                  placeholder="Enter comma-separated IP addresses"
                  className="resize-none"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Leave empty to allow access from any IP address</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
