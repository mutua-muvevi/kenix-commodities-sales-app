/**
 * Screen Dimensions and Device Utilities
 * Provides responsive sizing helpers based on device dimensions
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Get current screen dimensions
 */
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

/**
 * Device size categories
 */
export const isSmallScreen = screenWidth < 375;
export const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
export const isLargeScreen = screenWidth >= 414;

/**
 * Device type detection
 */
export const isTablet = screenWidth >= 768;
export const isPhone = screenWidth < 768;

/**
 * Platform detection
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Screen orientation
 */
export const isPortrait = screenHeight > screenWidth;
export const isLandscape = screenWidth > screenHeight;

/**
 * Safe area defaults (can be overridden by react-native-safe-area-context)
 */
export const SAFE_AREA_PADDING = {
  top: isIOS ? 44 : 0,
  bottom: isIOS ? 34 : 0,
  left: 0,
  right: 0,
};

/**
 * Status bar height
 */
export const STATUS_BAR_HEIGHT = Platform.select({
  ios: isLandscape ? 0 : 20,
  android: 0,
  default: 0,
});

/**
 * Navigation header height
 */
export const HEADER_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 56,
});

/**
 * Bottom tab bar height
 */
export const TAB_BAR_HEIGHT = Platform.select({
  ios: 49,
  android: 56,
  default: 56,
});

/**
 * Base dimension for scaling
 */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale size horizontally based on screen width
 * @param size - Base size to scale
 * @returns Scaled size
 */
export const horizontalScale = (size: number): number => {
  return (screenWidth / guidelineBaseWidth) * size;
};

/**
 * Scale size vertically based on screen height
 * @param size - Base size to scale
 * @returns Scaled size
 */
export const verticalScale = (size: number): number => {
  return (screenHeight / guidelineBaseHeight) * size;
};

/**
 * Moderate scale - less aggressive scaling
 * @param size - Base size to scale
 * @param factor - Scale factor (default: 0.5)
 * @returns Scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (horizontalScale(size) - size) * factor;
};

/**
 * Scale font size based on screen size
 * @param size - Base font size
 * @returns Scaled font size
 */
export const scaleFontSize = (size: number): number => {
  const scale = screenWidth / guidelineBaseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get responsive value based on screen size
 * @param small - Value for small screens
 * @param medium - Value for medium screens
 * @param large - Value for large screens
 * @returns Appropriate value for current screen size
 */
export const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

/**
 * Get value based on device type
 * @param phone - Value for phones
 * @param tablet - Value for tablets
 * @returns Appropriate value for current device
 */
export const getDeviceValue = <T,>(phone: T, tablet: T): T => {
  return isTablet ? tablet : phone;
};

/**
 * Get platform-specific value
 * @param ios - Value for iOS
 * @param android - Value for Android
 * @returns Platform-specific value
 */
export const getPlatformValue = <T,>(ios: T, android: T): T => {
  return Platform.select({ ios, android, default: android }) as T;
};

/**
 * Convert dp to pixels
 * @param dp - Density-independent pixels
 * @returns Physical pixels
 */
export const dpToPixels = (dp: number): number => {
  return PixelRatio.getPixelSizeForLayoutSize(dp);
};

/**
 * Convert pixels to dp
 * @param pixels - Physical pixels
 * @returns Density-independent pixels
 */
export const pixelsToDp = (pixels: number): number => {
  return pixels / PixelRatio.get();
};

/**
 * Get pixel ratio
 */
export const pixelRatio = PixelRatio.get();

/**
 * Check if device has notch
 */
export const hasNotch = (): boolean => {
  return (
    isIOS &&
    (screenHeight >= 812 || screenWidth >= 812) &&
    !Platform.isPad
  );
};

/**
 * Get screen aspect ratio
 */
export const getAspectRatio = (): number => {
  return screenWidth / screenHeight;
};

/**
 * Update dimensions on screen change
 */
export const updateDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Listen to dimension changes
 * @param callback - Callback function
 * @returns Subscription object
 */
export const subscribeToOrientationChange = (
  callback: ({ width, height }: { width: number; height: number }) => void
) => {
  return Dimensions.addEventListener('change', ({ window }) => {
    callback({ width: window.width, height: window.height });
  });
};
