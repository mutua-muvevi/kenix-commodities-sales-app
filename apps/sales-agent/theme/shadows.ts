/**
 * Shadow System for Sales Agent App
 * Platform-specific shadow definitions for iOS and Android
 */

import { Platform } from 'react-native';
import { CustomShadows, Shadow } from './types/theme';
import { alpha } from './utils/colors';

/**
 * Create shadow configuration
 * @param color - Shadow color
 * @param offsetHeight - Shadow offset height
 * @param radius - Shadow radius (iOS) / elevation (Android)
 * @param opacity - Shadow opacity
 * @returns Shadow object
 */
const createShadow = (
  color: string,
  offsetHeight: number,
  radius: number,
  opacity: number
): Shadow => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: offsetHeight,
      },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation: 0,
    };
  }

  // Android uses elevation
  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: offsetHeight,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: radius,
  };
};

/**
 * Base shadow color
 */
const SHADOW_COLOR = '#000000';

/**
 * Custom shadows with different elevation levels
 */
export const shadows: CustomShadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Elevation level 1 - Subtle shadow for cards
  z1: createShadow(SHADOW_COLOR, 1, 2, 0.08),

  // Elevation level 4 - Default shadow for cards
  z4: createShadow(SHADOW_COLOR, 2, 4, 0.12),

  // Elevation level 8 - Elevated cards, dropdowns
  z8: createShadow(SHADOW_COLOR, 4, 8, 0.16),

  // Elevation level 12 - Floating action buttons
  z12: createShadow(SHADOW_COLOR, 6, 12, 0.2),

  // Elevation level 16 - Navigation drawer
  z16: createShadow(SHADOW_COLOR, 8, 16, 0.24),

  // Elevation level 20 - Modal dialogs
  z20: createShadow(SHADOW_COLOR, 10, 20, 0.28),

  // Elevation level 24 - Maximum elevation
  z24: createShadow(SHADOW_COLOR, 12, 24, 0.32),

  // Colored shadows for semantic components
  primary: createShadow('#22c55e', 4, 8, 0.24),
  secondary: createShadow('#3b82f6', 4, 8, 0.24),
  info: createShadow('#06b6d4', 4, 8, 0.24),
  success: createShadow('#10b981', 4, 8, 0.24),
  warning: createShadow('#f59e0b', 4, 8, 0.24),
  error: createShadow('#ef4444', 4, 8, 0.24),
};

/**
 * Get shadow for specific elevation level
 * @param level - Elevation level (1-24)
 * @returns Shadow object
 */
export const getShadow = (level: 1 | 4 | 8 | 12 | 16 | 20 | 24): Shadow => {
  const shadowKey = `z${level}` as keyof CustomShadows;
  return shadows[shadowKey];
};

/**
 * Create custom shadow
 * @param elevation - Elevation level
 * @param color - Shadow color (optional)
 * @returns Shadow object
 */
export const createCustomShadow = (
  elevation: number,
  color: string = SHADOW_COLOR
): Shadow => {
  const opacity = Math.min(0.4, elevation * 0.02);
  const radius = elevation;
  const offsetHeight = Math.ceil(elevation / 2);

  return createShadow(color, offsetHeight, radius, opacity);
};

/**
 * Shadow presets for common components
 */
export const shadowPresets = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Cards
  card: shadows.z4,
  cardHover: shadows.z8,
  cardPressed: shadows.z1,

  // Buttons
  button: shadows.z4,
  buttonHover: shadows.z8,
  buttonPressed: shadows.z1,
  fab: shadows.z12,

  // Navigation
  header: shadows.z4,
  bottomTab: shadows.z8,
  drawer: shadows.z16,

  // Modals and overlays
  modal: shadows.z20,
  dialog: shadows.z24,
  bottomSheet: shadows.z16,
  dropdown: shadows.z8,
  popover: shadows.z12,

  // Lists
  listItem: shadows.z1,
  listItemHover: shadows.z4,

  // Inputs
  input: shadows.z1,
  inputFocused: shadows.z4,

  // Images
  image: shadows.z1,
  imageHover: shadows.z4,

  // Chips and badges
  chip: shadows.z1,
  badge: shadows.z4,

  // Special components
  floatingCard: shadows.z12,
  stickyHeader: shadows.z8,
};

/**
 * Get shadow based on theme mode
 * @param lightShadow - Shadow for light mode
 * @param darkShadow - Shadow for dark mode (optional, defaults to lighter shadow)
 * @param isDarkMode - Whether dark mode is active
 * @returns Shadow object
 */
export const getModeShadow = (
  lightShadow: Shadow,
  darkShadow: Shadow | null,
  isDarkMode: boolean
): Shadow => {
  if (!isDarkMode) {
    return lightShadow;
  }

  // In dark mode, use provided dark shadow or reduce opacity of light shadow
  if (darkShadow) {
    return darkShadow;
  }

  return {
    ...lightShadow,
    shadowOpacity: lightShadow.shadowOpacity * 0.5,
  };
};

/**
 * Combine multiple shadows (iOS only, Android uses single elevation)
 * @param shadows - Array of shadows to combine
 * @returns Combined shadow object
 */
export const combineShadows = (...shadowList: Shadow[]): Shadow => {
  if (Platform.OS === 'android') {
    // Android only supports single elevation, use the highest
    const maxElevation = Math.max(...shadowList.map((s) => s.elevation));
    return shadowList.find((s) => s.elevation === maxElevation) || shadowList[0];
  }

  // iOS can combine shadows (not directly supported, but we return the strongest)
  const strongest = shadowList.reduce((prev, current) =>
    current.shadowRadius > prev.shadowRadius ? current : prev
  );

  return strongest;
};

/**
 * Create inner shadow effect (using border workaround)
 * @param color - Shadow color
 * @param width - Shadow width
 * @returns Style object for inner shadow
 */
export const createInnerShadow = (color: string, width: number = 1) => ({
  borderWidth: width,
  borderColor: alpha(color, 0.1),
});

/**
 * Create glow effect
 * @param color - Glow color
 * @param intensity - Glow intensity (1-10)
 * @returns Shadow object with glow effect
 */
export const createGlow = (color: string, intensity: number = 5): Shadow => {
  const radius = intensity * 2;
  const opacity = Math.min(0.6, intensity * 0.1);

  return createShadow(color, 0, radius, opacity);
};

/**
 * Platform-specific shadow helpers
 */
export const platformShadow = {
  /**
   * iOS shadow style
   */
  ios: (
    offsetHeight: number = 2,
    radius: number = 4,
    opacity: number = 0.12,
    color: string = SHADOW_COLOR
  ) => ({
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: offsetHeight,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
  }),

  /**
   * Android elevation style
   */
  android: (elevation: number = 4) => ({
    elevation,
  }),

  /**
   * Cross-platform shadow
   */
  cross: (
    offsetHeight: number = 2,
    radius: number = 4,
    opacity: number = 0.12,
    color: string = SHADOW_COLOR
  ) => Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: offsetHeight,
      },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: radius,
    },
    default: {},
  }),
};
