"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Heart, MessageSquare, Info, Star, ChevronLeft, ChevronRight } from "lucide-react"
import styles from "./match-results.module.css"

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

interface MatchResultsProps {
  matches: Match[]
  scenarioType: string
  onAcceptMatch: (matchId: string) => void
  onRejectMatch: (matchId: string) => void
  onFavoriteMatch: (matchId: string) => void
  onMessageMatch: (matchId: string) => void
}

export function MatchResults({
  matches,
  scenarioType,
  onAcceptMatch,
  onRejectMatch,
  onFavoriteMatch,
  onMessageMatch,
}: MatchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const matchesPerPage = 6

  const indexOfLastMatch = currentPage * matchesPerPage
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch)
  const totalPages = Math.ceil(matches.length / matchesPerPage)

  const getScenarioLabels = () => {
    switch (scenarioType) {
      case "ride-sharing":
        return {
          entityA: "Rider",
          entityB: "Driver",
          attributes: {
            location: "Location",
            schedule: "Schedule",
            preference: "Preferences",
          },
        }
      case "paper-review":
        return {
          entityA: "Paper",
          entityB: "Reviewer",
          attributes: {
            expertise: "Expertise",
            availability: "Availability",
            conflicts: "Conflicts",
          },
        }
      case "job-matching":
        return {
          entityA: "Job",
          entityB: "Candidate",
          attributes: {
            skills: "Skills",
            experience: "Experience",
            availability: "Availability",
          },
        }
      case "mentorship":
        return {
          entityA: "Mentor",
          entityB: "Mentee",
          attributes: {
            expertise: "Expertise",
            goals: "Goals",
            availability: "Availability",
          },
        }
      case "team-formation":
        return {
          entityA: "Team",
          entityB: "Member",
          attributes: {
            skills: "Skills",
            personality: "Personality",
            availability: "Availability",
          },
        }
      default:
        return {
          entityA: "Entity A",
          entityB: "Entity B",
          attributes: {
            attribute1: "Attribute 1",
            attribute2: "Attribute 2",
            attribute3: "Attribute 3",
          },
        }
    }
  }

  const scenarioLabels = getScenarioLabels()

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleViewDetails = (match: Match) => {
    setSelectedMatch(match)
  }

  const handleCloseDetails = () => {
    setSelectedMatch(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200">Rejected</Badge>
      case "favorited":
        return <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-200">Favorited</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">Pending</Badge>
    }
  }

  return (
    <div className={styles.resultsContainer}>
      {selectedMatch ? (
        <Card className={styles.detailCard}>
          <CardHeader className={styles.detailHeader}>
            <Button variant="ghost" size="icon" onClick={handleCloseDetails} className={styles.backButton}>
              <ChevronLeft />
              <span className="sr-only">Back to results</span>
            </Button>
            <CardTitle className={styles.detailTitle}>Match Details</CardTitle>
            <div className={styles.detailStatus}>{getStatusBadge(selectedMatch.status)}</div>
          </CardHeader>
          <CardContent>
            <div className={styles.matchPair}>
              <div className={styles.entityDetail}>
                <Avatar className={styles.entityAvatar}>
                  <AvatarImage
                    src={selectedMatch.entityA.avatar || "/placeholder.svg?height=80&width=80"}
                    alt={selectedMatch.entityA.name}
                  />
                  <AvatarFallback>{selectedMatch.entityA.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={styles.entityInfo}>
                  <h3 className={styles.entityName}>{selectedMatch.entityA.name}</h3>
                  <p className={styles.entityType}>{scenarioLabels.entityA}</p>
                </div>
              </div>

              <div className={styles.matchScore}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{selectedMatch.compatibility}%</span>
                </div>
                <div className={styles.scoreLabel}>Match</div>
              </div>

              <div className={styles.entityDetail}>
                <Avatar className={styles.entityAvatar}>
                  <AvatarImage
                    src={selectedMatch.entityB.avatar || "/placeholder.svg?height=80&width=80"}
                    alt={selectedMatch.entityB.name}
                  />
                  <AvatarFallback>{selectedMatch.entityB.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={styles.entityInfo}>
                  <h3 className={styles.entityName}>{selectedMatch.entityB.name}</h3>
                  <p className={styles.entityType}>{scenarioLabels.entityB}</p>
                </div>
              </div>
            </div>

            <div className={styles.matchDetails}>
              <Tabs defaultValue="compatibility" className={styles.detailTabs}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                </TabsList>

                <TabsContent value="compatibility" className={styles.tabContent}>
                  <div className={styles.compatibilityFactors}>
                    <div className={styles.factorItem}>
                      <div className={styles.factorLabel}>{Object.values(scenarioLabels.attributes)[0]}</div>
                      <div className={styles.factorBar}>
                        <div className={styles.factorProgress} style={{ width: `${Math.random() * 40 + 60}%` }} />
                      </div>
                    </div>
                    <div className={styles.factorItem}>
                      <div className={styles.factorLabel}>{Object.values(scenarioLabels.attributes)[1]}</div>
                      <div className={styles.factorBar}>
                        <div className={styles.factorProgress} style={{ width: `${Math.random() * 40 + 60}%` }} />
                      </div>
                    </div>
                    <div className={styles.factorItem}>
                      <div className={styles.factorLabel}>{Object.values(scenarioLabels.attributes)[2]}</div>
                      <div className={styles.factorBar}>
                        <div className={styles.factorProgress} style={{ width: `${Math.random() * 40 + 60}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.matchExplanation}>
                    <div className={styles.explanationHeader}>
                      <Info size={16} className={styles.explanationIcon} />
                      <h4 className={styles.explanationTitle}>Why this match?</h4>
                    </div>
                    <p className={styles.explanationText}>
                      This match was created based on high compatibility in{" "}
                      {Object.values(scenarioLabels.attributes)[0].toLowerCase()}
                      and {Object.values(scenarioLabels.attributes)[1].toLowerCase()}. Both entities have similar
                      preferences and requirements.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="attributes" className={styles.tabContent}>
                  <div className={styles.attributesSection}>
                    <div className={styles.attributeColumn}>
                      <h4 className={styles.attributeHeader}>{scenarioLabels.entityA}</h4>
                      <div className={styles.attributeList}>
                        {Object.entries(selectedMatch.entityA.attributes).map(([key, value]) => (
                          <div key={key} className={styles.attributeItem}>
                            <span className={styles.attributeKey}>{key}:</span>
                            <span className={styles.attributeValue}>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.attributeColumn}>
                      <h4 className={styles.attributeHeader}>{scenarioLabels.entityB}</h4>
                      <div className={styles.attributeList}>
                        {Object.entries(selectedMatch.entityB.attributes).map(([key, value]) => (
                          <div key={key} className={styles.attributeItem}>
                            <span className={styles.attributeKey}>{key}:</span>
                            <span className={styles.attributeValue}>{value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className={styles.detailFooter}>
            {selectedMatch.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className={styles.rejectButton}
                  onClick={() => onRejectMatch(selectedMatch.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  className={styles.acceptButton}
                  onClick={() => onAcceptMatch(selectedMatch.id)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className={styles.favoriteButton}
              onClick={() => onFavoriteMatch(selectedMatch.id)}
            >
              <Heart className="mr-2 h-4 w-4" />
              Favorite
            </Button>
            <Button variant="outline" className={styles.messageButton} onClick={() => onMessageMatch(selectedMatch.id)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Match Results</h2>
            <div className={styles.resultsMeta}>
              <p className={styles.resultsCount}>{matches.length} matches found</p>
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.matchGrid}>
            {currentMatches.map((match) => (
              <Card key={match.id} className={`${styles.matchCard} match-card`}>
                <CardHeader className={styles.matchHeader}>
                  <div className={styles.matchStatus}>{getStatusBadge(match.status)}</div>
                  <div className={styles.matchScore}>
                    <Star className={styles.scoreIcon} />
                    <span className={styles.scoreValue}>{match.compatibility}%</span>
                  </div>
                </CardHeader>
                <CardContent className={styles.matchContent}>
                  <div className={styles.matchPair}>
                    <div className={styles.matchEntity}>
                      <Avatar className={styles.entityAvatar}>
                        <AvatarImage
                          src={match.entityA.avatar || "/placeholder.svg?height=60&width=60"}
                          alt={match.entityA.name}
                        />
                        <AvatarFallback>{match.entityA.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={styles.entityInfo}>
                        <h3 className={styles.entityName}>{match.entityA.name}</h3>
                        <p className={styles.entityType}>{scenarioLabels.entityA}</p>
                      </div>
                    </div>

                    <div className={styles.matchConnector}>
                      <div className={styles.connectorLine} />
                    </div>

                    <div className={styles.matchEntity}>
                      <Avatar className={styles.entityAvatar}>
                        <AvatarImage
                          src={match.entityB.avatar || "/placeholder.svg?height=60&width=60"}
                          alt={match.entityB.name}
                        />
                        <AvatarFallback>{match.entityB.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={styles.entityInfo}>
                        <h3 className={styles.entityName}>{match.entityB.name}</h3>
                        <p className={styles.entityType}>{scenarioLabels.entityB}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.matchDate}>
                    <p className={styles.dateLabel}>Matched on {match.matchDate}</p>
                  </div>
                </CardContent>
                <CardFooter className={styles.matchFooter}>
                  <Button variant="default" className={styles.detailsButton} onClick={() => handleViewDetails(match)}>
                    View Details
                  </Button>

                  <div className={styles.quickActions}>
                    {match.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className={styles.rejectButton}
                          onClick={() => onRejectMatch(match.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={styles.acceptButton}
                          onClick={() => onAcceptMatch(match.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Accept</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className={styles.favoriteButton}
                      onClick={() => onFavoriteMatch(match.id)}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Favorite</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

