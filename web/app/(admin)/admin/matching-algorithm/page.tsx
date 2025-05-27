"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MatchingAlgorithmPage() {
  const [matchingAlgorithm, setMatchingAlgorithm] = useState("gale-shapley")
  const [proximityWeight, setProximityWeight] = useState([70])
  const [ratingWeight, setRatingWeight] = useState([50])
  const [priceWeight, setPriceWeight] = useState([30])
  const [maxDistance, setMaxDistance] = useState("10")
  const [timeout, setTimeout] = useState("30")
  const [enableAdvancedSettings, setEnableAdvancedSettings] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matching Algorithm</h1>
        <p className="text-muted-foreground">Configure how riders and drivers are matched</p>
      </div>

      <Tabs defaultValue="algorithm" className="space-y-6">
        <TabsList>
          <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithm">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Selection</CardTitle>
              <CardDescription>Choose the matching algorithm to use for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Matching Algorithm</Label>
                <Select value={matchingAlgorithm} onValueChange={setMatchingAlgorithm}>
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gale-shapley">Gale-Shapley</SelectItem>
                    <SelectItem value="hungarian">Hungarian Algorithm</SelectItem>
                    <SelectItem value="greedy">Greedy Matching</SelectItem>
                    <SelectItem value="custom">Custom Weighted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Algorithm Information</AlertTitle>
                <AlertDescription>
                  {matchingAlgorithm === "gale-shapley" && (
                    <p>
                      The Gale-Shapley algorithm creates stable matches between riders and drivers based on their
                      preferences. This ensures no rider-driver pair would both prefer each other over their current
                      matches.
                    </p>
                  )}
                  {matchingAlgorithm === "hungarian" && (
                    <p>
                      The Hungarian algorithm finds the optimal assignment that minimizes the total cost (e.g.,
                      distance, time) across all rider-driver pairs.
                    </p>
                  )}
                  {matchingAlgorithm === "greedy" && (
                    <p>
                      Greedy matching assigns riders to the closest available drivers. It's fast but may not produce
                      globally optimal results.
                    </p>
                  )}
                  {matchingAlgorithm === "custom" && (
                    <p>
                      Custom weighted matching allows you to define your own weights for different factors like
                      proximity, rating, and price.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600">Save Algorithm</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle>Matching Weights</CardTitle>
              <CardDescription>Configure the importance of different factors in the matching process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <p className="text-sm text-muted-foreground">
                  How important is the distance between rider and driver in the matching process
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="ratingWeight">Rating Weight</Label>
                  <span className="text-sm text-muted-foreground">{ratingWeight}%</span>
                </div>
                <Slider id="ratingWeight" value={ratingWeight} onValueChange={setRatingWeight} max={100} step={5} />
                <p className="text-sm text-muted-foreground">
                  How important is the driver's rating in the matching process
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="priceWeight">Price Weight</Label>
                  <span className="text-sm text-muted-foreground">{priceWeight}%</span>
                </div>
                <Slider id="priceWeight" value={priceWeight} onValueChange={setPriceWeight} max={100} step={5} />
                <p className="text-sm text-muted-foreground">How important is the ride price in the matching process</p>
              </div>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Weight Balance</AlertTitle>
                <AlertDescription>
                  The sum of all weights should ideally equal 100%. Current sum:{" "}
                  {proximityWeight[0] + ratingWeight[0] + priceWeight[0]}%
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600">Save Weights</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="constraints">
          <Card>
            <CardHeader>
              <CardTitle>Matching Constraints</CardTitle>
              <CardDescription>Set limits and thresholds for the matching process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxDistance">Maximum Matching Distance (miles)</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum distance between rider and driver for a match to be considered
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Matching Timeout (seconds)</Label>
                <Input id="timeout" type="number" value={timeout} onChange={(e) => setTimeout(e.target.value)} />
                <p className="text-sm text-muted-foreground">
                  Maximum time to wait for an optimal match before falling back to available drivers
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minRating">Minimum Driver Rating</Label>
                  <Select defaultValue="4.0">
                    <SelectTrigger id="minRating" className="w-[100px]">
                      <SelectValue placeholder="Min Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3.0">3.0</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="4.0">4.0</SelectItem>
                      <SelectItem value="4.5">4.5</SelectItem>
                      <SelectItem value="none">No Minimum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum rating required for drivers to be considered in the matching process
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600">Save Constraints</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced matching parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAdvanced">Enable Advanced Settings</Label>
                  <p className="text-sm text-muted-foreground">
                    Warning: These settings can significantly impact matching performance
                  </p>
                </div>
                <Switch
                  id="enableAdvanced"
                  checked={enableAdvancedSettings}
                  onCheckedChange={setEnableAdvancedSettings}
                />
              </div>

              {enableAdvancedSettings && (
                <>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Changing these settings may affect the stability and performance of the matching system. Proceed
                      with caution.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Processing Size</Label>
                    <Input id="batchSize" type="number" defaultValue="50" />
                    <p className="text-sm text-muted-foreground">
                      Number of ride requests to process in a single batch
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retryAttempts">Retry Attempts</Label>
                    <Input id="retryAttempts" type="number" defaultValue="3" />
                    <p className="text-sm text-muted-foreground">
                      Number of times to retry matching if initial attempt fails
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fallbackStrategy">Fallback Strategy</Label>
                    <Select defaultValue="nearest">
                      <SelectTrigger id="fallbackStrategy">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearest">Nearest Available</SelectItem>
                        <SelectItem value="highest-rated">Highest Rated</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="none">No Fallback</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Strategy to use when optimal matching cannot be found
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" disabled={!enableAdvancedSettings}>
                Save Advanced Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
