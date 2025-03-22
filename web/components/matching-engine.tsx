"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info } from "lucide-react"
import styles from "./matching-engine.module.css"

interface MatchingEngineProps {
  scenarioType: string
  onRunMatching: (params: any) => void
}

export function MatchingEngine({ scenarioType, onRunMatching }: MatchingEngineProps) {
  const [algorithm, setAlgorithm] = useState("stable")
  const [weightPreference, setWeightPreference] = useState(50)
  const [weightLocation, setWeightLocation] = useState(30)
  const [weightAvailability, setWeightAvailability] = useState(20)
  const [considerPastMatches, setConsiderPastMatches] = useState(true)

  const getScenarioParams = () => {
    switch (scenarioType) {
      case "ride-sharing":
        return {
          entityA: "Riders",
          entityB: "Drivers",
          factors: [
            { id: "location", name: "Location", weight: weightLocation },
            { id: "schedule", name: "Schedule", weight: weightAvailability },
            { id: "preference", name: "Preferences", weight: weightPreference },
          ],
        }
      case "paper-review":
        return {
          entityA: "Papers",
          entityB: "Reviewers",
          factors: [
            { id: "expertise", name: "Expertise", weight: weightPreference },
            { id: "availability", name: "Availability", weight: weightAvailability },
            { id: "conflicts", name: "Conflicts", weight: weightLocation },
          ],
        }
      case "job-matching":
        return {
          entityA: "Jobs",
          entityB: "Candidates",
          factors: [
            { id: "skills", name: "Skills", weight: weightPreference },
            { id: "experience", name: "Experience", weight: weightLocation },
            { id: "availability", name: "Availability", weight: weightAvailability },
          ],
        }
      case "mentorship":
        return {
          entityA: "Mentors",
          entityB: "Mentees",
          factors: [
            { id: "expertise", name: "Expertise", weight: weightPreference },
            { id: "goals", name: "Goals", weight: weightLocation },
            { id: "availability", name: "Availability", weight: weightAvailability },
          ],
        }
      case "team-formation":
        return {
          entityA: "Teams",
          entityB: "Members",
          factors: [
            { id: "skills", name: "Skills", weight: weightPreference },
            { id: "personality", name: "Personality", weight: weightLocation },
            { id: "availability", name: "Availability", weight: weightAvailability },
          ],
        }
      default:
        return {
          entityA: "Entity A",
          entityB: "Entity B",
          factors: [
            { id: "factor1", name: "Factor 1", weight: weightPreference },
            { id: "factor2", name: "Factor 2", weight: weightLocation },
            { id: "factor3", name: "Factor 3", weight: weightAvailability },
          ],
        }
    }
  }

  const scenarioParams = getScenarioParams()

  const handleRunMatching = () => {
    onRunMatching({
      algorithm,
      weights: {
        preference: weightPreference,
        location: weightLocation,
        availability: weightAvailability,
      },
      considerPastMatches,
      scenarioType,
    })
  }

  return (
    <Card className={styles.engineCard}>
      <CardHeader>
        <CardTitle className={styles.engineTitle}>Matching Engine</CardTitle>
        <CardDescription>
          Configure and run the matching algorithm for{" "}
          {scenarioType
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="algorithm" className={styles.engineTabs}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="algorithm" className={styles.tabContent}>
            <div className={styles.algorithmSelection}>
              <Label htmlFor="algorithm-select">Matching Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger id="algorithm-select">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable Matching (Gale-Shapley)</SelectItem>
                  <SelectItem value="hungarian">Hungarian Algorithm</SelectItem>
                  <SelectItem value="greedy">Greedy Matching</SelectItem>
                </SelectContent>
              </Select>

              <div className={styles.algorithmInfo}>
                <div className={styles.infoIcon}>
                  <Info size={16} />
                </div>
                <p className={styles.infoText}>
                  {algorithm === "stable" &&
                    "Stable Matching ensures no pair would prefer each other over their current matches."}
                  {algorithm === "hungarian" &&
                    "Hungarian Algorithm finds the optimal assignment that minimizes the total cost."}
                  {algorithm === "greedy" &&
                    "Greedy Matching iteratively selects the best available match based on scores."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weights" className={styles.tabContent}>
            <div className={styles.weightsSection}>
              {scenarioParams.factors.map((factor) => (
                <div key={factor.id} className={styles.weightItem}>
                  <div className={styles.weightHeader}>
                    <Label htmlFor={`weight-${factor.id}`}>{factor.name}</Label>
                    <span className={styles.weightValue}>{factor.weight}%</span>
                  </div>
                  <Slider
                    id={`weight-${factor.id}`}
                    min={0}
                    max={100}
                    step={5}
                    value={[factor.weight]}
                    onValueChange={(value) => {
                      if (factor.id === "preference") setWeightPreference(value[0])
                      else if (
                        factor.id === "location" ||
                        factor.id === "experience" ||
                        factor.id === "conflicts" ||
                        factor.id === "goals" ||
                        factor.id === "personality"
                      )
                        setWeightLocation(value[0])
                      else setWeightAvailability(value[0])
                    }}
                  />
                </div>
              ))}

              <div className={styles.weightTotal}>
                <p className={styles.weightTotalLabel}>Total Weight:</p>
                <p className={styles.weightTotalValue}>{weightPreference + weightLocation + weightAvailability}%</p>
              </div>

              <p className={styles.weightNote}>
                Note: The total weight should equal 100%. Adjust the sliders to balance the importance of each factor.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="options" className={styles.tabContent}>
            <div className={styles.optionsSection}>
              <div className={styles.optionItem}>
                <div className={styles.optionInfo}>
                  <Label htmlFor="consider-past-matches">Consider Past Matches</Label>
                  <p className={styles.optionDescription}>
                    Take into account previous matching history when generating new matches
                  </p>
                </div>
                <Switch
                  id="consider-past-matches"
                  checked={considerPastMatches}
                  onCheckedChange={setConsiderPastMatches}
                />
              </div>

              <div className={styles.optionItem}>
                <div className={styles.optionInfo}>
                  <Label htmlFor="match-entities">Match Entities</Label>
                  <p className={styles.optionDescription}>
                    {`Match ${scenarioParams.entityA} with ${scenarioParams.entityB}`}
                  </p>
                </div>
                <div className={styles.entityPair}>
                  <span className={styles.entityBadge}>{scenarioParams.entityA}</span>
                  <span className={styles.entityArrow}>↔</span>
                  <span className={styles.entityBadge}>{scenarioParams.entityB}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRunMatching} className={styles.runButton}>
          Run Matching
        </Button>
      </CardFooter>
    </Card>
  )
}

