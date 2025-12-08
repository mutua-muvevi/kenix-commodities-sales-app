import { StyleSheet } from "react-native";
import { ThemeType } from "./types/theme";

export const createComponentStyles = (theme: ThemeType) => {
	return StyleSheet.create({
		// Button variants - More compact
		buttonPrimary: {
			backgroundColor: theme.palette.primary.main,
			borderRadius: theme.borderRadius.md,
			paddingVertical: theme.spacing.sm, // Reduced from md
			paddingHorizontal: theme.spacing.md, // Reduced from lg
			...theme.shadows.button,
		},
		buttonSecondary: {
			backgroundColor: theme.palette.secondary.main,
			borderRadius: theme.borderRadius.md,
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			...theme.shadows.button,
		},
		buttonOutlined: {
			backgroundColor: "transparent",
			borderWidth: 1,
			borderColor: theme.palette.primary.main,
			borderRadius: theme.borderRadius.md,
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
		},
		buttonText: {
			backgroundColor: "transparent",
			paddingVertical: theme.spacing.xs, // Reduced from sm
			paddingHorizontal: theme.spacing.sm, // Reduced from md
		},

		// Card variants - More compact
		card: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.sm, // Reduced from md
			...theme.shadows.card,
		},
		cardElevated: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg,
			padding: theme.spacing.md, // Reduced from lg
			...theme.shadows.z8,
		},

		// Input variants - More compact
		input: {
			backgroundColor: theme.palette.background.surface,
			borderWidth: 1,
			borderColor: theme.palette.grey[300],
			borderRadius: theme.borderRadius.md,
			paddingVertical: theme.spacing.sm, // Reduced from md
			paddingHorizontal: theme.spacing.sm, // Reduced from md
			fontSize: 16,
			color: theme.palette.text.primary,
		},
		inputFocused: {
			borderColor: theme.palette.primary.main,
			borderWidth: 2,
		},
		inputError: {
			borderColor: theme.palette.error.main,
		},

		// Product card styles - Much more compact
		productCard: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.md, // Reduced from lg
			margin: theme.spacing.xs,
			...theme.shadows.card,
		},
		productImage: {
			borderTopLeftRadius: theme.borderRadius.md,
			borderTopRightRadius: theme.borderRadius.md,
			backgroundColor: theme.palette.grey[100],
		},
		productInfo: {
			padding: theme.spacing.sm, // Reduced from md
		},

		// Navigation styles - More compact
		tabBar: {
			backgroundColor: theme.palette.background.paper,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			paddingBottom: theme.spacing.xs, // Reduced from sm
			...theme.shadows.z4,
		},
		header: {
			backgroundColor: theme.palette.background.paper,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
			...theme.shadows.z2,
		},

		// Container styles - More compact
		container: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
		},
		safeArea: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
		},
		section: {
			backgroundColor: theme.palette.background.paper,
			marginVertical: theme.spacing.xs, // Reduced
			padding: theme.spacing.sm, // Reduced from md
		},

		// Text styles - Optimized line heights
		textPrimary: {
			color: theme.palette.text.primary,
			...theme.typography.body1,
			lineHeight: theme.typography.body1.fontSize! * 1.3, // Tighter line height
		},
		textSecondary: {
			color: theme.palette.text.secondary,
			...theme.typography.body2,
			lineHeight: theme.typography.body2.fontSize! * 1.3,
		},
		textDisabled: {
			color: theme.palette.text.disabled,
		},

		// Price styles - More compact
		priceOriginal: {
			color: theme.palette.text.primary,
			fontWeight: "700",
			...theme.typography.subtitle1, // Smaller than h6
		},
		priceDiscounted: {
			color: theme.palette.error.main,
			fontWeight: "700",
			...theme.typography.subtitle1,
		},
		priceStrikethrough: {
			color: theme.palette.text.secondary,
			textDecorationLine: "line-through",
			...theme.typography.caption,
		},

		// Badge styles - More compact
		badge: {
			backgroundColor: theme.palette.primary.main,
			borderRadius: theme.borderRadius.xl, // Reduced from xxl
			paddingVertical: theme.spacing.xs / 2, // Much smaller
			paddingHorizontal: theme.spacing.xs,
			minWidth: 16, // Reduced from 20
			alignItems: "center",
			justifyContent: "center",
		},
		badgeSecondary: {
			backgroundColor: theme.palette.secondary.main,
		},
		badgeSuccess: {
			backgroundColor: theme.palette.success.main,
		},
		badgeWarning: {
			backgroundColor: theme.palette.warning.main,
		},
		badgeError: {
			backgroundColor: theme.palette.error.main,
		},

		// Loading states
		skeleton: {
			backgroundColor: theme.palette.grey[300],
			borderRadius: theme.borderRadius.xs, // Reduced from sm
		},
		shimmer: {
			backgroundColor: theme.palette.grey[200],
		},
	});
};
