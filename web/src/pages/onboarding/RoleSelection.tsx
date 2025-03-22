"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  CircularProgress,
} from "@mui/material"
import {
  DirectionsCar as DriverIcon,
  EmojiPeople as RiderIcon,
  MenuBook as ReviewerIcon,
  Work as CandidateIcon,
  School as MentorIcon,
  Person as MenteeIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useSnackbar } from "../../contexts/SnackbarContext"
import styles from "./RoleSelection.module.css"

interface RoleOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const RoleSelection: React.FC = () => {
  const { user, addRole, isLoading } = useAuth()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const roleOptions: RoleOption[] = [
    {
      id: "rider",
      title: "Rider",
      description: "Request rides to your destinations",
      icon: <RiderIcon fontSize="large" />,
    },
    {
      id: "driver",
      title: "Driver",
      description: "Provide rides to others",
      icon: <DriverIcon fontSize="large" />,
    },
    {
      id: "reviewer",
      title: "Reviewer",
      description: "Review academic papers",
      icon: <ReviewerIcon fontSize="large" />,
    },
    {
      id: "candidate",
      title: "Candidate",
      description: "Apply for job positions",
      icon: <CandidateIcon fontSize="large" />,
    },
    {
      id: "mentor",
      title: "Mentor",
      description: "Guide others in their journey",
      icon: <MentorIcon fontSize="large" />,
    },
    {
      id: "mentee",
      title: "Mentee",
      description: "Receive guidance from mentors",
      icon: <MenteeIcon fontSize="large" />,
    },
  ]

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      showSnackbar("Please select at least one role", "warning")
      return
    }

    try {
      // Add each selected role
      for (const roleId of selectedRoles) {
        await addRole(roleId)
      }

      // Navigate to the first role's onboarding
      navigate(`/onboarding/${selectedRoles[0]}`)
    } catch (error) {
      console.error("Error adding roles:", error)
      showSnackbar("Failed to add roles. Please try again.", "error")
    }
  }

  return (
    <Container component="main" maxWidth="md">
      <Box className={styles.container}>
        <Paper elevation={3} className={styles.paper}>
          <Typography component="h1" variant="h4" className={styles.title}>
            Select Your Roles
          </Typography>
          <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
            Choose one or more roles that you want to participate in. You can always change these later.
          </Typography>

          <Grid container spacing={3} className={styles.rolesGrid}>
            {roleOptions.map((role) => {
              const isSelected = selectedRoles.includes(role.id)
              const isUserRole = user?.roles.includes(role.id)

              return (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                  <Card
                    className={`${styles.roleCard} ${isSelected ? styles.selectedCard : ""} ${isUserRole ? styles.userRoleCard : ""}`}
                    onClick={() => !isUserRole && handleRoleToggle(role.id)}
                  >
                    <CardContent className={styles.roleCardContent}>
                      <Box className={styles.roleIconContainer}>{role.icon}</Box>
                      <Typography variant="h6" component="h2" className={styles.roleTitle}>
                        {role.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" className={styles.roleDescription}>
                        {role.description}
                      </Typography>
                    </CardContent>
                    <CardActions className={styles.roleCardActions}>
                      <Checkbox
                        checked={isSelected || isUserRole}
                        disabled={isUserRole}
                        color="primary"
                        onChange={() => handleRoleToggle(role.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {isUserRole && (
                        <Typography variant="caption" color="primary">
                          Already selected
                        </Typography>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          <Box className={styles.actions}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContinue}
              disabled={isLoading || selectedRoles.length === 0}
              className={styles.continueButton}
            >
              {isLoading ? <CircularProgress size={24} /> : "Continue"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RoleSelection

