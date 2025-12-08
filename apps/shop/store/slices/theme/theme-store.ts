// store/slices/theme/theme-store.ts - Fixed useColorScheme usage
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { logger } from "../../middleware/logger";
import { secureStorage } from "../../middleware/persist";
import { createTheme } from "../../../theme";
import { ThemeType } from "../../../theme/types/theme";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeState {
	themeMode: ThemeMode;
	theme: ThemeType;
	isDark: boolean;
}

interface ThemeStore extends ThemeState {
	setThemeMode: (mode: ThemeMode) => void;
	toggleTheme: () => void;
	initializeTheme: (systemColorScheme?: "light" | "dark") => void;
	updateSystemTheme: (systemColorScheme: "light" | "dark") => void;
}

// Get initial theme without using hooks
const getInitialTheme = (): ThemeState => {
	return {
		themeMode: "auto",
		isDark: false, // Default to light, will be updated on initialization
		theme: createTheme("light"),
	};
};

export const useThemeStore = create<ThemeStore>()(
	devtools(
		persist(
			logger(
				(set, get) => ({
					...getInitialTheme(),

					setThemeMode: (mode) => {
						let isDark: boolean;

						if (mode === "auto") {
							// Keep current isDark state for auto mode
							isDark = get().isDark;
						} else {
							isDark = mode === "dark";
						}

						set({
							themeMode: mode,
							isDark,
							theme: createTheme(isDark ? "dark" : "light"),
						});
					},

					toggleTheme: () => {
						const { themeMode } = get();
						const nextMode: ThemeMode =
							themeMode === "auto" ? "light" : themeMode === "light" ? "dark" : "auto";

						get().setThemeMode(nextMode);
					},

					initializeTheme: (systemColorScheme = "light") => {
						const { themeMode } = get();

						if (themeMode === "auto") {
							const isDark = systemColorScheme === "dark";
							set({
								isDark,
								theme: createTheme(isDark ? "dark" : "light"),
							});
						} else {
							// Re-apply the current theme mode to ensure consistency
							get().setThemeMode(themeMode);
						}
					},

					updateSystemTheme: (systemColorScheme) => {
						const { themeMode } = get();

						// Only update if we're in auto mode
						if (themeMode === "auto") {
							const isDark = systemColorScheme === "dark";
							set({
								isDark,
								theme: createTheme(isDark ? "dark" : "light"),
							});
						}
					},
				}),
				"theme-store",
			),
			{
				name: "shop-theme-store",
				storage: createJSONStorage(() => secureStorage),
				partialize: (state) => ({
					themeMode: state.themeMode,
				}),
			},
		),
		{ name: "theme-store" },
	),
);
