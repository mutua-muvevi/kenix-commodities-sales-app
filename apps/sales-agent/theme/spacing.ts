/**
 * Spacing and Border Radius System
 * Provides consistent spacing and border radius tokens
 */

import { Spacing, BorderRadius } from './types/theme';
import { moderateScale } from './utils/dimensions';

/**
 * Base spacing unit (8px)
 * All spacing values are multiples of this base unit
 */
const BASE_UNIT = 8;

/**
 * Spacing scale
 * Provides consistent spacing throughout the app
 */
export const spacing: Spacing = {
  unit: BASE_UNIT,
  xs: moderateScale(BASE_UNIT * 0.5),    // 4px
  sm: moderateScale(BASE_UNIT),          // 8px
  md: moderateScale(BASE_UNIT * 2),      // 16px
  lg: moderateScale(BASE_UNIT * 3),      // 24px
  xl: moderateScale(BASE_UNIT * 4),      // 32px
  xxl: moderateScale(BASE_UNIT * 6),     // 48px
  xxxl: moderateScale(BASE_UNIT * 8),    // 64px
};

/**
 * Border radius scale
 * Provides consistent border radius values
 */
export const borderRadius: BorderRadius = {
  xs: moderateScale(2),   // 2px - subtle rounding
  sm: moderateScale(4),   // 4px - small components
  md: moderateScale(8),   // 8px - default for most components
  lg: moderateScale(12),  // 12px - cards, modals
  xl: moderateScale(16),  // 16px - large cards
  xxl: moderateScale(24), // 24px - special components
  full: 9999,             // Fully rounded (pills, circular)
};

/**
 * Spacing helpers
 */

/**
 * Get spacing value by multiplying base unit
 * @param multiplier - Multiplier for base unit
 * @returns Scaled spacing value
 */
export const getSpacing = (multiplier: number): number => {
  return moderateScale(BASE_UNIT * multiplier);
};

/**
 * Get horizontal padding
 * @param size - Spacing size key or custom number
 * @returns Horizontal padding object
 */
export const getHorizontalPadding = (
  size: keyof Omit<Spacing, 'unit'> | number
): { paddingHorizontal: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { paddingHorizontal: value };
};

/**
 * Get vertical padding
 * @param size - Spacing size key or custom number
 * @returns Vertical padding object
 */
export const getVerticalPadding = (
  size: keyof Omit<Spacing, 'unit'> | number
): { paddingVertical: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { paddingVertical: value };
};

/**
 * Get all-around padding
 * @param size - Spacing size key or custom number
 * @returns Padding object
 */
export const getPadding = (
  size: keyof Omit<Spacing, 'unit'> | number
): { padding: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { padding: value };
};

/**
 * Get custom padding
 * @param top - Top padding
 * @param right - Right padding
 * @param bottom - Bottom padding
 * @param left - Left padding
 * @returns Padding object
 */
export const getCustomPadding = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => ({
  paddingTop: top,
  paddingRight: right,
  paddingBottom: bottom,
  paddingLeft: left,
});

/**
 * Get horizontal margin
 * @param size - Spacing size key or custom number
 * @returns Horizontal margin object
 */
export const getHorizontalMargin = (
  size: keyof Omit<Spacing, 'unit'> | number
): { marginHorizontal: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { marginHorizontal: value };
};

/**
 * Get vertical margin
 * @param size - Spacing size key or custom number
 * @returns Vertical margin object
 */
export const getVerticalMargin = (
  size: keyof Omit<Spacing, 'unit'> | number
): { marginVertical: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { marginVertical: value };
};

/**
 * Get all-around margin
 * @param size - Spacing size key or custom number
 * @returns Margin object
 */
export const getMargin = (
  size: keyof Omit<Spacing, 'unit'> | number
): { margin: number } => {
  const value = typeof size === 'number' ? size : spacing[size];
  return { margin: value };
};

