"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Box, Typography, Button, Paper, Stepper, Step, StepLabel, CircularProgress } from "@mui/material"
import { useAuth } from "../../contexts/AuthContext"
import { useSnackbar } from "../../contexts/SnackbarContext"
import RiderForm from "../../components/onboarding/RiderForm"
import DriverForm from "../../components/onboarding/DriverForm"
import ReviewerForm from "../../components/onboarding/ReviewerForm"
import CandidateForm from "../../components/onboarding/CandidateForm"
import MentorForm from "../../components/onboarding/MentorForm"
import MenteeForm from "../../components/onboarding/MenteeForm"
import styles from "./RoleOnboarding.module.css"

const RoleOnboarding: React.FC = () => {
  const { role } = useParams<{ role: string }>()
  const { user, setRoleProfileCompleted, isLoading } = useAuth()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!role || !user) return

    // Check if user has this role
    if (!user.roles.includes(role)) {
      showSnackbar(`You don't have the ${role} role. Please select it first.`, "error")
      navigate("/role-selection")
    }

    // Check if profile is already completed
    if (user.profileCompleted[role]) {
      showSnackbar(`Your ${role} profile is already set up.`, "info")
      navigate(`/${role}`)
    }
  }, [role, user, navigate, showSnackbar])

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

    try {
      // In a real app, you would send this data to your API
      console.log("Submitting data for role:", role, finalData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark role profile as completed
      setRoleProfileCompleted(role, true)

      showSnackbar(`Your ${role} profile has been set up successfully!`, "success")
      navigate(`/${role}`)
    } catch (error) {
      console.error("Error submitting profile:", error)
      showSnackbar("Failed to set up profile. Please try again.", "error")
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

          <Stepper activeStep={activeStep} className={styles.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className={styles.formContainer}>{renderStepContent()}</Box>

          <Box className={styles.skipContainer}>
            <Button variant="text" color="primary" onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
              Skip for now
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RoleOnboarding

