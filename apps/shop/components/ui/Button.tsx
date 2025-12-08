// components/ui/Button.tsx - Complete component with ES6+ arrow functions
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
	title: string;
	variant?: "primary" | "secondary" | "outlined" | "text" | "gradient";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	loading?: boolean;
	onPress?: () => void;
	style?: ViewStyle;
	textStyle?: TextStyle;
	icon?: React.ReactNode;
	fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
	title,
	variant = "primary",
	size = "medium",
	disabled = false,
	loading = false,
	onPress,
	style,
	textStyle,
	icon,
	fullWidth = false,
}) => {
	const { theme } = useTheme();
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	const handlePressIn = () => {
		scale.value = withSpring(0.96);
		opacity.value = withTiming(0.8);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
		opacity.value = withTiming(1);
	};

	const handlePress = () => {
		if (onPress && !disabled && !loading) {
			runOnJS(onPress)();
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	const getButtonStyle = (): ViewStyle => {
		const sizeStyles = {
			small: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, minHeight: 36 },
			medium: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, minHeight: 44 },
			large: { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl, minHeight: 52 },
		};

		const baseStyle: ViewStyle = {
			borderRadius: theme.borderRadius.lg,
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "row",
			...sizeStyles[size],
			...(fullWidth && { width: "100%" }),
		};

		if (disabled || loading) {
			baseStyle.opacity = 0.6;
		}

		return baseStyle;
	};

	const getTextStyle = (): TextStyle => {
		const baseTextStyle = { ...theme.typography.button };

		const textColors = {
			primary: theme.palette.primary.contrastText,
			secondary: theme.palette.secondary.contrastText,
			outlined: theme.palette.primary.main,
			text: theme.palette.primary.main,
			gradient: theme.palette.common.white,
		};

		return {
			...baseTextStyle,
			color: textColors[variant],
			fontWeight: "600",
		};
	};

	const getBackgroundColor = () => {
		const backgrounds = {
			primary: theme.palette.primary.main,
			secondary: theme.palette.secondary.main,
			outlined: "transparent",
			text: "transparent",
			gradient: "transparent",
		};

		return backgrounds[variant];
	};

	const getBorderStyle = () => {
		if (variant === "outlined") {
			return {
				borderWidth: 2,
				borderColor: theme.palette.primary.main,
			};
		}
		return {};
	};

	const renderButtonContent = () => (
		<>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={
						variant === "outlined" || variant === "text"
							? theme.palette.primary.main
							: theme.palette.common.white
					}
				/>
			) : (
				<>
					{icon && icon}
					<Text style={[getTextStyle(), textStyle, icon && { marginLeft: theme.spacing.sm }]}>{title}</Text>
				</>
			)}
		</>
	);

	if (variant === "gradient") {
		return (
			<AnimatedTouchable
				style={[animatedStyle, getButtonStyle(), style]}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				activeOpacity={1}
				disabled={disabled || loading}
			>
				<LinearGradient
					colors={[theme.palette.primary.main, theme.palette.primary.dark]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[getButtonStyle(), { margin: 0 }]}
				>
					{renderButtonContent()}
				</LinearGradient>
			</AnimatedTouchable>
		);
	}

	return (
		<AnimatedTouchable
			style={[
				animatedStyle,
				getButtonStyle(),
				{ backgroundColor: getBackgroundColor() },
				getBorderStyle(),
				style,
			]}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onPress={handlePress}
			activeOpacity={1}
			disabled={disabled || loading}
		>
			{renderButtonContent()}
		</AnimatedTouchable>
	);
};