/**
 * Get custom margin
 * @param top - Top margin
 * @param right - Right margin
 * @param bottom - Bottom margin
 * @param left - Left margin
 * @returns Margin object
 */
export const getCustomMargin = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => ({
  marginTop: top,
  marginRight: right,
  marginBottom: bottom,
  marginLeft: left,
});

/**
 * Border radius helpers
 */

/**
 * Get border radius
 * @param size - Border radius size key or custom number
 * @returns Border radius object
 */
export const getBorderRadius = (
  size: keyof BorderRadius | number
): { borderRadius: number } => {
  const value = typeof size === 'number' ? size : borderRadius[size];
  return { borderRadius: value };
};

/**
 * Get top border radius
 * @param size - Border radius size key or custom number
 * @returns Top border radius object
 */
export const getTopBorderRadius = (
  size: keyof BorderRadius | number
): {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
} => {
  const value = typeof size === 'number' ? size : borderRadius[size];
  return {
    borderTopLeftRadius: value,
    borderTopRightRadius: value,
  };
};

/**
 * Get bottom border radius
 * @param size - Border radius size key or custom number
 * @returns Bottom border radius object
 */
export const getBottomBorderRadius = (
  size: keyof BorderRadius | number
): {
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
} => {
  const value = typeof size === 'number' ? size : borderRadius[size];
  return {
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value,
  };
};

/**
 * Get left border radius
 * @param size - Border radius size key or custom number
 * @returns Left border radius object
 */
export const getLeftBorderRadius = (
  size: keyof BorderRadius | number
): {
  borderTopLeftRadius: number;
  borderBottomLeftRadius: number;
} => {
  const value = typeof size === 'number' ? size : borderRadius[size];
  return {
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value,
  };
};

/**
 * Get right border radius
 * @param size - Border radius size key or custom number
 * @returns Right border radius object
 */
export const getRightBorderRadius = (
  size: keyof BorderRadius | number
): {
  borderTopRightRadius: number;
  borderBottomRightRadius: number;
} => {
  const value = typeof size === 'number' ? size : borderRadius[size];
  return {
    borderTopRightRadius: value,
    borderBottomRightRadius: value,
  };
};

/**
 * Common spacing presets
 */
export const spacingPresets = {
  // Container padding
  containerPadding: getHorizontalPadding('md'),
  containerPaddingLarge: getHorizontalPadding('lg'),

  // Section spacing
  sectionMargin: getVerticalMargin('lg'),
  sectionPadding: getPadding('lg'),

  // Card spacing
  cardPadding: getPadding('md'),
  cardMargin: getMargin('md'),

  // List item spacing
  listItemPadding: getVerticalPadding('md'),
  listItemGap: getMargin('sm'),

  // Button spacing
  buttonPadding: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonMargin: getMargin('sm'),

  // Input spacing
  inputPadding: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputMargin: getMargin('md'),

  // Screen padding
  screenPadding: getPadding('md'),
  screenHorizontalPadding: getHorizontalPadding('md'),
  screenVerticalPadding: getVerticalPadding('md'),

  // Grid gap
  gridGap: spacing.md,
  gridGapSmall: spacing.sm,
  gridGapLarge: spacing.lg,
};

/**
 * Common border radius presets
 */
export const borderRadiusPresets = {
  // Cards
  card: getBorderRadius('lg'),
  cardSmall: getBorderRadius('md'),

  // Buttons
  button: getBorderRadius('md'),
  buttonRound: getBorderRadius('full'),

  // Inputs
  input: getBorderRadius('md'),

  // Modals and dialogs
  modal: getBorderRadius('xl'),
  dialog: getBorderRadius('lg'),

  // Badges and chips
  badge: getBorderRadius('full'),
  chip: getBorderRadius('full'),

  // Images
  avatar: getBorderRadius('full'),
  imageRound: getBorderRadius('full'),
  imageDefault: getBorderRadius('md'),

  // Bottom sheets
  bottomSheet: getTopBorderRadius('xl'),
};
