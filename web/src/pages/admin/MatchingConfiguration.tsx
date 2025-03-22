"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material"
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material"
import { useSnackbar } from "../../contexts/SnackbarContext"
import styles from "./MatchingConfiguration.module.css"

interface MatchingAlgorithm {
  id: string
  name: string
  description: string
}

interface MatchingAttribute {
  id: string
  name: string
  weight: number
  enabled: boolean
}

interface MatchingScenario {
  id: string
  name: string
  description: string
  algorithm: string
  attributes: MatchingAttribute[]
  settings: {
    oneToMany: boolean
    maxMatches: number
    minScore: number
  }
}

const MatchingConfiguration: React.FC = () => {
  const { showSnackbar } = useSnackbar()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [scenarios, setScenarios] = useState<MatchingScenario[]>([])
  const [algorithms, setAlgorithms] = useState<MatchingAlgorithm[]>([])
  const [currentConfig, setCurrentConfig] = useState<MatchingScenario | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        // In a real app, you would fetch this data from your API
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock algorithms
        const mockAlgorithms: MatchingAlgorithm[] = [
          {
            id: "gale-shapley",
            name: "Gale-Shapley",
            description: "Stable matching algorithm that guarantees stable pairs",
          },
          {
            id: "hungarian",
            name: "Hungarian Algorithm",
            description: "Optimal assignment algorithm that minimizes total cost",
          },
          {
            id: "greedy",
            name: "Greedy Matching",
            description: "Simple algorithm that matches based on highest scores first",
          },
        ]

        // Mock scenarios
        const mockScenarios: MatchingScenario[] = [
          {
            id: "ride-sharing",
            name: "Ride Sharing",
            description: "Match riders with drivers",
            algorithm: "hungarian",
            attributes: [
              { id: "location", name: "Location Proximity", weight: 40, enabled: true },
              { id: "schedule", name: "Schedule Compatibility", weight: 30, enabled: true },
              { id: "rating", name: "User Rating", weight: 20, enabled: true },
              { id: "preference", name: "User Preferences", weight: 10, enabled: true },
            ],
            settings: {
              oneToMany: true,
              maxMatches: 3,
              minScore: 60,
            },
          },
          {
            id: "paper-review",
            name: "Paper Review",
            description: "Match papers with reviewers",
            algorithm: "gale-shapley",
            attributes: [
              { id: "expertise", name: "Expertise Match", weight: 50, enabled: true },
              { id: "workload", name: "Reviewer Workload", weight: 20, enabled: true },
              { id: "conflicts", name: "Conflict of Interest", weight: 30, enabled: true },
            ],
            settings: {
              oneToMany: true,
              maxMatches: 5,
              minScore: 70,
            },
          },
          {
            id: "job-matching",
            name: "Job Matching",
            description: "Match job seekers with job postings",
            algorithm: "hungarian",
            attributes: [
              { id: "skills", name: "Skills Match", weight: 40, enabled: true },
              { id: "experience", name: "Experience Level", weight: 30, enabled: true },
              { id: "location", name: "Location", weight: 20, enabled: true },
              { id: "salary", name: "Salary Expectations", weight: 10, enabled: true },
            ],
            settings: {
              oneToMany: false,
              maxMatches: 1,
              minScore: 75,
            },
          },
          {
            id: "mentorship",
            name: "Mentorship",
            description: "Match mentors with mentees",
            algorithm: "gale-shapley",
            attributes: [
              { id: "expertise", name: "Expertise Areas", weight: 35, enabled: true },
              { id: "goals", name: "Goals Alignment", weight: 35, enabled: true },
              { id: "availability", name: "Availability", weight: 20, enabled: true },
              { id: "communication", name: "Communication Style", weight: 10, enabled: true },
            ],
            settings: {
              oneToMany: true,
              maxMatches: 3,
              minScore: 65,
            },
          },
          {
            id: "team-formation",
            name: "Team Formation",
            description: "Form balanced teams for projects",
            algorithm: "greedy",
            attributes: [
              { id: "skills", name: "Skill Diversity", weight: 40, enabled: true },
              { id: "personality", name: "Personality Compatibility", weight: 30, enabled: true },
              { id: "experience", name: "Experience Level", weight: 20, enabled: true },
              { id: "availability", name: "Availability", weight: 10, enabled: true },
            ],
            settings: {
              oneToMany: true,
              maxMatches: 5,
              minScore: 60,
            },
          },
        ]

        setAlgorithms(mockAlgorithms)
        setScenarios(mockScenarios)
        setSelectedScenario(mockScenarios[0].id)
        setCurrentConfig(mockScenarios[0])
      } catch (error) {
        console.error("Error fetching matching configuration:", error)
        showSnackbar("Failed to load matching configuration", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [showSnackbar])

  const handleScenarioChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const scenarioId = event.target.value as string
    setSelectedScenario(scenarioId)

    const selectedConfig = scenarios.find((s) => s.id === scenarioId) || null
    setCurrentConfig(selectedConfig)
  }

  const handleAlgorithmChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const algorithmId = event.target.value as string

    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        algorithm: algorithmId,
      })
    }
  }

  const handleAttributeWeightChange = (attributeId: string, newValue: number) => {
    if (!currentConfig) return

    const updatedAttributes = currentConfig.attributes.map((attr) =>
      attr.id === attributeId ? { ...attr, weight: newValue } : attr,
    )

    setCurrentConfig({
      ...currentConfig,
      attributes: updatedAttributes,
    })
  }

  const handleAttributeToggle = (attributeId: string, enabled: boolean) => {
    if (!currentConfig) return

    const updatedAttributes = currentConfig.attributes.map((attr) =>
      attr.id === attributeId ? { ...attr, enabled } : attr,
    )

    setCurrentConfig({
      ...currentConfig,
      attributes: updatedAttributes,
    })
  }

  const handleSettingChange = (setting: keyof MatchingScenario["settings"], value: any) => {
    if (!currentConfig) return

    setCurrentConfig({
      ...currentConfig,
      settings: {
        ...currentConfig.settings,
        [setting]: value,
      },
    })
  }

  const validateWeights = () => {
    if (!currentConfig) return true

    const enabledAttributes = currentConfig.attributes.filter((attr) => attr.enabled)
    const totalWeight = enabledAttributes.reduce((sum, attr) => sum + attr.weight, 0)

    return Math.abs(totalWeight - 100) < 0.01 // Allow for floating point imprecision
  }

  const handleSave = async () => {
    if (!currentConfig) return

    if (!validateWeights()) {
      showSnackbar("Attribute weights must sum to 100%", "error")
      return
    }

    setIsSaving(true)

    try {
      // In a real app, you would send this data to your API
      console.log("Saving configuration:", currentConfig)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update scenarios list
      setScenarios((prev) => prev.map((scenario) => (scenario.id === currentConfig.id ? currentConfig : scenario)))

      showSnackbar("Configuration saved successfully", "success")
    } catch (error) {
      console.error("Error saving configuration:", error)
      showSnackbar("Failed to save configuration", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const originalConfig = scenarios.find((s) => s.id === selectedScenario) || null
    setCurrentConfig(originalConfig)
    showSnackbar("Configuration reset to original values", "info")
  }

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary" className={styles.loadingText}>
          Loading matching configuration...
        </Typography>
      </Box>
    )
  }

  return (
    <Box className={styles.container}>
      <Typography variant="h5" component="h1" className={styles.title}>
        Matching Configuration
      </Typography>
      <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
        Configure matching algorithms and parameters for different scenarios
      </Typography>

      <Card className={styles.configCard}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="scenario-select-label">Matching Scenario</InputLabel>
                <Select
                  labelId="scenario-select-label"
                  id="scenario-select"
                  value={selectedScenario}
                  onChange={handleScenarioChange}
                  label="Matching Scenario"
                >
                  {scenarios.map((scenario) => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {currentConfig && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="algorithm-select-label">Matching Algorithm</InputLabel>
                  <Select
                    labelId="algorithm-select-label"
                    id="algorithm-select"
                    value={currentConfig.algorithm}
                    onChange={handleAlgorithmChange}
                    label="Matching Algorithm"
                  >
                    {algorithms.map((algorithm) => (
                      <MenuItem key={algorithm.id} value={algorithm.id}>
                        {algorithm.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="textSecondary" className={styles.algorithmDescription}>
                  {algorithms.find((a) => a.id === currentConfig.algorithm)?.description}
                </Typography>
              </Grid>
            )}
          </Grid>

          {currentConfig && (
            <>
              <Divider className={styles.divider} />

              <Typography variant="h6" className={styles.sectionTitle}>
                Attribute Weights
              </Typography>
              <Typography variant="body2" color="textSecondary" className={styles.sectionDescription}>
                Adjust the importance of each attribute in the matching process
              </Typography>

              {!validateWeights() && (
                <Alert severity="warning" className={styles.weightAlert}>
                  Attribute weights must sum to 100%. Current total:{" "}
                  {currentConfig.attributes.filter((attr) => attr.enabled).reduce((sum, attr) => sum + attr.weight, 0)}%
                </Alert>
              )}

              <Grid container spacing={3} className={styles.attributesContainer}>
                {currentConfig.attributes.map((attribute) => (
                  <Grid item xs={12} key={attribute.id}>
                    <Paper className={styles.attributePaper}>
                      <Box className={styles.attributeHeader}>
                        <Typography variant="subtitle1" className={styles.attributeName}>
                          {attribute.name}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={attribute.enabled}
                              onChange={(e) => handleAttributeToggle(attribute.id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Enabled"
                        />
                      </Box>

                      <Box className={styles.attributeSlider}>
                        <Slider
                          value={attribute.weight}
                          onChange={(_, newValue) => handleAttributeWeightChange(attribute.id, newValue as number)}
                          disabled={!attribute.enabled}
                          aria-labelledby={`${attribute.id}-weight-slider`}
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Weight: {attribute.weight}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Divider className={styles.divider} />

              <Typography variant="h6" className={styles.sectionTitle}>
                Additional Settings
              </Typography>

              <Grid container spacing={3} className={styles.settingsContainer}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentConfig.settings.oneToMany}
                        onChange={(e) => handleSettingChange("oneToMany", e.target.checked)}
                        color="primary"
                      />
                    }
                    label="One-to-Many Matching"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Maximum Matches"
                    type="number"
                    value={currentConfig.settings.maxMatches}
                    onChange={(e) => handleSettingChange("maxMatches", Number.parseInt(e.target.value))}
                    disabled={!currentConfig.settings.oneToMany}
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Minimum Score (%)"
                    type="number"
                    value={currentConfig.settings.minScore}
                    onChange={(e) => handleSettingChange("minScore", Number.parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box className={styles.actions}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} disabled={isSaving}>
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving || !validateWeights()}
                >
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default MatchingConfiguration

