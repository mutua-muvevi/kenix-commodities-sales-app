// components/form/RHFCheckbox.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface CheckboxOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

interface RHFCheckboxProps {
	name: string;
	label?: string;
	helperText?: string;
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
}

interface RHFMultiCheckboxProps {
	name: string;
	label?: string;
	helperText?: string;
	options: CheckboxOption[];
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
	row?: boolean;
	spacing?: number;
}

// Single Checkbox Component
export const RHFCheckbox: React.FC<RHFCheckboxProps> = ({
	name,
	label,
	helperText,
	disabled = false,
	style,
	required = false,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();
	const scale = useSharedValue(1);

	const handlePress = (field: any) => {
		if (!disabled) {
			scale.value = withSpring(0.95, {}, () => {
				scale.value = withSpring(1);
			});
			field.onChange(!field.value);
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
		},
		checkboxContainer: {
			flexDirection: "row",
			alignItems: "center",
		},
		checkbox: {
			width: 20,
			height: 20,
			borderRadius: theme.borderRadius.xs,
			borderWidth: 2,
			borderColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.sm,
		},
		checkboxChecked: {
			backgroundColor: theme.palette.primary.main,
		},
		checkboxDisabled: {
			borderColor: theme.palette.grey[400],
			backgroundColor: theme.palette.grey[200],
		},
		labelContainer: {
			flex: 1,
			flexDirection: "row",
		},
		label: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14,
		},
		labelDisabled: {
			color: theme.palette.text.disabled,
		},
		required: {
			color: theme.palette.error.main,
			marginLeft: 2,
		},
		helperText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
			fontSize: 11,
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
				<View style={[styles.container, style]}>
					<TouchableOpacity
						style={styles.checkboxContainer}
						onPress={() => handlePress(field)}
						disabled={disabled}
						activeOpacity={0.7}
					>
						<Animated.View
							style={[
								styles.checkbox,
								field.value && styles.checkboxChecked,
								disabled && styles.checkboxDisabled,
								animatedStyle,
							]}
						>
							{field.value && (
								<Ionicons
									name="checkmark"
									size={14}
									color={disabled ? theme.palette.grey[600] : theme.palette.primary.contrastText}
								/>
							)}
						</Animated.View>

						{label && (
							<View style={styles.labelContainer}>
								<Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
								{required && <Text style={styles.required}>*</Text>}
							</View>
						)}
					</TouchableOpacity>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}
				</View>
			)}
		/>
	);
};

// Multiple Checkbox Component
export const RHFMultiCheckbox: React.FC<RHFMultiCheckboxProps> = ({
	name,
	label,
	helperText,
	options,
	disabled = false,
	style,
	required = false,
	row = false,
	spacing = 2,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();

	const handleOptionToggle = (optionValue: string | number, field: any) => {
		const currentValues = field.value || [];
		const isSelected = currentValues.includes(optionValue);

		if (isSelected) {
			field.onChange(currentValues.filter((value: any) => value !== optionValue));
		} else {
			field.onChange([...currentValues, optionValue]);
		}
	};

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
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
		optionsContainer: {
			flexDirection: row ? "row" : "column",
			flexWrap: row ? "wrap" : "nowrap",
		},
		optionItem: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: row ? 0 : theme.spacing.xs,
			marginRight: row ? theme.spacing.sm : 0,
			marginTop: row ? theme.spacing.xs : 0,
		},
		checkbox: {
			width: 18,
			height: 18,
			borderRadius: theme.borderRadius.xs,
			borderWidth: 1.5,
			borderColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.xs,
		},
		checkboxChecked: {
			backgroundColor: theme.palette.primary.main,
		},
		checkboxDisabled: {
			borderColor: theme.palette.grey[400],
			backgroundColor: theme.palette.grey[200],
		},
		optionLabel: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontSize: 13,
		},
		optionLabelDisabled: {
			color: theme.palette.text.disabled,
		},
		helperText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
			fontSize: 11,
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
				<View style={[styles.container, style]}>
					{label && (
						<View style={styles.labelContainer}>
							<Text style={styles.label}>{label}</Text>
							{required && <Text style={styles.required}>*</Text>}
						</View>
					)}

					<View style={styles.optionsContainer}>
						{options.map((option) => {
							const isSelected = (field.value || []).includes(option.value);
							const isDisabled = disabled || option.disabled;

							return (
								<TouchableOpacity
									key={option.value}
									style={styles.optionItem}
									onPress={() => !isDisabled && handleOptionToggle(option.value, field)}
									disabled={isDisabled}
									activeOpacity={0.7}
								>
									<View
										style={[
											styles.checkbox,
											isSelected && styles.checkboxChecked,
											isDisabled && styles.checkboxDisabled,
										]}
									>
										{isSelected && (
											<Ionicons
												name="checkmark"
												size={12}
												color={
													isDisabled
														? theme.palette.grey[600]
														: theme.palette.primary.contrastText
												}
											/>
										)}
									</View>
									<Text style={[styles.optionLabel, isDisabled && styles.optionLabelDisabled]}>
										{option.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}
				</View>
			)}
		/>
	);
};

// Radio Group Component
interface RadioOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

interface RHFRadioGroupProps {
	name: string;
	label?: string;
	helperText?: string;
	options: RadioOption[];
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
	row?: boolean;
}

export const RHFRadioGroup: React.FC<RHFRadioGroupProps> = ({
	name,
	label,
	helperText,
	options,
	disabled = false,
	style,
	required = false,
	row = false,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
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
		optionsContainer: {
			flexDirection: row ? "row" : "column",
			flexWrap: row ? "wrap" : "nowrap",
		},
		optionItem: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: row ? 0 : theme.spacing.xs,
			marginRight: row ? theme.spacing.md : 0,
			marginTop: row ? theme.spacing.xs : 0,
		},
		radio: {
			width: 20,
			height: 20,
			borderRadius: 10,
			borderWidth: 2,
			borderColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.sm,
		},
		radioSelected: {
			borderColor: theme.palette.primary.main,
		},
		radioDisabled: {
			borderColor: theme.palette.grey[400],
		},
		radioInner: {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: theme.palette.primary.main,
		},
		radioInnerDisabled: {
			backgroundColor: theme.palette.grey[400],
		},
		optionLabel: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14,
		},
		optionLabelDisabled: {
			color: theme.palette.text.disabled,
		},
		helperText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
			fontSize: 11,
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
				<View style={[styles.container, style]}>
					{label && (
						<View style={styles.labelContainer}>
							<Text style={styles.label}>{label}</Text>
							{required && <Text style={styles.required}>*</Text>}
						</View>
					)}

					<View style={styles.optionsContainer}>
						{options.map((option) => {
							const isSelected = field.value === option.value;
							const isDisabled = disabled || option.disabled;

							return (
								<TouchableOpacity
									key={option.value}
									style={styles.optionItem}
									onPress={() => !isDisabled && field.onChange(option.value)}
									disabled={isDisabled}
									activeOpacity={0.7}
								>
									<View
										style={[
											styles.radio,
											isSelected && styles.radioSelected,
											isDisabled && styles.radioDisabled,
										]}
									>
										{isSelected && (
											<View
												style={[styles.radioInner, isDisabled && styles.radioInnerDisabled]}
											/>
										)}
									</View>
									<Text style={[styles.optionLabel, isDisabled && styles.optionLabelDisabled]}>
										{option.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}
				</View>
			)}
		/>
	);
};

export default { RHFCheckbox, RHFMultiCheckbox, RHFRadioGroup };
