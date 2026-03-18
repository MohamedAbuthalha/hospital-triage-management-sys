// ============================================================================
// UNIFIED HOSPITAL MANAGEMENT SYSTEM THEME COLORS
// ============================================================================
// All UI components should use these colors for consistency across the platform

export const COLORS = {
  // PRIMARY BRAND COLORS
  primary: {
    main: "#0b188f",          // Dark Navy Blue - Main brand color
    light: "#4f46e5",         // Light variant for secondary uses
    lighter: "#e0e7ff",       // Very light for backgrounds
    dark: "#08107a",          // Dark variant for hover/active states
  },

  // NEUTRAL/GRAYSCALE
  gray: {
    50: "#f9fafb",            // Lightest
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",           // Darkest
  },

  // STATUS COLORS
  success: {
    bg: "#d1fae5",            // Light green background
    color: "#065f46",         // Dark green text
    border: "#6ee7b7",        // Green border
    light: "#e6ffe6",         // Lighter alternative
  },

  error: {
    bg: "#fee2e2",            // Light red background
    color: "#991b1b",         // Dark red text
    border: "#fca5a5",        // Red border
    light: "#fff1f2",         // Lighter alternative
  },

  warning: {
    bg: "#fef3c7",            // Light yellow background
    color: "#92400e",         // Dark orange text
    border: "#fcd34d",        // Yellow border
    light: "#fffbeb",         // Lighter alternative
  },

  info: {
    bg: "#dbeafe",            // Light blue background
    color: "#1e40af",         // Dark blue text
    border: "#93c5fd",        // Blue border
  },

  // SEMANTIC COLORS
  text: {
    primary: "#1e293b",       // Main text color (dark slate)
    secondary: "#64748b",     // Secondary text color (medium slate)
    tertiary: "#94a3b8",      // Tertiary text color (light slate)
    muted: "#cbd5e1",         // Very light text (for disabled, etc.)
  },

  background: {
    main: "#f0f4f8",          // Main page background (light blue-gray)
    card: "#ffffff",          // Card/panel background (white)
    hover: "#f8fafc",         // Hover state background
    overlay: "rgba(0, 0, 0, 0.45)", // Modal overlay
  },

  border: {
    light: "#e2e8f0",         // Light borders
    medium: "#cbd5e1",        // Medium borders
    dark: "#94a3b8",          // Dark borders
  },

  // SIDEBAR/NAVIGATION
  sidebar: {
    bg: "#0b188f",            // Match primary background
    hover: "#08107a",         // Hover state
    text: "#ffffff",          // White text
    accent: "#4f46e5",        // Accent color
  },

  // FORM ELEMENTS
  input: {
    bg: "#fafafa",            // Input background
    border: "#e2e8f0",        // Input border
    borderHover: "#cbd5e1",   // Input border on hover
    borderFocus: "#0b188f",   // Input border on focus
    placeholder: "#94a3b8",   // Placeholder text
  },

  // BUTTONS
  button: {
    primary: {
      bg: "#0b188f",
      text: "#ffffff",
      hover: "#08107a",
      active: "#06126e",
      disabled: "#cbd5e1",
    },
    secondary: {
      bg: "#f1f5f9",
      text: "#475569",
      hover: "#e2e8f0",
      active: "#cbd5e1",
      disabled: "#e2e8f0",
    },
    ghost: {
      bg: "transparent",
      text: "#475569",
      hover: "#f1f5f9",
      border: "#e2e8f0",
    },
  },

  // TABLE
  table: {
    header: "#f8fafc",        // Table header background
    hover: "#f1f5f9",         // Table row hover
    border: "#e2e8f0",        // Table borders
    stripe: "#fafafa",        // Alternate row background (optional)
  },

  // ROLE BADGES
  roles: {
    doctor: { bg: "#e3f2fd", color: "#1976d2", light: "#eff6ff" },
    nurse: { bg: "#f3e5f5", color: "#7b1fa2", light: "#fdf4ff" },
    admin: { bg: "#e8f5e9", color: "#388e3c", light: "#f1f5f9" },
    pharmacist: { bg: "#f3e5f5", color: "#7b1fa2", light: "#fdf4ff" },
    receptionist: { bg: "#fff3e0", color: "#ef6c00", light: "#fff7ed" },
    patient: { bg: "#e0f2f1", color: "#00796b", light: "#f0f9f8" },
    lab: { bg: "#fce4ec", color: "#c2185b", light: "#fff0f5" },
  },

  // SHADOWS
  shadow: {
    sm: "0 1px 4px rgba(0, 0, 0, 0.1)",
    md: "0 2px 8px rgba(0, 0, 0, 0.06)",
    lg: "0 2px 12px rgba(0, 0, 0, 0.06)",
    xl: "0 25px 70px rgba(0, 0, 2, 0.5)",
    hover: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
};

// USAGE EXAMPLES:
// import { COLORS } from '../theme/colors';
// 
// // In JSX styles:
// style={{ background: COLORS.primary.main, color: COLORS.text.primary }}
// 
// // In CSS:
// color: var(--color-primary-main);
//
// For CSS variables approach, also see the CSS file that imports this
