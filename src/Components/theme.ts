// src/Components/theme.ts
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" }, // Vibrant blue
    secondary: { main: "#ff9800" }, // Soft orange
    background: {
      default: "#fdfdfd",  // Off-white background
      paper: "#ffffff",    // Clean card surfaces
    },
    text: {
      primary: "#1e293b",   // Deep slate
      secondary: "#64748b", // Muted gray-blue
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700, color: "#0f172a" },
    body1: { lineHeight: 1.7 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },   // Soft sky blue
    secondary: { main: "#ffb74d" }, // Warm orange
    background: {
      default: "#0d1b2a", // Deep navy
      paper: "#1b263b",   // Classy dark blue card
    },
    text: {
      primary: "#e2e8f0",   // Soft white
      secondary: "#a9b4c2", // Muted gray-blue
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700, color: "#e2e8f0" },
    body1: { lineHeight: 1.7 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "linear-gradient(145deg, #1b263b 0%, #0d1b2a 100%)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#1b263b",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
        },
      },
    },
  },
});
