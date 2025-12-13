// app/_layout.tsx - Fixed to use Zustand theme store with proper system color scheme handling
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useThemeStore } from "../store/slices/theme/theme-store";
import { FloatingCartButton } from "../components/ui/FloatingCartButton";

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
			{/* Floating Cart Button - appears on all screens except cart */}
			<FloatingCartButton />
			{/* Toast notifications */}
			<Toast />
		</>
	);
}

export default function RootLayout() {
	return <RootLayoutNav />;
}
