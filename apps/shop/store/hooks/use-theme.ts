// store/hooks/use-theme.ts - Zustand hook for theme
import { useThemeStore } from "../slices/theme/theme-store";

export const useThemeHook = () => {
	const { theme, isDark, themeMode, setThemeMode, toggleTheme, initializeTheme } = useThemeStore();

	return {
		theme,
		isDark,
		themeMode,
		setThemeMode,
		toggleTheme,
		initializeTheme,
	};
};
