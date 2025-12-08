/**
 * Typography System for Sales Agent App
 * Defines text styles, font families, and typographic scale
 */

import { Platform } from 'react-native';
import { Typography, TextStyle } from './types/theme';
import { scaleFontSize } from './utils/dimensions';

/**
 * Font families
 */
const fontFamily = {
  primary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }) as string,
  secondary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }) as string,
};

/**
 * Font weights
 */
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

/**
 * Base font sizes (before scaling)
 */
const baseFontSizes = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  subtitle1: 16,
  subtitle2: 14,
  body1: 16,
  body2: 14,
  button: 14,
  caption: 12,
  overline: 10,
};

/**
 * Line height multipliers
 */
const lineHeightMultipliers = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

/**
 * Calculate line height
 */
const calculateLineHeight = (fontSize: number, multiplier: number): number => {
  return Math.round(fontSize * multiplier);
};

/**
 * Create text style
 */
const createTextStyle = (
  fontSize: number,
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  lineHeightMultiplier: number,
  letterSpacing?: number
): TextStyle => {
  const scaledFontSize = scaleFontSize(fontSize);
  return {
    fontFamily: fontFamily.primary,
    fontSize: scaledFontSize,
    fontWeight,
    lineHeight: calculateLineHeight(scaledFontSize, lineHeightMultiplier),
    letterSpacing,
  };
};

/**
 * Typography configuration
 */
export const typography: Typography = {
  fontFamily,

  // Headings
  h1: createTextStyle(
    baseFontSizes.h1,
    fontWeights.bold,
    lineHeightMultipliers.tight,
    -0.5
  ),

  h2: createTextStyle(
    baseFontSizes.h2,
    fontWeights.bold,
    lineHeightMultipliers.tight,
    -0.5
  ),

  h3: createTextStyle(
    baseFontSizes.h3,
    fontWeights.semiBold,
    lineHeightMultipliers.tight,
    0
  ),

  h4: createTextStyle(
    baseFontSizes.h4,
    fontWeights.semiBold,
    lineHeightMultipliers.normal,
    0.25
  ),

  h5: createTextStyle(
    baseFontSizes.h5,
    fontWeights.medium,
    lineHeightMultipliers.normal,
    0
  ),

  h6: createTextStyle(
    baseFontSizes.h6,
    fontWeights.medium,
    lineHeightMultipliers.normal,
    0.15
  ),

  // Subtitles
  subtitle1: createTextStyle(
    baseFontSizes.subtitle1,
    fontWeights.medium,
    lineHeightMultipliers.normal,
    0.15
  ),

  subtitle2: createTextStyle(
    baseFontSizes.subtitle2,
    fontWeights.medium,
    lineHeightMultipliers.normal,
    0.1
  ),

  // Body text
  body1: createTextStyle(
    baseFontSizes.body1,
    fontWeights.regular,
    lineHeightMultipliers.normal,
    0.5
  ),

  body2: createTextStyle(
    baseFontSizes.body2,
    fontWeights.regular,
    lineHeightMultipliers.normal,
    0.25
  ),

  // Button text
  button: createTextStyle(
    baseFontSizes.button,
    fontWeights.semiBold,
    lineHeightMultipliers.normal,
    0.4
  ),

  // Caption
  caption: createTextStyle(
    baseFontSizes.caption,
    fontWeights.regular,
    lineHeightMultipliers.normal,
    0.4
  ),

  // Overline
  overline: createTextStyle(
    baseFontSizes.overline,
    fontWeights.semiBold,
    lineHeightMultipliers.normal,
    1.5
  ),
};

/**
 * Typography helpers
 */

/**
 * Get responsive font size based on text style
 * @param variant - Typography variant
 * @returns Font size
 */
export const getFontSize = (variant: keyof Omit<Typography, 'fontFamily'>): number => {
  return typography[variant].fontSize;
};

/**
 * Get font weight for variant
 * @param variant - Typography variant
 * @returns Font weight
 */
export const getFontWeight = (
  variant: keyof Omit<Typography, 'fontFamily'>
): '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' => {
  return typography[variant].fontWeight;
};

/**
 * Get line height for variant
 * @param variant - Typography variant
 * @returns Line height
 */
