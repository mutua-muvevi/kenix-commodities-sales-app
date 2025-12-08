/**
 * Responsive Design Utilities
 * Breakpoints and responsive helpers for adaptive layouts
 */

import { Dimensions } from 'react-native';
import { Breakpoints } from '../types/theme';

/**
 * Standard breakpoints for responsive design
 */
export const breakpoints: Breakpoints = {
  xs: 0,    // Extra small devices (phones, portrait)
  sm: 375,  // Small devices (phones, landscape)
  md: 768,  // Medium devices (tablets, portrait)
  lg: 1024, // Large devices (tablets, landscape)
  xl: 1280, // Extra large devices (desktops)
};

/**
 * Get current breakpoint based on screen width
 * @returns Current breakpoint key
 */
export const getCurrentBreakpoint = (): keyof Breakpoints => {
  const { width } = Dimensions.get('window');

  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Check if screen is at least a certain breakpoint
 * @param breakpoint - Breakpoint to check
 * @returns true if screen width is >= breakpoint
 */
export const isBreakpoint = (breakpoint: keyof Breakpoints): boolean => {
  const { width } = Dimensions.get('window');
  return width >= breakpoints[breakpoint];
};

/**
 * Check if screen is between two breakpoints
 * @param min - Minimum breakpoint
 * @param max - Maximum breakpoint
 * @returns true if screen width is between breakpoints
 */
export const isBreakpointBetween = (
  min: keyof Breakpoints,
  max: keyof Breakpoints
): boolean => {
  const { width } = Dimensions.get('window');
  return width >= breakpoints[min] && width < breakpoints[max];
};

/**
 * Get responsive value based on breakpoints
 * @param values - Object with values for each breakpoint
 * @returns Value for current breakpoint
 */
export const getResponsiveBreakpointValue = <T,>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T | undefined => {
  const currentBreakpoint = getCurrentBreakpoint();

  // Return exact match if available
  if (values[currentBreakpoint] !== undefined) {
    return values[currentBreakpoint];
  }

  // Fall back to smaller breakpoints
  const breakpointOrder: (keyof Breakpoints)[] = ['xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
};

/**
 * Create responsive spacing
 * @param base - Base spacing value
 * @param multiplier - Multiplier for larger screens
 * @returns Responsive spacing
 */
export const responsiveSpacing = (base: number, multiplier: number = 1.5): number => {
  const { width } = Dimensions.get('window');

  if (width >= breakpoints.lg) {
    return base * multiplier;
  }
  if (width >= breakpoints.md) {
    return base * (multiplier * 0.75);
  }
  return base;
};

/**
 * Create responsive font size
 * @param base - Base font size
 * @param scale - Scale factor for larger screens
 * @returns Responsive font size
 */
export const responsiveFontSize = (base: number, scale: number = 1.2): number => {
  const { width } = Dimensions.get('window');

  if (width >= breakpoints.lg) {
    return Math.round(base * scale);
  }
  if (width >= breakpoints.md) {
    return Math.round(base * (scale * 0.85));
  }
  return base;
};

/**
 * Get number of columns for grid layouts
 * @param minColumnWidth - Minimum width per column
 * @param padding - Horizontal padding
 * @param gap - Gap between columns
 * @returns Number of columns
 */
export const getGridColumns = (
  minColumnWidth: number = 150,
  padding: number = 16,
  gap: number = 16
): number => {
  const { width } = Dimensions.get('window');
  const availableWidth = width - padding * 2;
  const columns = Math.floor((availableWidth + gap) / (minColumnWidth + gap));
  return Math.max(1, columns);
};

/**
 * Get responsive container padding
 * @returns Container padding based on screen size
 */
export const getContainerPadding = (): number => {
  return getResponsiveBreakpointValue({
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }) || 16;
};

/**
 * Get responsive container max width
 * @returns Container max width based on screen size
 */
export const getContainerMaxWidth = (): number => {
  return getResponsiveBreakpointValue({
    xs: Dimensions.get('window').width,
    sm: Dimensions.get('window').width,
    md: 720,
    lg: 960,
    xl: 1200,
  }) || Dimensions.get('window').width;
};

/**
 * Check if device is in portrait orientation
 */
export const isPortrait = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return height > width;
};

/**
 * Check if device is in landscape orientation
 */
export const isLandscape = (): boolean => {
  return !isPortrait();
};

/**
 * Get orientation-specific value
 * @param portrait - Value for portrait orientation
 * @param landscape - Value for landscape orientation
 * @returns Orientation-specific value
 */
export const getOrientationValue = <T,>(portrait: T, landscape: T): T => {
  return isPortrait() ? portrait : landscape;
};

/**
 * Helper to create responsive styles
 * @param styles - Styles object with breakpoint keys
 * @returns Active styles for current breakpoint
 */
export const createResponsiveStyles = <T extends Record<string, any>>(
  styles: {
    xs?: Partial<T>;
    sm?: Partial<T>;
    md?: Partial<T>;
    lg?: Partial<T>;
    xl?: Partial<T>;
  }
): Partial<T> => {
  const currentBreakpoint = getCurrentBreakpoint();
  const breakpointOrder: (keyof Breakpoints)[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  let mergedStyles: Partial<T> = {};

  // Merge styles from xs up to current breakpoint
  for (let i = 0; i <= currentIndex; i++) {
    const bp = breakpointOrder[i];
    if (styles[bp]) {
      mergedStyles = { ...mergedStyles, ...styles[bp] };
    }
  }

  return mergedStyles;
};

/**
 * Subscribe to orientation changes
 * @param callback - Callback function
 * @returns Subscription
 */
export const subscribeToOrientationChange = (
  callback: (orientation: 'portrait' | 'landscape') => void
) => {
  const subscription = Dimensions.addEventListener('change', () => {
    callback(isPortrait() ? 'portrait' : 'landscape');
  });

  return subscription;
};

/**
 * Subscribe to breakpoint changes
 * @param callback - Callback function
 * @returns Subscription
 */
export const subscribeToBreakpointChange = (
  callback: (breakpoint: keyof Breakpoints) => void
) => {
  let currentBreakpoint = getCurrentBreakpoint();

  const subscription = Dimensions.addEventListener('change', () => {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback(newBreakpoint);
    }
  });

  return subscription;
};
