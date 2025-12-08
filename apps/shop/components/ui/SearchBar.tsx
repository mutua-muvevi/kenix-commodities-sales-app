// components/ui/SearchBar.tsx - Updated with Material Design two-toned icons
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface SearchBarProps {
	value?: string;
	onChangeText?: (text: string) => void;
	placeholder?: string;
	autoFocus?: boolean;
	style?: ViewStyle;
	onFocus?: () => void;
	onBlur?: () => void;
	onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	value = "",
	onChangeText,
	placeholder = "Search...",
	autoFocus = false,
	style,
	onFocus,
	onBlur,
	onClear,
}) => {
	const { theme } = useTheme();
	const [isFocused, setIsFocused] = useState(false);
	const scale = useSharedValue(1);

	const handleFocus = () => {
		setIsFocused(true);
		scale.value = withSpring(1.02);
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		scale.value = withSpring(1);
		onBlur?.();
	};

	const handleClear = () => {
		onChangeText?.("");
		onClear?.();
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const styles = StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.lg,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderWidth: 2,
			borderColor: isFocused ? theme.palette.primary.main : "transparent",
			...theme.shadows.z2,
		},
		searchIcon: {
			marginRight: theme.spacing.sm,
		},
		input: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 16,
		},
		clearButton: {
			padding: theme.spacing.xs,
			marginLeft: theme.spacing.sm,
		},
	});

	return (
		<Animated.View style={[animatedStyle, styles.container, style]}>
			<MaterialIcons
				name="search"
				size={22}
				color={isFocused ? theme.palette.primary.main : theme.palette.text.secondary}
				style={[
					styles.searchIcon,
					{ opacity: isFocused ? 1 : 0.7 }, // Two-tone effect
				]}
			/>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={theme.palette.text.secondary}
				style={styles.input}
				onFocus={handleFocus}
				onBlur={handleBlur}
				autoFocus={autoFocus}
				returnKeyType="search"
			/>
			{value.length > 0 && (
				<TouchableOpacity onPress={handleClear} style={styles.clearButton}>
					<MaterialIcons
						name="clear"
						size={20}
						color={theme.palette.text.secondary}
						style={{ opacity: 0.7 }} // Two-tone effect
					/>
				</TouchableOpacity>
			)}
		</Animated.View>
	);
};
