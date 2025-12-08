/**
 * Theme System Entry Point
 * Main export for the Sales Agent App theme system
 *
 * Usage:
 * import { theme, lightTheme, darkTheme, createTheme } from '@/theme';
 */

import { ThemeType, ThemeConfig, ThemeMode } from './types/theme';
import { getPalette, createCustomPalette } from './palette';
import { typography } from './typography';
import { shadows } from './shadows';
import { spacing, borderRadius } from './spacing';
import { breakpoints } from './utils/responsive';
import { createComponentStyles } from './components';

/**
 * Create theme object
 * @param config - Theme configuration
 * @returns Complete theme object
 */
export const createTheme = (config?: ThemeConfig): ThemeType => {
  const mode = config?.mode || 'light';
  const palette = config?.primaryColor || config?.secondaryColor
    ? createCustomPalette(mode, config.primaryColor, config.secondaryColor)
    : getPalette(mode);

  const baseTheme: ThemeType = {
    palette,
    typography,
    shadows,
    spacing,
    borderRadius,
    breakpoints,
    components: {} as any, // Will be set below
  };

  // Create component styles with the theme
  baseTheme.components = createComponentStyles(baseTheme);

  return baseTheme;
};

/**
 * Default light theme
 */
export const lightTheme = createTheme({ mode: 'light' });

/**
 * Default dark theme
 */
export const darkTheme = createTheme({ mode: 'dark' });

/**
 * Default theme (light mode)
 */
export const theme = lightTheme;

/**
 * Export all theme utilities and types
 */

// Types
export type { ThemeType, ThemeMode, ThemeConfig } from './types/theme';
export type {
  ThemeColors,
  GreyColors,
  CommonColors,
  ActionColors,
  BackgroundColors,
  TextColors,
  Palette,
  Typography,
  TextStyle,
  CustomShadows,
  Shadow,
  Spacing,
  BorderRadius,
  Breakpoints,
  ComponentStyles,
} from './types/theme';

// Color utilities
export {
  alpha,
  lighten,
  darken,
  getContrastText,
  mixColors,
  isLightColor,
  generateColorPalette,
  isValidHexColor,
  normalizeHexColor,
  hexToRgb,
  rgbToHex,
} from './utils/colors';

// Dimension utilities
export {
  screenWidth,
  screenHeight,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isTablet,
  isPhone,
  isIOS,
  isAndroid,
  isPortrait,
  isLandscape,
  SAFE_AREA_PADDING,
  STATUS_BAR_HEIGHT,
  HEADER_HEIGHT,
  TAB_BAR_HEIGHT,
  horizontalScale,
  verticalScale,
  moderateScale,
  scaleFontSize,
  getResponsiveValue,
  getDeviceValue,
  getPlatformValue,
  dpToPixels,
  pixelsToDp,
  pixelRatio,
  hasNotch,
  getAspectRatio,
  updateDimensions,
  subscribeToOrientationChange,
} from './utils/dimensions';

// Responsive utilities
export {
  breakpoints,
  getCurrentBreakpoint,
  isBreakpoint,
  isBreakpointBetween,
  getResponsiveBreakpointValue,
  responsiveSpacing,
  responsiveFontSize,
  getGridColumns,
  getContainerPadding,
  getContainerMaxWidth,
  getOrientationValue,
  createResponsiveStyles,
  subscribeToBreakpointChange,
} from './utils/responsive';

// Palette
export {
  common,
  grey,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  lightPalette,
  darkPalette,
  getPalette,
  createCustomPalette,
} from './palette';

// Typography
export {
  typography,
  fontWeights,
  getFontSize,
  getFontWeight,
  getLineHeight,
  createCustomVariant,
  typographyPresets,
  textTruncation,
  textAlignment,
  textTransform,
} from './typography';

// Spacing
export {
  spacing,
  borderRadius,
  getSpacing,
  getHorizontalPadding,
  getVerticalPadding,
  getPadding,
  getCustomPadding,
  getHorizontalMargin,
  getVerticalMargin,
  getMargin,
  getCustomMargin,
  getBorderRadius,
  getTopBorderRadius,
  getBottomBorderRadius,
  getLeftBorderRadius,
  getRightBorderRadius,
  spacingPresets,
  borderRadiusPresets,
} from './spacing';

// Shadows
export {
  shadows,
  getShadow,
  createCustomShadow,
  shadowPresets,
  getModeShadow,
  combineShadows,
  createInnerShadow,
  createGlow,
  platformShadow,
} from './shadows';

// Components
export { createComponentStyles } from './components';
export type { ComponentStyles } from './components';

/**
 * Theme hook utilities (for use with React Context)
 */

/**
 * Get theme based on mode
 * @param mode - Theme mode
 * @returns Theme object
 */
export const getThemeByMode = (mode: ThemeMode): ThemeType => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Toggle theme mode
 * @param currentMode - Current theme mode
 * @returns New theme mode
 */
export const toggleThemeMode = (currentMode: ThemeMode): ThemeMode => {
  return currentMode === 'light' ? 'dark' : 'light';
};

/**
 * Check if dark mode is active
 * @param mode - Theme mode
 * @returns true if dark mode
 */
export const isDarkMode = (mode: ThemeMode): boolean => {
  return mode === 'dark';
};

/**
 * Get system theme preference
 * Note: This requires @react-native-community/hooks or similar
 * @returns System theme mode
 */
export const getSystemThemeMode = (): ThemeMode => {
  // Placeholder - implement with actual system theme detection
  // For now, default to light mode
  return 'light';
};

/**
 * Theme constants for quick access
 */
export const THEME_CONSTANTS = {
  PRIMARY_COLOR: '#22c55e',
  SECONDARY_COLOR: '#3b82f6',
  SUCCESS_COLOR: '#10b981',
  WARNING_COLOR: '#f59e0b',
  ERROR_COLOR: '#ef4444',
  INFO_COLOR: '#06b6d4',
  DEFAULT_SPACING: 16,
  DEFAULT_BORDER_RADIUS: 8,
  ANIMATION_DURATION: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  SCREEN_BREAKPOINTS: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
} as const;

/**
 * Default export
 */
export default {
  theme,
  lightTheme,
  darkTheme,
  createTheme,
  getThemeByMode,
  toggleThemeMode,
  isDarkMode,
  THEME_CONSTANTS,
};
