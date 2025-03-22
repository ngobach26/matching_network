"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchingEngine } from "@/components/matching-engine"
import { MatchResults } from "@/components/match-results"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Users, Settings } from "lucide-react"
import styles from "./page.module.css"

interface MatchEntity {
  id: string
  name: string
  avatar?: string
  attributes: {
    [key: string]: string | number | boolean
  }
}

interface Match {
  id: string
  entityA: MatchEntity
  entityB: MatchEntity
  score: number
  compatibility: number
  status: "pending" | "accepted" | "rejected" | "favorited"
  matchDate: string
}

export default function RideSharingPage() {
  const [activeTab, setActiveTab] = useState("configure")
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mock data for riders and drivers
  const riders: MatchEntity[] = [
    {
      id: "rider1",
      name: "Alex Johnson",
      attributes: {
        location: "Downtown",
        schedule: "Morning",
        preference: "Fast route",
      },
    },
    {
      id: "rider2",
      name: "Sarah Williams",
      attributes: {
        location: "Suburbs",
        schedule: "Evening",
        preference: "Eco-friendly",
      },
    },
    {
      id: "rider3",
      name: "Michael Chen",
      attributes: {
        location: "Midtown",
        schedule: "Afternoon",
        preference: "Quiet ride",
      },
    },
  ]

  const drivers: MatchEntity[] = [
    {
      id: "driver1",
      name: "David Smith",
      attributes: {
        location: "Downtown",
        schedule: "Morning",
        preference: "Highway",
      },
    },
    {
      id: "driver2",
      name: "Emma Wilson",
      attributes: {
        location: "Suburbs",
        schedule: "Evening",
        preference: "Eco-friendly",
      },
    },
    {
      id: "driver3",
      name: "James Taylor",
      attributes: {
        location: "Midtown",
        schedule: "Afternoon",
        preference: "Scenic route",
      },
    },
  ]

  const handleRunMatching = (params: any) => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Generate mock matches
      const mockMatches: Match[] = []

      for (let i = 0; i < riders.length; i++) {
        const rider = riders[i]
        const driver = drivers[i % drivers.length]

        // Calculate a mock compatibility score
        const compatibility = Math.floor(Math.random() * 30) + 70 // 70-99%

        mockMatches.push({
          id: `match-${i + 1}`,
          entityA: rider,
          entityB: driver,
          score: compatibility / 100,
          compatibility,
          status: "pending",
          matchDate: new Date().toLocaleDateString(),
        })
      }

      setMatches(mockMatches)
      setIsLoading(false)
      setActiveTab("results")

      toast({
        title: "Matching Complete",
        description: `Generated ${mockMatches.length} matches using ${params.algorithm} algorithm.`,
      })
    }, 2000)
  }

  const handleAcceptMatch = (matchId: string) => {
    setMatches((prev) => prev.map((match) => (match.id === matchId ? { ...match, status: "accepted" } : match)))

    toast({
      title: "Match Accepted",
      description: "You have accepted this match.",
    })
  }

  const handleRejectMatch = (matchId: string) => {
    setMatches((prev) => prev.map((match) => (match.id === matchId ? { ...match, status: "rejected" } : match)))

    toast({
      title: "Match Rejected",
      description: "You have rejected this match.",
    })
  }

  const handleFavoriteMatch = (matchId: string) => {
    setMatches((prev) => prev.map((match) => (match.id === matchId ? { ...match, status: "favorited" } : match)))

    toast({
      title: "Match Favorited",
      description: "You have favorited this match.",
    })
  }

  const handleMessageMatch = (matchId: string) => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent.",
    })
  }

  return (
    <div className={styles.scenarioPage}>
      <div className={styles.scenarioHeader}>
        <h1 className={styles.scenarioTitle}>Ride Sharing</h1>
        <p className={styles.scenarioDescription}>
          Match riders with drivers based on location, schedule, and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.scenarioTabs}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="entities">
            <Users className="mr-2 h-4 w-4" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="results" disabled={matches.length === 0}>
            <Upload className="mr-2 h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className={styles.tabContent}>
          <MatchingEngine scenarioType="ride-sharing" onRunMatching={handleRunMatching} />

          <div className={styles.entitySummary}>
            <Card>
              <CardHeader>
                <CardTitle>Entity Summary</CardTitle>
                <CardDescription>Overview of entities available for matching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.entityCounts}>
                  <div className={styles.entityCount}>
                    <h3 className={styles.countLabel}>Riders</h3>
                    <p className={styles.countValue}>{riders.length}</p>
                  </div>
                  <div className={styles.entityCount}>
                    <h3 className={styles.countLabel}>Drivers</h3>
                    <p className={styles.countValue}>{drivers.length}</p>
                  </div>
                  <div className={styles.entityCount}>
                    <h3 className={styles.countLabel}>Possible Matches</h3>
                    <p className={styles.countValue}>{riders.length * drivers.length}</p>
                  </div>
                </div>

                <div className={styles.entityActions}>
                  <Button variant="outline" className={styles.entityButton}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                  <Button variant="outline" className={styles.entityButton}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Entities
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities" className={styles.tabContent}>
          <div className={styles.entitiesSection}>
            <Card className={styles.entityCard}>
              <CardHeader>
                <CardTitle>Riders</CardTitle>
                <CardDescription>People looking for rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.entityList}>
                  {riders.map((rider) => (
                    <div key={rider.id} className={styles.entityItem}>
                      <div className={styles.entityName}>{rider.name}</div>
                      <div className={styles.entityAttributes}>
                        {Object.entries(rider.attributes).map(([key, value]) => (
                          <div key={key} className={styles.entityAttribute}>
                            <span className={styles.attributeKey}>{key}:</span>
                            <span className={styles.attributeValue}>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button className={styles.addEntityButton}>Add Rider</Button>
              </CardContent>
            </Card>

            <Card className={styles.entityCard}>
              <CardHeader>
                <CardTitle>Drivers</CardTitle>
                <CardDescription>People offering rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.entityList}>
                  {drivers.map((driver) => (
                    <div key={driver.id} className={styles.entityItem}>
                      <div className={styles.entityName}>{driver.name}</div>
                      <div className={styles.entityAttributes}>
                        {Object.entries(driver.attributes).map(([key, value]) => (
                          <div key={key} className={styles.entityAttribute}>
                            <span className={styles.attributeKey}>{key}:</span>
                            <span className={styles.attributeValue}>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button className={styles.addEntityButton}>Add Driver</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className={styles.tabContent}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Running matching algorithm...</p>
            </div>
          ) : (
            <MatchResults
              matches={matches}
              scenarioType="ride-sharing"
              onAcceptMatch={handleAcceptMatch}
              onRejectMatch={handleRejectMatch}
              onFavoriteMatch={handleFavoriteMatch}
              onMessageMatch={handleMessageMatch}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

