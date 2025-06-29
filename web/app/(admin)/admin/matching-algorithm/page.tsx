"use client"

import { useState, useEffect } from "react"
import { matchingAPI } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MatchingAlgorithmPage() {
  // Geohash logic
  const [geohashList, setGeohashList] = useState<string[]>([])
  const [selectedGeohash, setSelectedGeohash] = useState<string>("")

  // Config logic
  const [matchingAlgorithm, setMatchingAlgorithm] = useState<"gale_shapley" | "hungarian">("gale_shapley")
  const [proximityWeight, setProximityWeight] = useState<number[]>([70])
  const [ratingWeight, setRatingWeight] = useState<number[]>([30])
  const [maxDistance, setMaxDistance] = useState<string>("10")
  const [minDriverRating, setMinDriverRating] = useState<string>("4.0")
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Lấy danh sách geohash khi load trang
  useEffect(() => {
    const fetchGeohashes = async () => {
      try {
        const list = await matchingAPI.listGeohash()
        setGeohashList(list)
        if (list.length > 0) setSelectedGeohash(list[0])
      } catch (err) {
        setGeohashList([])
      }
    }
    fetchGeohashes()
  }, [])

  useEffect(() => {
    const fetchConfig = async () => {
      if (!selectedGeohash) return
      try {
        const res = await matchingAPI.getConfig(selectedGeohash)
        const cfg = res.config || res

        setMatchingAlgorithm(cfg.algorithm === "hungarian" ? "hungarian" : "gale_shapley")

        setProximityWeight([
          typeof cfg.proximity_weight === "number"
            ? Math.round(cfg.proximity_weight * 100)
            : 70
        ])
        setRatingWeight([
          typeof cfg.rating_weight === "number"
            ? Math.round(cfg.rating_weight * 100)
            : 30
        ])
        setMaxDistance(
          cfg.max_distance !== undefined && cfg.max_distance !== null && !isNaN(cfg.max_distance)
            ? String(cfg.max_distance)
            : "10"
        )
        setMinDriverRating(
          cfg.min_driver_rating !== undefined && cfg.min_driver_rating !== null && !isNaN(cfg.min_driver_rating)
            ? String(cfg.min_driver_rating)
            : "4.0"
        )
      } catch (err) {
        setMatchingAlgorithm("gale_shapley")
        setProximityWeight([70])
        setRatingWeight([30])
        setMaxDistance("10")
        setMinDriverRating("4.0")
      }
    }
    fetchConfig()
  }, [selectedGeohash])

  // Lưu config
  const handleSaveConfig = async () => {
    if (!selectedGeohash) return
    setSaving(true)
    setSaveMessage("")
    try {
      await matchingAPI.setConfig(selectedGeohash, {
        algorithm: matchingAlgorithm,
        proximity_weight: proximityWeight[0] / 100,
        rating_weight: ratingWeight[0] / 100,
        max_distance: parseFloat(maxDistance),
        min_driver_rating: minDriverRating === "none" ? undefined : parseFloat(minDriverRating),
      })
      setSaveMessage("✅ Configuration saved!")
    } catch (e) {
      setSaveMessage("❌ Failed to save configuration.")
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(""), 2500)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Matching Algorithm Settings</h1>
        <p className="text-muted-foreground">Configure how riders and drivers are matched for each area</p>
      </div>

      {/* Dropdown menu for geohash selection */}
      <div className="flex items-center gap-4">
        <Label htmlFor="geohash">Select Area (Geohash)</Label>
        <Select
          value={selectedGeohash}
          onValueChange={setSelectedGeohash}
          disabled={geohashList.length === 0}
        >
          <SelectTrigger id="geohash" className="w-[200px]">
            <SelectValue placeholder="Select geohash" />
          </SelectTrigger>
          <SelectContent>
            {geohashList.map((gh) => (
              <SelectItem key={gh} value={gh}>
                {gh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Algorithm</CardTitle>
          <CardDescription>
            Select the matching algorithm for this geohash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Matching Algorithm</Label>
            <Select value={matchingAlgorithm} onValueChange={v => setMatchingAlgorithm(v as "gale_shapley" | "hungarian")}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gale_shapley">Gale-Shapley</SelectItem>
                <SelectItem value="hungarian">Hungarian Algorithm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Algorithm Information</AlertTitle>
            <AlertDescription>
              {matchingAlgorithm === "gale_shapley" && (
                <p>
                  The Gale-Shapley algorithm creates stable matches between riders and drivers based on their preferences. This ensures no rider-driver pair would both prefer each other over their current matches, with smaller running time.
                </p>
              )}
              {matchingAlgorithm === "hungarian" && (
                <p>
                  The Hungarian algorithm finds the optimal assignment that minimizes the total cost (e.g., distance, time) across all rider-driver pairs, having greater running time.
                </p>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching Weights</CardTitle>
          <CardDescription>Configure the importance of different factors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="proximityWeight">Proximity Weight (%)</Label>
              <Input
                id="proximityWeight"
                type="number"
                min={0}
                max={100}
                value={proximityWeight[0]}
                onChange={e => setProximityWeight([parseInt(e.target.value) || 0])}
                className="w-24 text-right"
              />
            </div>
            <p className="text-sm text-muted-foreground">How important is the distance between rider and driver in the matching process</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="ratingWeight">Rating Weight (%)</Label>
              <Input
                id="ratingWeight"
                type="number"
                min={0}
                max={100}
                value={ratingWeight[0]}
                onChange={e => setRatingWeight([parseInt(e.target.value) || 0])}
                className="w-24 text-right"
              />
            </div>
            <p className="text-sm text-muted-foreground">How important is the driver's rating in the matching process</p>
          </div>
          {proximityWeight[0] + ratingWeight[0] !== 100 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Weights</AlertTitle>
              <AlertDescription>
                <span className="font-semibold text-red-500">The sum of all weights must equal 100%.</span> Current sum: {proximityWeight[0] + ratingWeight[0]}%
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Weight Balance</AlertTitle>
              <AlertDescription>
                The sum of all weights is 100%. Good job!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching Constraints</CardTitle>
          <CardDescription>Set limits and thresholds for the matching process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxDistance">Maximum Matching Distance (meters)</Label>
            <Input id="maxDistance" type="number" value={maxDistance} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxDistance(e.target.value)} />
            <p className="text-sm text-muted-foreground">Maximum distance between rider and driver for a match to be considered</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="minRating">Minimum Driver Rating</Label>
              <Select value={minDriverRating} onValueChange={setMinDriverRating}>
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
            <p className="text-sm text-muted-foreground">Minimum rating required for drivers to be considered in the matching process</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 items-center">
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={handleSaveConfig}
          disabled={
            saving ||
            !selectedGeohash ||
            proximityWeight[0] + ratingWeight[0] !== 100
          }
        >
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
        {saveMessage && <span className="ml-4">{saveMessage}</span>}
      </div>
    </div>
  )
}
