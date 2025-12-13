// ===================================================================
// components/ui/DataSourceIndicator.tsx - Component to show current data source
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

interface DataSourceIndicatorProps {
	dataSource: "mock" | "server" | "hybrid" | null;
	module: string;
	showIcon?: boolean;
	compact?: boolean;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
	dataSource,
	module,
	showIcon = true,
	compact = false,
}) => {
	const { theme } = useTheme();

	if (!dataSource) return null;

	const getIndicatorConfig = () => {
		switch (dataSource) {
			case "mock":
				return {
					color: theme.palette.warning.main,
					icon: "code-outline" as const,
					label: compact ? "Mock" : "Mock Data",
					description: `Using mock ${module} data`,
				};
			case "server":
				return {
					color: theme.palette.success.main,
					icon: "cloud-outline" as const,
					label: compact ? "Live" : "Server Data",
					description: `Using live ${module} data`,
				};
			case "hybrid":
				return {
					color: theme.palette.info.main,
					icon: "git-merge-outline" as const,
					label: compact ? "Hybrid" : "Hybrid Mode",
					description: `Server with mock ${module} fallback`,
				};
			default:
				return null;
		}
	};

	const config = getIndicatorConfig();
	if (!config) return null;

	const styles = StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: `${config.color}15`,
			borderColor: `${config.color}30`,
			borderWidth: 1,
			borderRadius: theme.borderRadius.sm,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
		},
		icon: {
			marginRight: theme.spacing.xs,
		},
		label: {
			...theme.typography.caption,
			color: config.color,
			fontWeight: "600",
		},
	});

	return (
		<View style={styles.container}>
			{showIcon && <Ionicons name={config.icon} size={12} color={config.color} style={styles.icon} />}
			<Text style={styles.label}>{config.label}</Text>
		</View>
	);
};
