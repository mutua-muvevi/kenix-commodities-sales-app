/**
 * Color Palette for Sales Agent App
 * Primary: Green (#22c55e) - Sales, growth, success theme
 * Secondary: Blue (#3b82f6) - Trust, professionalism
 * Supports light and dark modes
 */

import { Palette, ThemeColors, GreyColors, CommonColors } from './types/theme';
import { getContrastText, lighten, darken, alpha } from './utils/colors';

/**
 * Common colors used across all themes
 */
export const common: CommonColors = {
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
};

/**
 * Grey color scale
 */
export const grey: GreyColors = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

/**
 * Primary color (Green - Sales/Growth theme)
 */
const primaryMain = '#22c55e';
export const primary: ThemeColors = {
  lighter: lighten(primaryMain, 0.85),
  light: lighten(primaryMain, 0.5),
  main: primaryMain,
  dark: darken(primaryMain, 0.2),
  darker: darken(primaryMain, 0.4),
  contrastText: getContrastText(primaryMain),
};

/**
 * Secondary color (Blue - Trust/Professional)
 */
const secondaryMain = '#3b82f6';
export const secondary: ThemeColors = {
  lighter: lighten(secondaryMain, 0.85),
  light: lighten(secondaryMain, 0.5),
  main: secondaryMain,
  dark: darken(secondaryMain, 0.2),
  darker: darken(secondaryMain, 0.4),
  contrastText: getContrastText(secondaryMain),
};

/**
 * Info color (Cyan)
 */
const infoMain = '#06b6d4';
export const info: ThemeColors = {
  lighter: lighten(infoMain, 0.85),
  light: lighten(infoMain, 0.5),
  main: infoMain,
  dark: darken(infoMain, 0.2),
  darker: darken(infoMain, 0.4),
  contrastText: getContrastText(infoMain),
};

/**
 * Success color (Green - aligned with primary)
 */
const successMain = '#10b981';
export const success: ThemeColors = {
  lighter: lighten(successMain, 0.85),
  light: lighten(successMain, 0.5),
  main: successMain,
  dark: darken(successMain, 0.2),
  darker: darken(successMain, 0.4),
  contrastText: getContrastText(successMain),
};

/**
 * Warning color (Amber)
 */
const warningMain = '#f59e0b';
export const warning: ThemeColors = {
  lighter: lighten(warningMain, 0.85),
  light: lighten(warningMain, 0.5),
  main: warningMain,
  dark: darken(warningMain, 0.2),
  darker: darken(warningMain, 0.4),
  contrastText: getContrastText(warningMain),
};

/**
 * Error color (Red)
 */
const errorMain = '#ef4444';
export const error: ThemeColors = {
  lighter: lighten(errorMain, 0.85),
  light: lighten(errorMain, 0.5),
  main: errorMain,
  dark: darken(errorMain, 0.2),
  darker: darken(errorMain, 0.4),
  contrastText: getContrastText(errorMain),
};

/**
 * Light mode palette
 */
export const lightPalette: Palette = {
  mode: 'light',
  common,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  text: {
    primary: grey[900],
    secondary: grey[600],
    disabled: grey[400],
  },
  background: {
    default: '#FFFFFF',
    paper: grey[50],
    neutral: grey[100],
  },
  action: {
    active: grey[600],
    hover: alpha(grey[500], 0.08),
    selected: alpha(primary.main, 0.12),
    disabled: alpha(grey[500], 0.26),
    disabledBackground: alpha(grey[500], 0.12),
    focus: alpha(primary.main, 0.12),
    hoverOpacity: 0.08,
    disabledOpacity: 0.38,
  },
  divider: alpha(grey[500], 0.12),
};

/**
 * Dark mode palette
 */
export const darkPalette: Palette = {
  mode: 'dark',
  common,
  primary: {
    ...primary,
    lighter: darken(primary.main, 0.85),
    light: darken(primary.main, 0.5),
    dark: lighten(primary.main, 0.2),
    darker: lighten(primary.main, 0.4),
  },
  secondary: {
    ...secondary,
    lighter: darken(secondary.main, 0.85),
    light: darken(secondary.main, 0.5),
    dark: lighten(secondary.main, 0.2),
    darker: lighten(secondary.main, 0.4),
  },
  info: {
    ...info,
    lighter: darken(info.main, 0.85),
    light: darken(info.main, 0.5),
    dark: lighten(info.main, 0.2),
    darker: lighten(info.main, 0.4),
  },
  success: {
    ...success,
    lighter: darken(success.main, 0.85),
    light: darken(success.main, 0.5),
    dark: lighten(success.main, 0.2),
    darker: lighten(success.main, 0.4),
  },
  warning: {
    ...warning,
    lighter: darken(warning.main, 0.85),
    light: darken(warning.main, 0.5),
    dark: lighten(warning.main, 0.2),
    darker: lighten(warning.main, 0.4),
  },
  error: {
    ...error,
    lighter: darken(error.main, 0.85),
    light: darken(error.main, 0.5),
    dark: lighten(error.main, 0.2),
    darker: lighten(error.main, 0.4),
  },
  grey,
  text: {
    primary: '#FFFFFF',
    secondary: grey[400],
    disabled: grey[600],
  },
  background: {
    default: '#121212',
    paper: grey[900],
    neutral: grey[800],
  },
  action: {
    active: grey[400],
    hover: alpha(grey[300], 0.08),
    selected: alpha(primary.main, 0.16),
    disabled: alpha(grey[300], 0.26),
    disabledBackground: alpha(grey[300], 0.12),
    focus: alpha(primary.main, 0.16),
    hoverOpacity: 0.08,
    disabledOpacity: 0.38,
  },
  divider: alpha(grey[300], 0.12),
};

/**
 * Get palette based on mode
 * @param mode - 'light' or 'dark'
 * @returns Palette for the specified mode
 */
export const getPalette = (mode: 'light' | 'dark'): Palette => {
  return mode === 'dark' ? darkPalette : lightPalette;
};

/**
 * Create custom palette with override colors
 * @param mode - 'light' or 'dark'
 * @param primaryColor - Custom primary color (optional)
 * @param secondaryColor - Custom secondary color (optional)
 * @returns Custom palette
 */
export const createCustomPalette = (
  mode: 'light' | 'dark',
  primaryColor?: string,
  secondaryColor?: string
): Palette => {
  const basePalette = getPalette(mode);

  if (!primaryColor && !secondaryColor) {
    return basePalette;
  }

  const customPrimary = primaryColor
    ? {
        lighter: lighten(primaryColor, 0.85),
        light: lighten(primaryColor, 0.5),
        main: primaryColor,
        dark: darken(primaryColor, 0.2),
        darker: darken(primaryColor, 0.4),
        contrastText: getContrastText(primaryColor),
      }
    : basePalette.primary;

  const customSecondary = secondaryColor
    ? {
        lighter: lighten(secondaryColor, 0.85),
        light: lighten(secondaryColor, 0.5),
        main: secondaryColor,
        dark: darken(secondaryColor, 0.2),
        darker: darken(secondaryColor, 0.4),
        contrastText: getContrastText(secondaryColor),
      }
    : basePalette.secondary;

  return {
    ...basePalette,
    primary: customPrimary,
    secondary: customSecondary,
  };
};
