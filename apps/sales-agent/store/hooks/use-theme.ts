/**
 * Theme Store Hooks
 * Custom hooks for accessing theme state and actions
 */

import { useThemeStore, ThemeMode } from '../slices/theme/theme-store';

/**
 * Get entire theme state
 */
export const useTheme = () => useThemeStore((state) => state.theme);

/**
 * Get theme mode
 */
export const useThemeMode = (): ThemeMode => useThemeStore((state) => state.themeMode);

/**
 * Get is dark mode
 */
export const useIsDark = (): boolean => useThemeStore((state) => state.isDark);

/**
 * Get setThemeMode action
 */
export const useSetTheme = () => useThemeStore((state) => state.setThemeMode);

/**
 * Get toggleTheme action
 */
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme);

/**
 * Get initializeTheme action (for system theme detection)
 */
export const useSetIsDark = () => useThemeStore((state) => state.initializeTheme);

/**
 * Check if theme is in light mode
 */
export const useIsLightMode = (): boolean => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = useThemeStore((state) => state.isDark);
  return themeMode === 'light' || (themeMode === 'auto' && !isDark);
};

/**
 * Check if theme is in dark mode
 */
export const useIsDarkMode = (): boolean => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = useThemeStore((state) => state.isDark);
  return themeMode === 'dark' || (themeMode === 'auto' && isDark);
};

/**
 * Check if theme is set to auto (system)
 */
export const useIsSystemTheme = (): boolean => {
  const themeMode = useThemeStore((state) => state.themeMode);
  return themeMode === 'auto';
};
