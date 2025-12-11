/**
 * Theme Type Definitions for Sales Agent App
 * Comprehensive typing for the entire theme system
 */

import { TextStyle as RNTextStyle } from 'react-native';

/**
 * Color scale interface for theme colors
 */
export interface ThemeColors {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
}

/**
 * Grey color palette
 */
export interface GreyColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Common colors used across themes
 */
export interface CommonColors {
  black: string;
  white: string;
  transparent: string;
}

/**
 * Action state colors
 */
export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
  disabledBackground: string;
  focus: string;
  hoverOpacity: number;
  disabledOpacity: number;
}

/**
 * Background colors
 */
export interface BackgroundColors {
  default: string;
  paper: string;
  neutral: string;
}

/**
 * Text colors
 */
export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
}

/**
 * Complete color palette
 */
export interface Palette {
  mode: 'light' | 'dark';
  common: CommonColors;
  primary: ThemeColors;
  secondary: ThemeColors;
  info: ThemeColors;
  success: ThemeColors;
  warning: ThemeColors;
  error: ThemeColors;
  grey: GreyColors;
  text: TextColors;
  background: BackgroundColors;
  action: ActionColors;
  divider: string;
}

/**
 * Typography variant
 */
export interface TextStyle extends RNTextStyle {
  fontFamily?: string;
  fontSize: number;
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
}

/**
 * Typography system
 */
export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
  };
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  subtitle1: TextStyle;
  subtitle2: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
}

/**
 * Shadow definition
 */
export interface Shadow {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Custom shadows for different levels
 */
export interface CustomShadows {
  none: Shadow;
  z1: Shadow;
  z4: Shadow;
  z8: Shadow;
  z12: Shadow;
  z16: Shadow;
  z20: Shadow;
  z24: Shadow;
  primary: Shadow;
  secondary: Shadow;
  info: Shadow;
  success: Shadow;
  warning: Shadow;
  error: Shadow;
}

/**
 * Spacing scale
 */
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  unit: number;
}

/**
 * Border radius scale
 */
export interface BorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  full: number;
}

/**
 * Breakpoints for responsive design
 */
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * Component style variants
 */
export interface ComponentStyles {
  button: {
    primary: object;
    secondary: object;
    outlined: object;
    text: object;
  };
  card: {
    default: object;
    elevated: object;
    outlined: object;
  };
  input: {
    default: object;
    outlined: object;
    filled: object;
  };
}

/**
 * Main theme interface
 */
export interface ThemeType {
  palette: Palette;
  typography: Typography;
  shadows: CustomShadows;
  spacing: Spacing;
  borderRadius: BorderRadius;
  breakpoints: Breakpoints;
  components: ComponentStyles;
}

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  mode?: ThemeMode;
  primaryColor?: string;
  secondaryColor?: string;
}
