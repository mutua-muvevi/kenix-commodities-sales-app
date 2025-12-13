// components/ui/Card.tsx - Enhanced with shadows and animations
import React, { ReactNode } from "react";
import { ViewStyle, StyleSheet } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface CardProps {
	children: ReactNode;
	variant?: "default" | "elevated" | "outlined" | "glass";
	style?: ViewStyle;
	padding?: number;
	onPress?: () => void;
	animateOnMount?: boolean;
	delay?: number;
}

export const Card: React.FC<CardProps> = ({
	children,
	variant = "default",
	style,
	padding,
	onPress,
	animateOnMount = false,
	delay = 0,
}) => {
	const { theme } = useTheme();

	const getCardStyle = (): ViewStyle => {
		const baseStyle: ViewStyle = {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg,
			padding: padding !== undefined ? padding : theme.spacing.md,
		};

		const variantStyles = {
			default: {
				...theme.shadows.card,
			},
			elevated: {
				...theme.shadows.z8,
				backgroundColor: theme.palette.background.surface,
			},
			outlined: {
				borderWidth: 1,
				borderColor: theme.palette.divider,
				backgroundColor: theme.palette.background.surface,
			},
			glass: {
				backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)",
				backdropFilter: "blur(20px)",
				borderWidth: 1,
				borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
			},
		};

		return { ...baseStyle, ...variantStyles[variant] };
	};

	const CardComponent = onPress ? Animated.createAnimatedComponent(Animated.View) : Animated.View;

	if (animateOnMount) {
		return (
			<CardComponent
				entering={FadeInDown.delay(delay).springify()}
				layout={Layout.springify()}
				style={[getCardStyle(), style]}
				onTouchEnd={onPress}
			>
				{children}
			</CardComponent>
		);
	}

	return (
		<CardComponent style={[getCardStyle(), style]} onTouchEnd={onPress}>
			{children}
		</CardComponent>
	);
};
