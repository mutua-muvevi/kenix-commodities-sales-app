/**
 * Color Constants for Sales Agent App
 * Provides a consistent color palette across the application
 * Supports both light and dark mode theming
 */

export const COLORS = {
  // Primary palette (Green - Success/Growth oriented)
  primary: '#22c55e',
  primaryLight: '#86efac',
  primaryDark: '#16a34a',

  // Secondary palette (Blue - Trust/Professional)
  secondary: '#3b82f6',
  secondaryLight: '#93c5fd',
  secondaryDark: '#2563eb',

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Grays (Tailwind-based scale)
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Status colors (Order/Shop/Route states)
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
  inProgress: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#6b7280',

  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Background
  background: '#f9fafb',
  surface: '#ffffff',
  card: '#ffffff',

  // Dark mode palette
  dark: {
    background: '#111827',
    surface: '#1f2937',
    card: '#374151',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#4b5563',
  },

  // Light mode palette
  light: {
    background: '#f9fafb',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradient colors
  gradient: {
    primary: ['#22c55e', '#16a34a'],
    secondary: ['#3b82f6', '#2563eb'],
    success: ['#22c55e', '#16a34a'],
    warning: ['#f59e0b', '#d97706'],
    error: ['#ef4444', '#dc2626'],
  },
};

export default COLORS;
