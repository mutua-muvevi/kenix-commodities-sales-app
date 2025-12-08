/**
 * Color Utility Functions
 * Provides color manipulation utilities for the theme system
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Add alpha channel to color
 * @param color - Hex color string
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export const alpha = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedOpacity})`;
};

/**
 * Lighten a color by a given amount
 * @param color - Hex color string
 * @param amount - Amount to lighten (0-1)
 * @returns Lightened hex color
 */
export const lighten = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const clampedAmount = Math.max(0, Math.min(1, amount));

  const r = rgb.r + (255 - rgb.r) * clampedAmount;
  const g = rgb.g + (255 - rgb.g) * clampedAmount;
  const b = rgb.b + (255 - rgb.b) * clampedAmount;

  return rgbToHex(r, g, b);
};

/**
 * Darken a color by a given amount
 * @param color - Hex color string
 * @param amount - Amount to darken (0-1)
 * @returns Darkened hex color
 */
export const darken = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const clampedAmount = Math.max(0, Math.min(1, amount));

  const r = rgb.r * (1 - clampedAmount);
  const g = rgb.g * (1 - clampedAmount);
  const b = rgb.b * (1 - clampedAmount);

  return rgbToHex(r, g, b);
};

/**
 * Get contrast text color (black or white) based on background
 * @param background - Background hex color
 * @returns '#FFFFFF' or '#000000'
 */
export const getContrastText = (background: string): string => {
  const rgb = hexToRgb(background);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Mix two colors together
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param weight - Weight of first color (0-1)
 * @returns Mixed hex color
 */
export const mixColors = (color1: string, color2: string, weight: number = 0.5): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const clampedWeight = Math.max(0, Math.min(1, weight));

  const r = rgb1.r * clampedWeight + rgb2.r * (1 - clampedWeight);
  const g = rgb1.g * clampedWeight + rgb2.g * (1 - clampedWeight);
  const b = rgb1.b * clampedWeight + rgb2.b * (1 - clampedWeight);

  return rgbToHex(r, g, b);
};

/**
 * Check if a color is light or dark
 * @param color - Hex color string
 * @returns true if light, false if dark
 */
export const isLightColor = (color: string): boolean => {
  const rgb = hexToRgb(color);
  if (!rgb) return true;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
};

/**
 * Generate a color palette from a base color
 * @param baseColor - Base hex color
 * @returns Color palette with lighter, light, main, dark, darker variants
 */
export const generateColorPalette = (baseColor: string) => {
  return {
    lighter: lighten(baseColor, 0.85),
    light: lighten(baseColor, 0.5),
    main: baseColor,
    dark: darken(baseColor, 0.2),
    darker: darken(baseColor, 0.4),
    contrastText: getContrastText(baseColor),
  };
};

/**
 * Validate hex color format
 * @param color - Color string to validate
 * @returns true if valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(color);
};

/**
 * Ensure color has # prefix
 * @param color - Color string
 * @returns Color with # prefix
 */
export const normalizeHexColor = (color: string): string => {
  return color.startsWith('#') ? color : `#${color}`;
};
