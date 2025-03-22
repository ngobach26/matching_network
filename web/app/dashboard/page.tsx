"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, BookOpen, Briefcase, UserPlus, Users, ArrowRight } from "lucide-react"
import styles from "./page.module.css"

interface MatchingScenario {
  id: string
  name: string
  description: string
  icon: React.ElementType
  activeMatches: number
  color: string
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [scenarios, setScenarios] = useState<MatchingScenario[]>([])

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserEmail(user.email)
    }

    // Mock scenarios data
    setScenarios([
      {
        id: "ride-sharing",
        name: "Ride Sharing",
        description: "Match riders with drivers based on location, schedule, and preferences",
        icon: Car,
        activeMatches: 24,
        color: "bg-blue-100 text-blue-600",
      },
      {
        id: "paper-review",
        name: "Paper Review",
        description: "Assign reviewers to papers based on expertise and availability",
        icon: BookOpen,
        activeMatches: 15,
        color: "bg-purple-100 text-purple-600",
      },
      {
        id: "job-matching",
        name: "Job Matching",
        description: "Connect job seekers with employers based on skills and requirements",
        icon: Briefcase,
        activeMatches: 32,
        color: "bg-green-100 text-green-600",
      },
      {
        id: "mentorship",
        name: "Mentorship",
        description: "Pair mentors with mentees based on goals, experience, and interests",
        icon: UserPlus,
        activeMatches: 18,
        color: "bg-amber-100 text-amber-600",
      },
      {
        id: "team-formation",
        name: "Team Formation",
        description: "Create balanced teams for projects based on skills and compatibility",
        icon: Users,
        activeMatches: 10,
        color: "bg-rose-100 text-rose-600",
      },
    ])
  }, [])

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome to MatchApp</h1>
        <p className={styles.welcomeSubtitle}>Select a matching scenario to get started</p>
      </div>

      <div className={styles.scenariosGrid}>
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className={`${styles.scenarioCard} card-hover`}>
            <CardHeader className={styles.scenarioHeader}>
              <div className={`${styles.scenarioIcon} ${scenario.color}`}>
                <scenario.icon size={24} />
              </div>
              <div>
                <CardTitle className={styles.scenarioTitle}>{scenario.name}</CardTitle>
                <CardDescription className={styles.scenarioDescription}>{scenario.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.scenarioStats}>
                <Badge variant="secondary" className={styles.scenarioBadge}>
                  {scenario.activeMatches} active matches
                </Badge>
              </div>
              <Button asChild className={styles.scenarioButton}>
                <Link href={`/dashboard/scenarios/${scenario.id}`}>
                  Go to {scenario.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <Card className={styles.recentCard}>
          <CardContent className="p-6">
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={`${styles.activityIcon} bg-blue-100 text-blue-600`}>
                  <Car size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>New ride match available</p>
                  <p className={styles.activityTime}>2 minutes ago</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityIcon} bg-green-100 text-green-600`}>
                  <Briefcase size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>Job application matched</p>
                  <p className={styles.activityTime}>1 hour ago</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityIcon} bg-purple-100 text-purple-600`}>
                  <BookOpen size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>Paper review assigned</p>
                  <p className={styles.activityTime}>3 hours ago</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityIcon} bg-amber-100 text-amber-600`}>
                  <UserPlus size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>Mentorship match accepted</p>
                  <p className={styles.activityTime}>Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

