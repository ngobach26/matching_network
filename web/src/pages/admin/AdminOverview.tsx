"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  PeopleAlt as UsersIcon,
  DirectionsCar as RideIcon,
  MenuBook as PaperIcon,
  Work as JobIcon,
  School as MentorshipIcon,
} from "@mui/icons-material"
import { useSnackbar } from "../../contexts/SnackbarContext"

interface StatCard {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
}

const AdminOverview: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [usersByRole, setUsersByRole] = useState<ChartData | null>(null);
  const [matchesByScenario, setMatchesByScenario] = useState<ChartData | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch this data from your API
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock stats
        setStats([
          {
            title: 'Total Users',
            value: 1248,
            icon: <UsersIcon />,
            color: '#2196f3',
          },
          {
            title: 'Active Rides',
            value: 87,
            icon: <RideIcon />,
            color: '#4caf50',
          },
          {
            title: 'Paper Reviews',
            value: 156,
            icon: <PaperIcon />,
            color: '#9c27b0',
          },
          {
            title: 'Job Matches',
            value: 324,
            icon: <JobIcon />,
            color: '#ff9800',
          },
          {
            title: 'Mentorships',
            value: 92,
            icon: <MentorshipIcon />,
            color: '#f44336',
          },
          {\
            title: 'Teams Formed

