// components/layout/ScreenWrapper.tsx - Wrapper for proper Android navigation handling
import React, { ReactNode } from "react";
import { View, StyleSheet, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

interface ScreenWrapperProps {
	children: ReactNode;
	hasTabBar?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, hasTabBar = true }) => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();
	const { height: screenHeight } = Dimensions.get("window");

	// Calculate tab bar height to avoid overlap
	const getTabBarHeight = () => {
		if (!hasTabBar) return 0;

		if (Platform.OS === "ios") {
			return 49 + insets.bottom;
		}

		// Android calculation
		const baseHeight = 60;
		const additionalPadding = Math.max(insets.bottom, 16);
		return baseHeight + additionalPadding;
	};

	const tabBarHeight = getTabBarHeight();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
			// Ensure content doesn't go behind tab bar
			paddingBottom: hasTabBar ? tabBarHeight : 0,
		},
	});

	return <View style={styles.container}>{children}</View>;
};
