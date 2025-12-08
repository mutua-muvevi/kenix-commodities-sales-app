// app/_layout.tsx - Fixed to use Zustand theme store with proper system color scheme handling
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeStore } from "../store/slices/theme/theme-store";

function RootLayoutNav() {
	const systemColorScheme = useColorScheme();
	const { isDark, initializeTheme, updateSystemTheme } = useThemeStore();

	useEffect(() => {
		// Initialize theme when app starts
		initializeTheme(systemColorScheme || "light");
	}, [initializeTheme]);

	useEffect(() => {
		// Update theme when system color scheme changes
		if (systemColorScheme) {
			updateSystemTheme(systemColorScheme);
		}
	}, [systemColorScheme, updateSystemTheme]);

	return (
		<>
			<StatusBar style={isDark ? "light" : "dark"} />
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</>
	);
}

export default function RootLayout() {
	return <RootLayoutNav />;
}
