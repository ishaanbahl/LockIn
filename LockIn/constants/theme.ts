export const Colors = {
  // Core palette
  background: "#F2F2F7", // Off-white iOS background
  surface: "#FFFFFF",
  surfaceLight: "#E5E5EA", // Light gray for pills
  border: "#C7C7CC",

  // Accent
  primary: "#000000",
  primaryLight: "#333333",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#FF9500",

  // Text
  textPrimary: "#000000",
  textSecondary: "#3C3C43",
  textMuted: "#8E8E93",
  
  // Task Colors (Soft Pastel / Dull Palette)
  taskColors: {
    default: "#3C3C43",
    red: "#D49A9A",    // Soft Dusty Rose
    blue: "#97A5B8",   // Muted Slate Blue
    green: "#A3B19E",  // Sage Green
    yellow: "#C9BEA2", // Muted Sand/Dull Gold
  }
};

// For backward compatibility during migration
export const LightColors = Colors;
export const DarkColors = Colors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