export const getLineHeight = (variant: keyof Omit<Typography, 'fontFamily'>): number => {
  return typography[variant].lineHeight;
};

/**
 * Create custom typography variant
 * @param fontSize - Font size
 * @param fontWeight - Font weight
 * @param lineHeightMultiplier - Line height multiplier
 * @param letterSpacing - Letter spacing
 * @returns Text style
 */
export const createCustomVariant = (
  fontSize: number,
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' = '400',
  lineHeightMultiplier: number = 1.5,
  letterSpacing?: number
): TextStyle => {
  return createTextStyle(fontSize, fontWeight, lineHeightMultiplier, letterSpacing);
};

/**
 * Typography presets for common use cases
 */
export const typographyPresets = {
  // Navigation
  tabLabel: createTextStyle(10, fontWeights.medium, lineHeightMultipliers.tight, 0.5),
  headerTitle: createTextStyle(18, fontWeights.semiBold, lineHeightMultipliers.tight, 0),

  // Cards
  cardTitle: createTextStyle(16, fontWeights.semiBold, lineHeightMultipliers.normal, 0),
  cardSubtitle: createTextStyle(14, fontWeights.regular, lineHeightMultipliers.normal, 0),

  // Lists
  listTitle: createTextStyle(16, fontWeights.medium, lineHeightMultipliers.normal, 0),
  listSubtitle: createTextStyle(14, fontWeights.regular, lineHeightMultipliers.normal, 0),

  // Forms
  inputLabel: createTextStyle(14, fontWeights.medium, lineHeightMultipliers.normal, 0),
  inputText: createTextStyle(16, fontWeights.regular, lineHeightMultipliers.normal, 0),
  inputHelper: createTextStyle(12, fontWeights.regular, lineHeightMultipliers.normal, 0),
  inputError: createTextStyle(12, fontWeights.regular, lineHeightMultipliers.normal, 0),

  // Buttons
  buttonLarge: createTextStyle(16, fontWeights.semiBold, lineHeightMultipliers.tight, 0.5),
  buttonMedium: createTextStyle(14, fontWeights.semiBold, lineHeightMultipliers.tight, 0.4),
  buttonSmall: createTextStyle(12, fontWeights.semiBold, lineHeightMultipliers.tight, 0.3),

  // Badges and chips
  badge: createTextStyle(10, fontWeights.semiBold, lineHeightMultipliers.tight, 0.5),
  chip: createTextStyle(12, fontWeights.medium, lineHeightMultipliers.tight, 0),

  // Data display
  statValue: createTextStyle(24, fontWeights.bold, lineHeightMultipliers.tight, 0),
  statLabel: createTextStyle(12, fontWeights.medium, lineHeightMultipliers.normal, 0.5),

  // Notifications
  notificationTitle: createTextStyle(14, fontWeights.semiBold, lineHeightMultipliers.normal, 0),
  notificationBody: createTextStyle(12, fontWeights.regular, lineHeightMultipliers.normal, 0),

  // Empty states
  emptyStateTitle: createTextStyle(18, fontWeights.semiBold, lineHeightMultipliers.normal, 0),
  emptyStateDescription: createTextStyle(14, fontWeights.regular, lineHeightMultipliers.relaxed, 0),
};

/**
 * Text truncation helpers
 */
export const textTruncation = {
  singleLine: {
    numberOfLines: 1,
    ellipsizeMode: 'tail' as const,
  },
  twoLines: {
    numberOfLines: 2,
    ellipsizeMode: 'tail' as const,
  },
  threeLines: {
    numberOfLines: 3,
    ellipsizeMode: 'tail' as const,
  },
};

/**
 * Text alignment helpers
 */
export const textAlignment = {
  left: { textAlign: 'left' as const },
  center: { textAlign: 'center' as const },
  right: { textAlign: 'right' as const },
  justify: { textAlign: 'justify' as const },
};

/**
 * Text transform helpers
 */
export const textTransform = {
  uppercase: { textTransform: 'uppercase' as const },
  lowercase: { textTransform: 'lowercase' as const },
  capitalize: { textTransform: 'capitalize' as const },
  none: { textTransform: 'none' as const },
};
