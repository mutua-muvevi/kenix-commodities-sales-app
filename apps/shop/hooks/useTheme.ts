// hooks/useTheme.ts - Updated to use Zustand store instead of Context
import { useMemo } from "react";
import { useThemeStore } from "../store/slices/theme/theme-store";
import { createComponentStyles } from "../theme/components";

export const useTheme = () => {
	const { theme, isDark, themeMode, setThemeMode, toggleTheme } = useThemeStore();

	const componentStyles = useMemo(() => createComponentStyles(theme), [theme]);

	return {
		theme,
		isDark,
		themeMode,
		setThemeMode,
		toggleTheme,
		styles: componentStyles,
	};
};
