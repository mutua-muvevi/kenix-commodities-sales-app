// components/form/RHFSearchField.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	ViewStyle,
	ActivityIndicator,
} from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";
import { useDebounce } from "../../hooks";

interface SearchResult {
	id: string | number;
	label: string;
	subtitle?: string;
	icon?: string;
	image?: string;
	data?: any; // Additional data for the result
}

interface RHFSearchFieldProps {
	name: string;
	label?: string;
	placeholder?: string;
	helperText?: string;
	// Search configuration
	searchFunction?: (query: string) => Promise<SearchResult[]>;
	localData?: SearchResult[];
	searchKeys?: string[]; // Keys to search in local data
	minSearchLength?: number;
	debounceMs?: number;
	maxResults?: number;
	// Behavior
	allowCustomValue?: boolean; // Allow typing custom values not in results
	selectOnFocus?: boolean; // Select all text on focus
	clearOnSelect?: boolean; // Clear input after selection
	// Styling
	style?: ViewStyle;
	disabled?: boolean;
	required?: boolean;
	// Icons
	leftIcon?: string;
	searchIcon?: string;
	clearIcon?: string;
	// Result rendering
	renderResult?: (item: SearchResult, onSelect: () => void) => React.ReactElement;
	onResultSelect?: (result: SearchResult) => void;
	// Loading states
	showLoadingIndicator?: boolean;
	loadingText?: string;
	noResultsText?: string;
}

