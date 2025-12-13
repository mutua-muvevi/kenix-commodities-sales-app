// components/form/RHFRangeSlider.tsx
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, PanGestureHandler, ViewStyle } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import Animated, {
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	runOnJS,
	interpolate,
	Extrapolate,
} from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";
import { TouchableOpacity } from "react-native";

interface RHFRangeSliderProps {
	name: string;
	label?: string;
	helperText?: string;
	min?: number;
	max?: number;
	step?: number;
	range?: boolean; // Single value or range
	showValue?: boolean;
	prefix?: string;
	suffix?: string;
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
	formatValue?: (value: number) => string;
}

export const RHFRangeSlider: React.FC<RHFRangeSliderProps> = ({
	name,
	label,
	helperText,
	min = 0,
	max = 100,
	step = 1,
	range = false,
	showValue = true,
	prefix = "",
	suffix = "",
	disabled = false,
	style,
	required = false,
	formatValue,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();

	const sliderWidth = useRef(0);
	const [sliderSize, setSliderSize] = useState({ width: 0, height: 0 });

	const leftThumbPosition = useSharedValue(0);
	const rightThumbPosition = useSharedValue(0);

	const getValueFromPosition = (position: number): number => {
		const percentage = position / sliderSize.width;
		const value = min + percentage * (max - min);
		return Math.round(value / step) * step;
	};

	const getPositionFromValue = (value: number): number => {
		const percentage = (value - min) / (max - min);
		return percentage * sliderSize.width;
	};

	const formatDisplayValue = (value: number): string => {
		if (formatValue) return formatValue(value);
		return `${prefix}${value}${suffix}`;
	};

	const updateFieldValue = (leftValue: number, rightValue?: number) => {
		if (range) {
			return [Math.min(leftValue, rightValue || leftValue), Math.max(leftValue, rightValue || leftValue)];
		}
		return leftValue;
	};

	const leftGestureHandler = useAnimatedGestureHandler({
		onStart: () => {},
		onActive: (event) => {
			const newPosition = Math.max(0, Math.min(event.x, sliderSize.width));
			leftThumbPosition.value = newPosition;

			const value = getValueFromPosition(newPosition);
			const rightValue = range ? getValueFromPosition(rightThumbPosition.value) : undefined;

			runOnJS((field: any) => {
				field.onChange(updateFieldValue(value, rightValue));
			});
		},
	});

	const rightGestureHandler = useAnimatedGestureHandler({
		onStart: () => {},
		onActive: (event) => {
			const newPosition = Math.max(0, Math.min(event.x, sliderSize.width));
			rightThumbPosition.value = newPosition;

			const leftValue = getValueFromPosition(leftThumbPosition.value);
			const rightValue = getValueFromPosition(newPosition);

			runOnJS((field: any) => {
				field.onChange(updateFieldValue(leftValue, rightValue));
			});
		},
	});

	const leftThumbStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: leftThumbPosition.value - 12 }],
	}));

	const rightThumbStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: rightThumbPosition.value - 12 }],
	}));

	const trackFillStyle = useAnimatedStyle(() => {
		if (range) {
			const left = Math.min(leftThumbPosition.value, rightThumbPosition.value);
			const width = Math.abs(rightThumbPosition.value - leftThumbPosition.value);
			return {
				left,
				width,
			};
		}
		return {
			left: 0,
			width: leftThumbPosition.value,
		};
	});

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.md,
		},
		labelContainer: {
			flexDirection: "row",
			marginBottom: theme.spacing.sm,
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
		sliderContainer: {
			paddingVertical: theme.spacing.md,
		},
		trackContainer: {
			height: 4,
			backgroundColor: theme.palette.grey[300],
			borderRadius: 2,
			position: "relative",
		},
		trackFill: {
			height: 4,
			backgroundColor: theme.palette.primary.main,
			borderRadius: 2,
			position: "absolute",
		},
		thumb: {
			width: 24,
			height: 24,
			borderRadius: 12,
			backgroundColor: theme.palette.primary.main,
			position: "absolute",
			top: -10,
			...theme.shadows.z4,
		},
		thumbDisabled: {
			backgroundColor: theme.palette.grey[400],
		},
		valuesContainer: {
			flexDirection: "row",
			justifyContent: range ? "space-between" : "flex-end",
			marginTop: theme.spacing.sm,
		},
		valueText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
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
		minMaxContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: theme.spacing.xs,
		},
		minMaxText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 10,
		},
	});

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => {
				// Initialize positions based on field value
				React.useEffect(() => {
					if (sliderSize.width > 0) {
						if (range && Array.isArray(field.value)) {
							leftThumbPosition.value = getPositionFromValue(field.value[0] || min);
							rightThumbPosition.value = getPositionFromValue(field.value[1] || max);
						} else {
							leftThumbPosition.value = getPositionFromValue(field.value || min);
						}
					}
				}, [field.value, sliderSize.width]);

				const currentValue = field.value || (range ? [min, max] : min);
				const leftValue = range ? currentValue[0] : currentValue;
				const rightValue = range ? currentValue[1] : undefined;

				return (
					<View style={[styles.container, style]}>
						{label && (
							<View style={styles.labelContainer}>
								<Text style={styles.label}>{label}</Text>
								{required && <Text style={styles.required}>*</Text>}
							</View>
						)}

						<View style={styles.sliderContainer}>
							<View
								style={styles.trackContainer}
								onLayout={(event) => {
									const { width, height } = event.nativeEvent.layout;
									setSliderSize({ width, height });
								}}
							>
								<Animated.View style={[styles.trackFill, trackFillStyle]} />

								{/* Left/Single Thumb */}
								<PanGestureHandler onGestureEvent={leftGestureHandler} enabled={!disabled}>
									<Animated.View
										style={[styles.thumb, leftThumbStyle, disabled && styles.thumbDisabled]}
									/>
								</PanGestureHandler>

								{/* Right Thumb (only for range) */}
								{range && (
									<PanGestureHandler onGestureEvent={rightGestureHandler} enabled={!disabled}>
										<Animated.View
											style={[styles.thumb, rightThumbStyle, disabled && styles.thumbDisabled]}
										/>
									</PanGestureHandler>
								)}
							</View>

							{/* Min/Max Labels */}
							<View style={styles.minMaxContainer}>
								<Text style={styles.minMaxText}>{formatDisplayValue(min)}</Text>
								<Text style={styles.minMaxText}>{formatDisplayValue(max)}</Text>
							</View>
						</View>

						{/* Current Values */}
						{showValue && (
							<View style={styles.valuesContainer}>
								{range ? (
									<>
										<Text style={styles.valueText}>{formatDisplayValue(leftValue)}</Text>
										<Text style={styles.valueText}>{formatDisplayValue(rightValue!)}</Text>
									</>
								) : (
									<Text style={styles.valueText}>{formatDisplayValue(leftValue)}</Text>
								)}
							</View>
						)}

						{(error || helperText) && (
							<Text style={[styles.helperText, error && styles.errorText]}>
								{error ? error.message : helperText}
							</Text>
						)}
					</View>
				);
			}}
		/>
	);
};

