// components/form/RHFSelect.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ViewStyle } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface SelectOption {
	label: string;
	value: string | number;
	disabled?: boolean;
	icon?: string;
}

interface RHFSelectProps {
	name: string;
	label?: string;
	placeholder?: string;
	helperText?: string;
	options: SelectOption[];
	multiple?: boolean;
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
	searchable?: boolean;
	leftIcon?: string;
}

export const RHFSelect: React.FC<RHFSelectProps> = ({
	name,
	label,
	placeholder = "Select an option",
	helperText,
	options,
	multiple = false,
	disabled = false,
	style,
	required = false,
	searchable = false,
	leftIcon,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const scale = useSharedValue(1);

	const handlePress = () => {
		if (!disabled) {
			setIsOpen(true);
			scale.value = withSpring(1.02);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setSearchQuery("");
		scale.value = withSpring(1);
	};

	const handleSelect = (option: SelectOption, field: any) => {
		if (multiple) {
			const currentValues = field.value || [];
			const isSelected = currentValues.some((item: any) => item.value === option.value);

			if (isSelected) {
				field.onChange(currentValues.filter((item: any) => item.value !== option.value));
			} else {
				field.onChange([...currentValues, option]);
			}
		} else {
			field.onChange(option);
			handleClose();
		}
	};

	const getDisplayText = (value: any) => {
		if (!value) return placeholder;

		if (multiple) {
			if (!value.length) return placeholder;
			if (value.length === 1) return value[0].label;
			return `${value.length} items selected`;
		}

		return value.label || placeholder;
	};

	const filteredOptions = searchable
		? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
		: options;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

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
		selectContainer: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.palette.background.surface,
			borderWidth: 1,
			borderColor: theme.palette.grey[300],
			borderRadius: theme.borderRadius.sm,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			minHeight: 44,
		},
		selectContainerError: {
			borderColor: theme.palette.error.main,
		},
		selectContainerDisabled: {
			backgroundColor: theme.palette.grey[100],
			opacity: 0.6,
		},
		leftIconContainer: {
			marginRight: theme.spacing.xs,
		},
		selectText: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14,
		},
		placeholderText: {
			color: theme.palette.text.secondary,
		},
		rightIconContainer: {
			marginLeft: theme.spacing.xs,
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
		modal: {
			flex: 1,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			justifyContent: "center",
			padding: theme.spacing.md,
		},
		modalContent: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.md,
			maxHeight: "70%",
			...theme.shadows.z8,
		},
		modalHeader: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			padding: theme.spacing.md,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		modalTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
		},
		searchContainer: {
			padding: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		searchInput: {
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.sm,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			...theme.typography.body1,
			color: theme.palette.text.primary,
		},
		optionsList: {
			maxHeight: 300,
		},
		optionItem: {
			flexDirection: "row",
			alignItems: "center",
			padding: theme.spacing.md,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		optionItemDisabled: {
			opacity: 0.5,
		},
		optionIcon: {
			marginRight: theme.spacing.sm,
		},
		optionText: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
		},
		selectedIndicator: {
			marginLeft: theme.spacing.sm,
		},
		multipleActions: {
			flexDirection: "row",
			justifyContent: "space-between",
			padding: theme.spacing.md,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		clearButton: {
			padding: theme.spacing.sm,
		},
		doneButton: {
			backgroundColor: theme.palette.primary.main,
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.sm,
		},
		doneButtonText: {
			color: theme.palette.primary.contrastText,
			fontWeight: "600",
		},
	});

	const renderOption = ({ item }: { item: SelectOption }) => (
		<TouchableOpacity
			style={[styles.optionItem, item.disabled && styles.optionItemDisabled]}
			onPress={() => !item.disabled && handleSelect(item, field)}
			disabled={item.disabled}
		>
			{item.icon && (
				<Ionicons
					name={item.icon as any}
					size={20}
					color={theme.palette.primary.main}
					style={styles.optionIcon}
				/>
			)}
			<Text style={styles.optionText}>{item.label}</Text>
			{/* Selection indicator logic would go here based on field value */}
		</TouchableOpacity>
	);

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

					<TouchableOpacity
						style={[
							styles.selectContainer,
							error && styles.selectContainerError,
							disabled && styles.selectContainerDisabled,
						]}
						onPress={handlePress}
						disabled={disabled}
					>
						{leftIcon && (
							<View style={styles.leftIconContainer}>
								<Ionicons name={leftIcon as any} size={20} color={theme.palette.text.secondary} />
							</View>
						)}

						<Text style={[styles.selectText, !field.value && styles.placeholderText]} numberOfLines={1}>
							{getDisplayText(field.value)}
						</Text>

						<View style={styles.rightIconContainer}>
							<Ionicons
								name={isOpen ? "chevron-up" : "chevron-down"}
								size={20}
								color={theme.palette.text.secondary}
							/>
						</View>
					</TouchableOpacity>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}

					<Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
						<TouchableOpacity style={styles.modal} onPress={handleClose}>
							<View style={styles.modalContent}>
								<View style={styles.modalHeader}>
									<Text style={styles.modalTitle}>{label || "Select Option"}</Text>
									<TouchableOpacity onPress={handleClose}>
										<Ionicons name="close" size={24} color={theme.palette.text.secondary} />
									</TouchableOpacity>
								</View>

								{searchable && (
									<View style={styles.searchContainer}>
										<TextInput
											style={styles.searchInput}
											placeholder="Search options..."
											value={searchQuery}
											onChangeText={setSearchQuery}
											placeholderTextColor={theme.palette.text.secondary}
										/>
									</View>
								)}

								<FlatList
									data={filteredOptions}
									renderItem={renderOption}
									keyExtractor={(item) => item.value.toString()}
									style={styles.optionsList}
								/>

								{multiple && (
									<View style={styles.multipleActions}>
										<TouchableOpacity style={styles.clearButton} onPress={() => field.onChange([])}>
											<Text>Clear All</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.doneButton} onPress={handleClose}>
											<Text style={styles.doneButtonText}>Done</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						</TouchableOpacity>
					</Modal>
				</Animated.View>
			)}
		/>
	);
};

export default RHFSelect;
