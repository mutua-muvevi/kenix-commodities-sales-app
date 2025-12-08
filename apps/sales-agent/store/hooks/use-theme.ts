/**
 * Theme Store Hooks
 * Custom hooks for accessing theme state and actions
 */

import { useThemeStore, ThemeMode } from '../slices/theme/theme-store';

/**
 * Get entire theme state
 */
export const useTheme = () => useThemeStore((state) => state);

/**
 * Get theme mode
 */
export const useThemeMode = (): ThemeMode => useThemeStore((state) => state.mode);

/**
 * Get is dark mode
 */
export const useIsDark = (): boolean => useThemeStore((state) => state.isDark);

/**
 * Get setTheme action
 */
export const useSetTheme = () => useThemeStore((state) => state.setTheme);

/**
 * Get toggleTheme action
 */
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme);

/**
 * Get setIsDark action (for system theme detection)
 */
export const useSetIsDark = () => useThemeStore((state) => state.setIsDark);

/**
 * Check if theme is in light mode
 */
export const useIsLightMode = (): boolean => {
  const mode = useThemeStore((state) => state.mode);
  const isDark = useThemeStore((state) => state.isDark);
  return mode === 'light' || (mode === 'system' && !isDark);
};

/**
 * Check if theme is in dark mode
 */
export const useIsDarkMode = (): boolean => {
  const mode = useThemeStore((state) => state.mode);
  const isDark = useThemeStore((state) => state.isDark);
  return mode === 'dark' || (mode === 'system' && isDark);
};

/**
 * Check if theme is set to system
 */
export const useIsSystemTheme = (): boolean => {
  const mode = useThemeStore((state) => state.mode);
  return mode === 'system';
};
