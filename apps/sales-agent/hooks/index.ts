/**
 * Custom Hooks for Sales Agent App
 *
 * Centralized export for all custom hooks used throughout the application.
 * These hooks provide reusable logic for common patterns like debouncing,
 * theming, permissions, and data fetching.
 */

// Debounce and throttle hooks
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
} from './useDebounce';

// Theme hooks
export {
  useTheme,
  useThemeStyles,
  createTheme,
  type Theme,
} from './useTheme';

// Permission hooks
export {
  usePermissions,
  useLocationPermission,
  useCameraPermission,
  type PermissionStatus,
} from './usePermissions';

// Refresh and async data hooks
export {
  useRefresh,
  useAsyncData,
  usePaginatedData,
  usePolling,
} from './useRefresh';
