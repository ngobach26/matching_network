"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"

type SnackbarSeverity = "success" | "info" | "warning" | "error"

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider")
  }
  return context
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState<SnackbarSeverity>("info")

  const showSnackbar = (message: string, severity: SnackbarSeverity = "info") => {
    setMessage(message)
    setSeverity(severity)
    setOpen(true)
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

