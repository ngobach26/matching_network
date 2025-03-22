"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material"
import styles from "./OnboardingForms.module.css"

interface RiderFormProps {
  formData: any
  onSubmit: (data: any) => void
  onBack?: () => void
  step: number
}

const RiderForm: React.FC<RiderFormProps> = ({ formData, onSubmit, onBack, step }) => {
  const [errors, setErrors] = useState<any>({})
  const [locations, setLocations] = useState<string[]>(formData.savedLocations || [])
  const [newLocation, setNewLocation] = useState("")

  const validateStep0 = (data: any) => {
    const newErrors: any = {}

    if (!data.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!data.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }

    return newErrors
  }

  const validateStep1 = (data: any) => {
    const newErrors: any = {}

    if (locations.length === 0) {
      newErrors.savedLocations = "At least one location is required"
    }

    return newErrors
  }

  const validateStep2 = (data: any) => {
    const newErrors: any = {}

    if (!data.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\+?[0-9]{10,15}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format"
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formElements = e.target as HTMLFormElement
    const formData = new FormData(formElements)
    const data: any = {}

    formData.forEach((value, key) => {
      data[key] = value
    })

    // Add locations
    if (step === 1) {
      data.savedLocations = locations
    }

    // Validate based on current step
    let validationErrors = {}
    switch (step) {
      case 0:
        validationErrors = validateStep0(data)
        break
      case 1:
        validationErrors = validateStep1(data)
        break
      case 2:
        validationErrors = validateStep2(data)
        break
    }

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(data)
    }
  }

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()])
      setNewLocation("")
    }
  }

  const handleDeleteLocation = (locationToDelete: string) => {
    setLocations(locations.filter((location) => location !== locationToDelete))
  }

  const renderStep0 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          defaultValue={formData.firstName || ""}
          error={!!errors.firstName}
          helperText={errors.firstName}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          defaultValue={formData.lastName || ""}
          error={!!errors.lastName}
          helperText={errors.lastName}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          defaultValue={formData.email || ""}
          error={!!errors.email}
          helperText={errors.email}
        />
      </Grid>
    </Grid>
  )

  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Saved Locations
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Add frequently visited locations for quicker ride requests
        </Typography>

        <Box className={styles.locationInput}>
          <TextField
            fullWidth
            label="Add Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            error={!!errors.savedLocations}
            helperText={errors.savedLocations}
          />
          <Button variant="contained" color="primary" onClick={handleAddLocation} disabled={!newLocation.trim()}>
            Add
          </Button>
        </Box>

        <Box className={styles.locationChips}>
          {locations.map((location, index) => (
            <Chip
              key={index}
              label={location}
              onDelete={() => handleDeleteLocation(location)}
              color="primary"
              variant="outlined"
              className={styles.locationChip}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="preferred-vehicle-label">Preferred Vehicle Type</InputLabel>
          <Select
            labelId="preferred-vehicle-label"
            name="preferredVehicleType"
            defaultValue={formData.preferredVehicleType || ""}
            label="Preferred Vehicle Type"
          >
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="sedan">Sedan</MenuItem>
            <MenuItem value="suv">SUV</MenuItem>
            <MenuItem value="van">Van</MenuItem>
            <MenuItem value="luxury">Luxury</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )

  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phoneNumber"
          defaultValue={formData.phoneNumber || ""}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || "We will use this to contact you about rides"}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          name="emergencyContactName"
          defaultValue={formData.emergencyContactName || ""}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          name="emergencyContactPhone"
          defaultValue={formData.emergencyContactPhone || ""}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="communication-preference-label">Communication Preference</InputLabel>
          <Select
            labelId="communication-preference-label"
            name="communicationPreference"
            defaultValue={formData.communicationPreference || "sms"}
            label="Communication Preference"
          >
            <MenuItem value="sms">SMS</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="app">In-App Notifications</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return renderStep0()
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      default:
        return null
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className={styles.form}>
      {renderStepContent()}

      <Box className={styles.buttons}>
        {onBack && (
          <Button type="button" variant="outlined" onClick={onBack} className={styles.backButton}>
            Back
          </Button>
        )}
        <Button type="submit" variant="contained" color="primary" className={styles.nextButton}>
          {step === 2 ? "Submit" : "Next"}
        </Button>
      </Box>
    </Box>
  )
}

export default RiderForm

