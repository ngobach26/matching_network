"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from "@mui/material"
import { useAuth } from "@/contexts/AuthContext"
import DriverForm from "@/components/onboarding/DriverForm"
import RiderForm from "@/components/onboarding/RiderForm"
import ReviewerForm from "@/components/onboarding/ReviewerForm"
import CandidateForm from "@/components/onboarding/CandidateForm"
import MentorForm from "@/components/onboarding/MentorForm"
import MenteeForm from "@/components/onboarding/MenteeForm"
import styles from "./onboarding.module.css"

export default function OnboardingPage() {
  const params = useParams<{ role: string }>()
  const role = params.role
  const { user, setRoleProfileCompleted, isLoading } = useAuth()
  const router = useRouter()

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!role || !user) return

    // Check if user has this role
    if (!user.roles.includes(role)) {
      router.push("/role-selection")
      return
    }

    // Check if profile is already completed
    if (user.profileCompleted[role]) {
      router.push("/dashboard")
      return
    }
  }, [role, user, router])

  const getSteps = () => {
    switch (role) {
      case "rider":
        return ["Basic Information", "Location Preferences", "Contact Details"]
      case "driver":
        return ["Basic Information", "Vehicle Details", "Availability"]
      case "reviewer":
        return ["Basic Information", "Expertise", "Preferences"]
      case "candidate":
        return ["Basic Information", "Skills & Experience", "Job Preferences"]
      case "mentor":
        return ["Basic Information", "Expertise", "Availability"]
      case "mentee":
        return ["Basic Information", "Goals", "Preferences"]
      default:
        return ["Step 1", "Step 2", "Step 3"]
    }
  }

  const steps = getSteps()

  const handleNext = (stepData: any) => {
    setFormData({ ...formData, ...stepData })

    if (activeStep === steps.length - 1) {
      handleSubmit({ ...formData, ...stepData })
    } else {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async (finalData: any) => {
    if (!role) return

    setIsSubmitting(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark role profile as completed
      setRoleProfileCompleted(role, true)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting profile:", error)
      setError("Failed to set up profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    if (!role) return null

    const props = {
      formData,
      onSubmit: handleNext,
      onBack: activeStep > 0 ? handleBack : undefined,
      step: activeStep,
    }

    switch (role) {
      case "rider":
        return <RiderForm {...props} />
      case "driver":
        return <DriverForm {...props} />
      case "reviewer":
        return <ReviewerForm {...props} />
      case "candidate":
        return <CandidateForm {...props} />
      case "mentor":
        return <MentorForm {...props} />
      case "mentee":
        return <MenteeForm {...props} />
      default:
        return <Typography>Unknown role: {role}</Typography>
    }
  }

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container component="main" maxWidth="md">
      <Box className={styles.container}>
        <Paper elevation={3} className={styles.paper}>
          <Typography component="h1" variant="h4" className={styles.title}>
            Set Up Your {role && role.charAt(0).toUpperCase() + role.slice(1)} Profile
          </Typography>
          <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
            Complete the following steps to set up your profile.
          </Typography>

          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} className={styles.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className={styles.formContainer}>{renderStepContent()}</Box>

          <Box className={styles.skipContainer}>
            <Button variant="text" color="primary" onClick={() => router.push("/dashboard")} disabled={isSubmitting}>
              Skip for now
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

