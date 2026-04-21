/**
 * PolyEdge Color Palette
 * Dark theme only. Background: #0D0D1A. Accent: #00D4AA.
 */

export const Colors = {
  // Core colors
  background: '#0D0D1A',
  surface: '#1A1A2E',
  elevated: '#16213E',
  accent: '#00D4AA',
  accentDark: '#009B7D',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textTertiary: '#6A6A8A',
  
  // Border colors
  border: '#2A2A45',
  borderLight: '#3A3A55',
  
  // Status colors
  success: '#27AE60', // YES/Green
  error: '#E74C3C',   // NO/Red
  warning: '#F39C12',
  info: '#3498DB',
  
  // Market colors
  yes: '#27AE60',
  no: '#E74C3C',
  
  // Chart colors
  chartLine: '#00D4AA',
  chartGradientStart: 'rgba(0, 212, 170, 0.2)',
  chartGradientEnd: 'rgba(0, 212, 170, 0)',
  
  // Skeleton colors
  skeletonBackground: '#1A1A2E',
  skeletonHighlight: '#2A2A45',
  
  // Tab bar
  tabBarBackground: '#0D0D1A',
  tabBarActive: '#00D4AA',
  tabBarInactive: '#A0A0B8',
  
  // Button colors
  buttonPrimary: '#00D4AA',
  buttonPrimaryText: '#0D0D1A',
  buttonSecondary: '#2A2A45',
  buttonSecondaryText: '#FFFFFF',
  buttonDisabled: '#2A2A45',
  buttonDisabledText: '#6A6A8A',
} as const;

export type ColorName = keyof typeof Colors;