export const RHFSearchField: React.FC<RHFSearchFieldProps> = ({
	name,
	label,
	placeholder = "Search...",
	helperText,
	searchFunction,
	localData = [],
	searchKeys = ["label", "subtitle"],
	minSearchLength = 1,
	debounceMs = 300,
	maxResults = 10,
	allowCustomValue = true,
	selectOnFocus = false,
	clearOnSelect = false,
	style,
	disabled = false,
	required = false,
	leftIcon = "search",
	searchIcon = "search",
	clearIcon = "close-circle",
	renderResult,
	onResultSelect,
	showLoadingIndicator = true,
	loadingText = "Searching...",
	noResultsText = "No results found",
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();

	const [isFocused, setIsFocused] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const scale = useSharedValue(1);
	const debouncedQuery = useDebounce(inputValue, debounceMs);

	// Local search function for array data
	const searchLocalData = useCallback(
		(query: string): SearchResult[] => {
			if (!query || query.length < minSearchLength) return [];

			const filtered = localData.filter((item) =>
				searchKeys.some((key) =>
					item[key as keyof SearchResult]?.toString().toLowerCase().includes(query.toLowerCase()),
				),
			);

			return filtered.slice(0, maxResults);
		},
		[localData, searchKeys, minSearchLength, maxResults],
	);

	// Handle search when debounced query changes
	useEffect(() => {
		const performSearch = async () => {
			if (!debouncedQuery || debouncedQuery.length < minSearchLength) {
				setSearchResults([]);
				setIsLoading(false);
				setShowResults(false);
				return;
			}

			setIsLoading(true);
			setShowResults(true);

			try {
				let results: SearchResult[] = [];

				if (searchFunction) {
					// Use custom search function
					results = await searchFunction(debouncedQuery);
				} else {
					// Use local data search
					results = searchLocalData(debouncedQuery);
				}

				setSearchResults(results.slice(0, maxResults));
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		performSearch();
	}, [debouncedQuery, searchFunction, searchLocalData, minSearchLength, maxResults]);

	const handleFocus = () => {
		setIsFocused(true);
		scale.value = withSpring(1.02);
		if (selectOnFocus && inputValue) {
			// Note: TextInput selection would be handled in the ref
		}
	};

	const handleBlur = () => {
		setIsFocused(false);
		scale.value = withSpring(1);
		// Delay hiding results to allow for selection
		setTimeout(() => setShowResults(false), 150);
	};

	const handleClear = (field: any) => {
		setInputValue("");
		field.onChange("");
		setSearchResults([]);
		setShowResults(false);
	};

	const handleResultSelect = (result: SearchResult, field: any) => {
		if (clearOnSelect) {
			setInputValue("");
			field.onChange("");
		} else {
			setInputValue(result.label);
			field.onChange(allowCustomValue ? result.label : result);
		}

		setShowResults(false);
		onResultSelect?.(result);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
			zIndex: 1000, // Ensure dropdown appears above other elements
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
			alignItems: "center",
			backgroundColor: theme.palette.background.surface,
			borderWidth: 1,
			borderColor: isFocused ? theme.palette.primary.main : theme.palette.grey[300],
			borderRadius: theme.borderRadius.sm,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			minHeight: 44,
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
		},
		input: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14,
			paddingVertical: 0,
		},
		rightContainer: {
			flexDirection: "row",
			alignItems: "center",
			marginLeft: theme.spacing.xs,
		},
		iconButton: {
			padding: theme.spacing.xs,
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
		resultsContainer: {
			position: "absolute",
			top: "100%",
			left: 0,
			right: 0,
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.sm,
			marginTop: theme.spacing.xs,
			maxHeight: 200,
			...theme.shadows.z8,
			zIndex: 1001,
		},
		loadingContainer: {
			flexDirection: "row",
			alignItems: "center",
			padding: theme.spacing.md,
		},
		loadingText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginLeft: theme.spacing.sm,
		},
		noResultsContainer: {
			padding: theme.spacing.md,
			alignItems: "center",
		},
		noResultsText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		resultItem: {
			flexDirection: "row",
			alignItems: "center",
			padding: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		resultItemLast: {
			borderBottomWidth: 0,
		},
		resultIcon: {
			marginRight: theme.spacing.sm,
		},
		resultImage: {
			width: 32,
			height: 32,
			borderRadius: theme.borderRadius.sm,
			marginRight: theme.spacing.sm,
		},
		resultContent: {
			flex: 1,
		},
		resultLabel: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontSize: 14,
		},
		resultSubtitle: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 11,
			marginTop: 2,
		},
	});

	const defaultRenderResult = (item: SearchResult, onSelect: () => void, index: number) => (
		<TouchableOpacity
			key={item.id}
			style={[styles.resultItem, index === searchResults.length - 1 && styles.resultItemLast]}
			onPress={onSelect}
		>
			{item.icon && (
				<Ionicons
					name={item.icon as any}
					size={20}
					color={theme.palette.primary.main}
					style={styles.resultIcon}
				/>
			)}
			{item.image && <Image source={{ uri: item.image }} style={styles.resultImage} resizeMode="cover" />}
			<View style={styles.resultContent}>
				<Text style={styles.resultLabel} numberOfLines={1}>
					{item.label}
				</Text>
				{item.subtitle && (
					<Text style={styles.resultSubtitle} numberOfLines={1}>
						{item.subtitle}
					</Text>
				)}
			</View>
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
							value={inputValue}
							onChangeText={(text) => {
								setInputValue(text);
								if (allowCustomValue) {
									field.onChange(text);
								}
							}}
							placeholder={placeholder}
							placeholderTextColor={theme.palette.text.secondary}
							style={styles.input}
							onFocus={handleFocus}
							onBlur={handleBlur}
							editable={!disabled}
							selectTextOnFocus={selectOnFocus}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						<View style={styles.rightContainer}>
							{isLoading && showLoadingIndicator && (
								<ActivityIndicator
									size="small"
									color={theme.palette.primary.main}
									style={styles.iconButton}
								/>
							)}

							{inputValue.length > 0 && !isLoading && (
								<TouchableOpacity
									style={styles.iconButton}
									onPress={() => handleClear(field)}
									disabled={disabled}
								>
									<Ionicons name={clearIcon as any} size={20} color={theme.palette.text.secondary} />
								</TouchableOpacity>
							)}
						</View>
					</View>

					{(error || helperText) && (
						<Text style={[styles.helperText, error && styles.errorText]}>
							{error ? error.message : helperText}
						</Text>
					)}

					{/* Search Results Dropdown */}
					{showResults && (
						<Animated.View
							entering={FadeIn.duration(200)}
							exiting={FadeOut.duration(150)}
							style={styles.resultsContainer}
						>
							{isLoading ? (
								<View style={styles.loadingContainer}>
									<ActivityIndicator size="small" color={theme.palette.primary.main} />
									<Text style={styles.loadingText}>{loadingText}</Text>
								</View>
							) : searchResults.length > 0 ? (
								<FlatList
									data={searchResults}
									keyExtractor={(item) => item.id.toString()}
									renderItem={({ item, index }) =>
										renderResult
											? renderResult(item, () => handleResultSelect(item, field))
											: defaultRenderResult(item, () => handleResultSelect(item, field), index)
									}
									keyboardShouldPersistTaps="handled"
									showsVerticalScrollIndicator={false}
								/>
							) : debouncedQuery.length >= minSearchLength ? (
								<View style={styles.noResultsContainer}>
									<Text style={styles.noResultsText}>{noResultsText}</Text>
								</View>
							) : null}
						</Animated.View>
					)}
				</Animated.View>
			)}
		/>
	);
};

export default RHFSearchField;
