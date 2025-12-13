// ===================================================================
// components/layout/Container.tsx - Updated with compact spacing
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface ContainerProps {
	children: ReactNode;
	style?: ViewStyle;
	padding?: boolean | "compact" | "normal";
	centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ children, style, padding = true, centered = false }) => {
	const { theme } = useTheme();

	const getPadding = () => {
		if (padding === false) return {};
		if (padding === "compact") return { paddingHorizontal: theme.spacing.sm };
		if (padding === "normal") return { paddingHorizontal: theme.spacing.md };
		return { paddingHorizontal: theme.spacing.sm }; // Default to compact
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
			...getPadding(),
			...(centered && {
				alignItems: "center",
				justifyContent: "center",
			}),
		},
	});

	return <View style={[styles.container, style]}>{children}</View>;
};