// Switch Component
interface RHFSwitchProps {
	name: string;
	label?: string;
	helperText?: string;
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
}

export const RHFSwitch: React.FC<RHFSwitchProps> = ({
	name,
	label,
	helperText,
	disabled = false,
	style,
	required = false,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();
	const switchAnimation = useSharedValue(0);

	const handleToggle = (field: any) => {
		if (!disabled) {
			const newValue = !field.value;
			field.onChange(newValue);
			switchAnimation.value = newValue ? 1 : 0;
		}
	};

	const trackStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolate(
			switchAnimation.value,
			[0, 1],
			[theme.palette.grey[300], theme.palette.primary.main],
			Extrapolate.CLAMP,
		),
	}));

	const thumbStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(switchAnimation.value, [0, 1], [2, 22], Extrapolate.CLAMP),
			},
		],
	}));

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
		},
		switchContainer: {
			flexDirection: "row",
			alignItems: "center",
		},
		labelContainer: {
			flex: 1,
			marginRight: theme.spacing.md,
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
		track: {
			width: 44,
			height: 24,
			borderRadius: 12,
			padding: 2,
		},
		trackDisabled: {
			opacity: 0.6,
		},
		thumb: {
			width: 20,
			height: 20,
			borderRadius: 10,
			backgroundColor: theme.palette.common.white,
			...theme.shadows.z2,
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
			render={({ field, fieldState: { error } }) => {
				// Update animation when field value changes
				React.useEffect(() => {
					switchAnimation.value = field.value ? 1 : 0;
				}, [field.value]);

				return (
					<View style={[styles.container, style]}>
						<TouchableOpacity
							style={styles.switchContainer}
							onPress={() => handleToggle(field)}
							disabled={disabled}
							activeOpacity={0.7}
						>
							<View style={styles.labelContainer}>
								{label && (
									<View style={{ flexDirection: "row" }}>
										<Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
										{required && <Text style={styles.required}>*</Text>}
									</View>
								)}
							</View>

							<Animated.View style={[styles.track, trackStyle, disabled && styles.trackDisabled]}>
								<Animated.View style={[styles.thumb, thumbStyle]} />
							</Animated.View>
						</TouchableOpacity>

						{(error || helperText) && (
							<Text style={[styles.helperText, error && styles.errorText]}>
								{error ? error.message : helperText}
							</Text>
						)}
					</View>
				);
			}}
		/>
	);
};

export default { RHFRangeSlider, RHFSwitch };
