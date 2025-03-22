"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import styles from "./OnboardingForms.module.css"

interface DriverFormProps {
  formData: any
  onSubmit: (data: any) => void
  onBack?: () => void
  step: number
}

const DriverForm: React.FC<DriverFormProps> = ({ formData, onSubmit, onBack, step }) => {
  const [errors, setErrors] = useState<any>({})

  const validateStep0 = (data: any) => {
    const newErrors: any = {}

    if (!data.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!data.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!data.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\+?[0-9]{10,15}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format"
    }

    return newErrors
  }

  const validateStep1 = (data: any) => {
    const newErrors: any = {}

    if (!data.vehicleMake?.trim()) {
      newErrors.vehicleMake = "Vehicle make is required"
    }

    if (!data.vehicleModel?.trim()) {
      newErrors.vehicleModel = "Vehicle model is required"
    }

    if (!data.vehicleYear) {
      newErrors.vehicleYear = "Vehicle year is required"
    } else if (data.vehicleYear < 1990 || data.vehicleYear > new Date().getFullYear()) {
      newErrors.vehicleYear = "Invalid vehicle year"
    }

    if (!data.licensePlate?.trim()) {
      newErrors.licensePlate = "License plate is required"
    }

    return newErrors
  }

  const validateStep2 = (data: any) => {
    const newErrors: any = {}

    if (!data.drivingZone?.trim()) {
      newErrors.drivingZone = "Driving zone is required"
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

    // Add checkbox values
    if (step === 2) {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      days.forEach((day) => {
        data[`available${day.charAt(0).toUpperCase() + day.slice(1)}`] =
          formElements.querySelector<HTMLInputElement>(`#available${day.charAt(0).toUpperCase() + day.slice(1)}`)
            ?.checked || false
      })
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
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Vehicle Make"
          name="vehicleMake"
          defaultValue={formData.vehicleMake || ""}
          error={!!errors.vehicleMake}
          helperText={errors.vehicleMake}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Vehicle Model"
          name="vehicleModel"
          defaultValue={formData.vehicleModel || ""}
          error={!!errors.vehicleModel}
          helperText={errors.vehicleModel}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Vehicle Year"
          name="vehicleYear"
          type="number"
          defaultValue={formData.vehicleYear || ""}
          error={!!errors.vehicleYear}
          helperText={errors.vehicleYear}
          required
          InputProps={{ inputProps: { min: 1990, max: new Date().getFullYear() } }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="License Plate"
          name="licensePlate"
          defaultValue={formData.licensePlate || ""}
          error={!!errors.licensePlate}
          helperText={errors.licensePlate}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.vehicleType}>
          <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
          <Select
            labelId="vehicle-type-label"
            name="vehicleType"
            defaultValue={formData.vehicleType || ""}
            label="Vehicle Type"
          >
            <MenuItem value="sedan">Sedan</MenuItem>
            <MenuItem value="suv">SUV</MenuItem>
            <MenuItem value="van">Van</MenuItem>
            <MenuItem value="truck">Truck</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.vehicleType && <FormHelperText>{errors.vehicleType}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Vehicle Color"
          name="vehicleColor"
          defaultValue={formData.vehicleColor || ""}
          error={!!errors.vehicleColor}
          helperText={errors.vehicleColor}
        />
      </Grid>
    </Grid>
  )

  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Driving Zone/Region"
          name="drivingZone"
          defaultValue={formData.drivingZone || ""}
          error={!!errors.drivingZone}
          helperText={errors.drivingZone || "Enter the area where you prefer to drive"}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Availability
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Select the days you are available to drive
        </Typography>

        <Grid container spacing={1}>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <Grid item xs={12} sm={6} key={day}>
              <FormControlLabel
                control={<Checkbox id={`available${day}`} defaultChecked={formData[`available${day}`] || false} />}
                label={day}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Preferred Hours
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Start Time"
                value={formData.startTime || null}
                onChange={() => {}}
                slotProps={{ textField: { fullWidth: true, name: "startTime" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="End Time"
                value={formData.endTime || null}
                onChange={() => {}}
                slotProps={{ textField: { fullWidth: true, name: "endTime" } }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          name="notes"
          multiline
          rows={3}
          defaultValue={formData.notes || ""}
          placeholder="Any additional information about your availability or preferences"
        />
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

export default DriverForm

