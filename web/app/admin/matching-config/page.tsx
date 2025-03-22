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
import AdminLayout from "@/components/admin/AdminLayout"
import { mockMatchingConfigs, mockAlgorithms } from "@/mocks/admin"
import styles from "./matching-config.module.css"

export default function MatchingConfigPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [scenarios, setScenarios] = useState<any[]>([])
  const [algorithms, setAlgorithms] = useState<any[]>([])
  const [currentConfig, setCurrentConfig] = useState<any | null>(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setAlgorithms(mockAlgorithms)
        setScenarios(mockMatchingConfigs)
        setSelectedScenario(mockMatchingConfigs[0].id)
        setCurrentConfig(mockMatchingConfigs[0])
      } catch (error) {
        console.error("Error fetching matching configuration:", error)
        setError("Failed to load matching configuration")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

    const updatedAttributes = currentConfig.attributes.map((attr: any) =>
      attr.id === attributeId ? { ...attr, weight: newValue } : attr,
    )

    setCurrentConfig({
      ...currentConfig,
      attributes: updatedAttributes,
    })
  }

  const handleAttributeToggle = (attributeId: string, enabled: boolean) => {
    if (!currentConfig) return

    const updatedAttributes = currentConfig.attributes.map((attr: any) =>
      attr.id === attributeId ? { ...attr, enabled } : attr,
    )

    setCurrentConfig({
      ...currentConfig,
      attributes: updatedAttributes,
    })
  }

  const handleSettingChange = (setting: keyof any, value: any) => {
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

    const enabledAttributes = currentConfig.attributes.filter((attr: any) => attr.enabled)
    const totalWeight = enabledAttributes.reduce((sum: number, attr: any) => sum + attr.weight, 0)

    return Math.abs(totalWeight - 100) < 0.01 // Allow for floating point imprecision
  }

  const handleSave = async () => {
    if (!currentConfig) return

    if (!validateWeights()) {
      setError("Attribute weights must sum to 100%")
      setSuccessMessage("")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update scenarios list
      setScenarios((prev) => prev.map((scenario) => (scenario.id === currentConfig.id ? currentConfig : scenario)))

      setSuccessMessage("Configuration saved successfully")
    } catch (error) {
      console.error("Error saving configuration:", error)
      setError("Failed to save configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const originalConfig = scenarios.find((s) => s.id === selectedScenario) || null
    setCurrentConfig(originalConfig)
    setError("")
    setSuccessMessage("Configuration reset to original values")
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" color="textSecondary" className={styles.loadingText}>
            Loading matching configuration...
          </Typography>
        </Box>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box className={styles.container}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Matching Configuration
        </Typography>
        <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
          Configure matching algorithms and parameters for different scenarios
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" className={styles.alert}>
            {successMessage}
          </Alert>
        )}

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
                    {currentConfig.attributes
                      .filter((attr: any) => attr.enabled)
                      .reduce((sum: number, attr: any) => sum + attr.weight, 0)}
                    %
                  </Alert>
                )}

                <Grid container spacing={3} className={styles.attributesContainer}>
                  {currentConfig.attributes.map((attribute: any) => (
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
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Minimum Score (%)"
                      type="number"
                      value={currentConfig.settings.minScore}
                      onChange={(e) => handleSettingChange("minScore", Number.parseInt(e.target.value))}
                      inputProps={{ min: 0, max: 100 }}
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
    </AdminLayout>
  )
}

