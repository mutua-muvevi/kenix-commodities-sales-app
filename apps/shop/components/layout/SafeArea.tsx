// components/layout/SafeArea.tsx - Enhanced safe area with Android navigation support
import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

interface SafeAreaProps {
	children: ReactNode;
	style?: ViewStyle;
	edges?: ("top" | "bottom" | "left" | "right")[];
	hasTabBar?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({ children, style, edges = ["top"], hasTabBar = true }) => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();

	// Calculate bottom padding to avoid Android navigation overlap
	const getBottomPadding = () => {
		if (!hasTabBar) return 0;

		if (Platform.OS === "ios") {
			return 0; // Tab bar handles this
		}

		// Android: Add extra padding above system navigation
		const tabBarHeight = 60;
		const systemNavPadding = Math.max(insets.bottom, 16);
		return tabBarHeight + systemNavPadding + 8; // Extra safety margin
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
			paddingBottom: getBottomPadding(),
		},
	});

	return (
		<SafeAreaView style={[styles.container, style]} edges={edges}>
			{children}
		</SafeAreaView>
	);
};
