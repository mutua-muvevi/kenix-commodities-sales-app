// components/form/RHFTextField.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface RHFTextFieldProps {
	name: string;
	label?: string;
	placeholder?: string;
	helperText?: string;
	type?: "text" | "email" | "password" | "number" | "phone";
	multiline?: boolean;
	numberOfLines?: number;
	maxLength?: number;
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
	autoCorrect?: boolean;
	keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
	leftIcon?: string;
	rightIcon?: string;
	onRightIconPress?: () => void;
	disabled?: boolean;
	style?: ViewStyle;
	inputStyle?: TextStyle;
	required?: boolean;
}

export const RHFTextField: React.FC<RHFTextFieldProps> = ({
	name,
	label,
	placeholder,
	helperText,
	type = "text",
	multiline = false,
	numberOfLines = 1,
	maxLength,
	autoCapitalize = "sentences",
	autoCorrect = true,
	keyboardType = "default",
	leftIcon,
	rightIcon,
	onRightIconPress,
	disabled = false,
	style,
	inputStyle,
	required = false,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();
	const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const scale = useSharedValue(1);

	const handleFocus = () => {
		setIsFocused(true);
		scale.value = withSpring(1.02);
	};

	const handleBlur = () => {
		setIsFocused(false);
		scale.value = withSpring(1);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const getKeyboardType = () => {
		if (keyboardType !== "default") return keyboardType;
		switch (type) {
			case "email":
				return "email-address";
			case "number":
				return "numeric";
			case "phone":
				return "phone-pad";
			default:
				return "default";
		}
	};

	const getAutoCapitalize = () => {
		if (type === "email") return "none";
		return autoCapitalize;
	};

	const getSecureTextEntry = () => {
		return type === "password" && !showPassword;
	};

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm, // Reduced spacing
		},
		labelContainer: {
			flexDirection: "row",
			marginBottom: theme.spacing.xs,
		},
		label: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "500",
		},
		required: {
			color: theme.palette.error.main,
			marginLeft: 2,
		},
		inputContainer: {
			flexDirection: "row",
			alignItems: multiline ? "flex-start" : "center",
			backgroundColor: theme.palette.background.surface,
			borderWidth: 1,
			borderColor: isFocused ? theme.palette.primary.main : theme.palette.grey[300],
			borderRadius: theme.borderRadius.sm, // Smaller radius
			paddingHorizontal: theme.spacing.sm, // Reduced padding
			paddingVertical: multiline ? theme.spacing.sm : theme.spacing.xs,
			minHeight: multiline ? 80 : 44, // Reduced height
		},
		inputContainerError: {
			borderColor: theme.palette.error.main,
		},
		inputContainerDisabled: {
			backgroundColor: theme.palette.grey[100],
			opacity: 0.6,
		},
		leftIconContainer: {
			marginRight: theme.spacing.xs,
			paddingTop: multiline ? theme.spacing.xs : 0,
		},
		input: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14, // Slightly smaller font
			textAlignVertical: multiline ? "top" : "center",
			paddingVertical: 0,
		},
		rightIconContainer: {
			marginLeft: theme.spacing.xs,
			padding: theme.spacing.xs,
		},
		helperText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
			fontSize: 11, // Smaller helper text
		},
		errorText: {
			color: theme.palette.error.main,
		},
	});

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<Animated.View style={[styles.container, animatedStyle, style]}>
					{label && (
						<View style={styles.labelContainer}>
							<Text style={styles.label}>{label}</Text>
							{required && <Text style={styles.required}>*</Text>}
						</View>
					)}

					<View
						style={[
							styles.inputContainer,
							error && styles.inputContainerError,
							disabled && styles.inputContainerDisabled,
						]}
					>
						{leftIcon && (
							<View style={styles.leftIconContainer}>
								<Ionicons
									name={leftIcon as any}
									size={20}
									color={isFocused ? theme.palette.primary.main : theme.palette.text.secondary}
								/>
							</View>
						)}

						<TextInput
							{...field}
							value={field.value || ""}
							onChangeText={(text) => {
								if (type === "number") {
									const numericValue = text.replace(/[^0-9.]/g, "");
									field.onChange(numericValue);
								} else {
									field.onChange(text);
								}
							}}
							placeholder={placeholder}
							placeholderTextColor={theme.palette.text.secondary}
							style={[styles.input, inputStyle]}
							onFocus={handleFocus}
							onBlur={handleBlur}
							multiline={multiline}
							numberOfLines={multiline ? numberOfLines : 1}
							maxLength={maxLength}
							autoCapitalize={getAutoCapitalize()}
							autoCorrect={autoCorrect}
							keyboardType={getKeyboardType()}
							secureTextEntry={getSecureTextEntry()}
							editable={!disabled}
							textContentType={
								type === "password" ? "password" : type === "email" ? "emailAddress" : "none"
							}
						/>

						{(type === "password" || rightIcon) && (
							<TouchableOpacity
								style={styles.rightIconContainer}
								onPress={type === "password" ? togglePasswordVisibility : onRightIconPress}
								disabled={disabled}
							>
								<Ionicons
									name={
										type === "password"
											? showPassword
												? "eye-off-outline"
												: "eye-outline"
											: (rightIcon as any)
									}
									size={20}
									color={theme.palette.text.secondary}
								/>
							</TouchableOpacity>
						)}
					</View>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}
				</Animated.View>
			)}
		/>
	);
};

export default RHFTextField;
