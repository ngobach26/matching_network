"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Paper,
} from "@mui/material"
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Description as FileIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material"
import { useRoleContext, type RoleType } from "@/context/role-context"
import { RiderForm } from "@/components/role-forms/rider-form"
import { DriverForm } from "@/components/role-forms/driver-form"
import { ReviewerForm } from "@/components/role-forms/reviewer-form"
import { CandidateForm } from "@/components/role-forms/candidate-form"
import TopBar from "@/components/TopBar"
import { useTheme } from "@/components/ThemeProvider"
import styles from "./Profile.module.css"
// Import the MobileNav component
import { MobileNav } from "@/components/MobileNav"

export default function ProfilePage() {
  const { roles, addRole, removeRole } = useRoleContext()
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()

  const handleAddRole = (type: RoleType) => {
    setSelectedRole(type)
  }

  const handleRoleSubmit = (data: any) => {
    if (selectedRole) {
      addRole({
        type: selectedRole,
        isComplete: true,
        data,
      })
      setIsAddRoleOpen(false)
      setSelectedRole(null)
    }
  }

  const handleRemoveRole = (type: RoleType) => {
    removeRole(type)
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const renderRoleForm = () => {
    switch (selectedRole) {
      case "rider":
        return <RiderForm onSubmit={handleRoleSubmit} />
      case "driver":
        return <DriverForm onSubmit={handleRoleSubmit} />
      case "reviewer":
        return <ReviewerForm onSubmit={handleRoleSubmit} />
      case "candidate":
        return <CandidateForm onSubmit={handleRoleSubmit} />
      default:
        return null
    }
  }

  const getRoleIcon = (type: RoleType) => {
    switch (type) {
      case "rider":
        return <PersonIcon />
      case "driver":
        return <CarIcon />
      case "reviewer":
        return <FileIcon />
      case "candidate":
        return <WorkIcon />
      default:
        return null
    }
  }

  const getRoleTitle = (type: RoleType) => {
    switch (type) {
      case "rider":
        return "Rider"
      case "driver":
        return "Driver"
      case "reviewer":
        return "Reviewer"
      case "candidate":
        return "Candidate"
      default:
        return type
    }
  }

  const getRoleDescription = (type: RoleType) => {
    switch (type) {
      case "rider":
        return "Request rides and travel to your destinations"
      case "driver":
        return "Provide rides to users and earn money"
      case "reviewer":
        return "Review papers and provide feedback"
      case "candidate":
        return "Apply for jobs and track applications"
      default:
        return ""
    }
  }

  // Add the MobileNav component to the return statement
  return (
    <>
      <TopBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className={styles.container}>
        <div className={styles.header}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={() => router.back()} sx={{ display: { xs: "flex", md: "none" } }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">Your Profile</Typography>
          </Box>

          <Box>
            {roles.length > 0 && (
              <Button variant="contained" onClick={handleGoToDashboard} color="primary">
                Go to Dashboard
              </Button>
            )}
          </Box>
        </div>

        <div className={styles.section}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="First Name" defaultValue="John" fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Last Name" defaultValue="Doe" fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Email" type="email" defaultValue="john.doe@example.com" fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Phone" defaultValue="+1 (555) 123-4567" fullWidth margin="normal" />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary">
                Save Changes
              </Button>
            </CardActions>
          </Card>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h5">Your Roles</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddRoleOpen(true)} color="primary">
              Add Role
            </Button>
          </div>

          {roles.length === 0 ? (
            <Card>
              <CardContent className={styles.emptyState}>
                <Typography color="textSecondary" paragraph>
                  You haven't added any roles yet.
                </Typography>
                <Typography color="textSecondary" paragraph>
                  Add a role to access different features of the platform.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddRoleOpen(true)}
                  color="primary"
                >
                  Add Your First Role
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={styles.rolesGrid}>
              {roles.map((role) => (
                <Card key={role.type}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {getRoleIcon(role.type)}
                        <Typography variant="h6">{getRoleTitle(role.type)}</Typography>
                      </Box>
                      <Box>
                        {role.isComplete ? (
                          <Paper variant="outlined" sx={{ px: 1, py: 0.5, bgcolor: "primary.main", color: "white" }}>
                            <Typography variant="caption">Complete</Typography>
                          </Paper>
                        ) : (
                          <Paper variant="outlined" sx={{ px: 1, py: 0.5 }}>
                            <Typography variant="caption">Incomplete</Typography>
                          </Paper>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      {getRoleDescription(role.type)}
                    </Typography>

                    {role.type === "driver" && role.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Vehicle:</strong> {role.data.vehicle}
                        </Typography>
                        <Typography variant="body2">
                          <strong>License:</strong> {role.data.license}
                        </Typography>
                      </Box>
                    )}

                    {role.type === "reviewer" && role.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Expertise:</strong> {role.data.expertise}
                        </Typography>
                      </Box>
                    )}

                    {role.type === "candidate" && role.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Skills:</strong> {role.data.skills}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleRemoveRole(role.type)}
                      fullWidth
                    >
                      Remove Role
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Role Dialog */}
        <Dialog open={isAddRoleOpen} onClose={() => setIsAddRoleOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{selectedRole ? `Add ${getRoleTitle(selectedRole)} Role` : "Add a New Role"}</DialogTitle>
          <DialogContent>
            {!selectedRole ? (
              <div className={styles.roleSelectionGrid}>
                <Button variant="outlined" className={styles.roleButton} onClick={() => handleAddRole("rider")}>
                  <PersonIcon className={styles.roleIcon} />
                  <Typography>Rider</Typography>
                </Button>
                <Button variant="outlined" className={styles.roleButton} onClick={() => handleAddRole("driver")}>
                  <CarIcon className={styles.roleIcon} />
                  <Typography>Driver</Typography>
                </Button>
                <Button variant="outlined" className={styles.roleButton} onClick={() => handleAddRole("reviewer")}>
                  <FileIcon className={styles.roleIcon} />
                  <Typography>Reviewer</Typography>
                </Button>
                <Button variant="outlined" className={styles.roleButton} onClick={() => handleAddRole("candidate")}>
                  <WorkIcon className={styles.roleIcon} />
                  <Typography>Candidate</Typography>
                </Button>
              </div>
            ) : (
              <Box sx={{ py: 2 }}>{renderRoleForm()}</Box>
            )}
          </DialogContent>
          {selectedRole && (
            <DialogActions>
              <Button onClick={() => setSelectedRole(null)}>Back</Button>
            </DialogActions>
          )}
        </Dialog>
      </div>
      <MobileNav />
    </>
  )
}

