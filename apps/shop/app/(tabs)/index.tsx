import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	RefreshControl,
	TouchableOpacity,
	useWindowDimensions,
	Pressable,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SafeArea, Container } from "../../components/layout";
import { SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product/ProductCard";
import { useTheme } from "../../hooks";
import { useProducts, useCategories, useCart } from "../../store";
import { Category } from "../../store/types/product";

const HomeScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { width } = useWindowDimensions();
	const { categories, fetchCategories } = useCategories();
	const { allProducts, fetchAllProducts } = useProducts();
	const { totalItems, totalPrice } = useCart();

	const [refreshing, setRefreshing] = useState(false);

	// Calculate compact category card size - 3 columns with minimal margins
	const categoryCardWidth = (width - 32) / 3 - 4; // 16px horizontal padding + 4px gaps

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			await Promise.all([fetchCategories(), fetchAllProducts({ limit: 12 })]);
		} catch (error) {
			console.error("Error loading data:", error);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		await loadInitialData();
		setRefreshing(false);
	};

	const handleCategoryPress = (category: Category) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		console.log("Category pressed:", category.name);
		// Navigate to category products
		router.push(`/category/${category._id}`);
	};

	const handleQuickAction = (action: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		console.log("Quick action:", action);
	};

	// Recommended quick actions - Wasoko style
	const quickActions = [
		{ id: "1", icon: "flash", label: "Deals", color: theme.palette.warning.main },
		{ id: "2", icon: "heart", label: "Favorites", color: theme.palette.error.main },
		{ id: "3", icon: "time", label: "Recent", color: theme.palette.info.main },
		{ id: "4", icon: "trophy", label: "Popular", color: theme.palette.success.main },
	];

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
		},
		// Clean search bar at top
		searchContainer: {
			paddingHorizontal: 12,
			paddingTop: 8,
			paddingBottom: 8,
			backgroundColor: theme.palette.background.default,
		},
		// Promotional banner - Wasoko style
		promoBanner: {
			marginHorizontal: 12,
			marginBottom: 12,
			borderRadius: 8,
			overflow: "hidden",
			height: 120,
		},
		promoGradient: {
			flex: 1,
			padding: 16,
			justifyContent: "center",
		},
		promoTitle: {
			...theme.typography.h5,
			color: theme.palette.common.white,
			fontWeight: "800",
			fontSize: 22,
			marginBottom: 4,
			letterSpacing: -0.5,
		},
		promoSubtitle: {
			...theme.typography.body2,
			color: "rgba(255,255,255,0.95)",
			fontSize: 14,
			fontWeight: "600",
		},
		promoStats: {
			flexDirection: "row",
			alignItems: "center",
			marginTop: 8,
			gap: 12,
		},
		promoStat: {
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
		},
		promoStatText: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.9)",
			fontSize: 12,
			fontWeight: "600",
		},
		// Section headers - minimal style
		sectionHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 12,
			marginTop: 8,
			marginBottom: 8,
		},
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 16,
			letterSpacing: -0.2,
		},
		viewAllButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 4,
			paddingHorizontal: 8,
		},
		viewAllText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
			fontSize: 13,
			marginRight: 2,
		},
		// Compact 3-column category grid
		categoriesGrid: {
			paddingHorizontal: 12,
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 6,
			marginBottom: 12,
		},
		categoryCard: {
			width: categoryCardWidth,
			alignItems: "center",
			backgroundColor: theme.palette.background.paper,
			borderRadius: 8,
			padding: 8,
			borderWidth: 1,
			borderColor:
				theme.palette.mode === "light"
					? theme.palette.grey[200]
					: "rgba(255,255,255,0.08)",
		},
		categoryCardPressed: {
			opacity: 0.7,
			transform: [{ scale: 0.97 }],
		},
		categoryImage: {
			width: categoryCardWidth - 16,
			height: categoryCardWidth - 16,
			borderRadius: 6,
			marginBottom: 6,
			backgroundColor: theme.palette.grey[100],
		},
		categoryName: {
			...theme.typography.caption,
			color: theme.palette.text.primary,
			fontWeight: "600",
			fontSize: 11,
			textAlign: "center",
			lineHeight: 14,
		},
		// Quick actions section
		quickActionsContainer: {
			paddingHorizontal: 12,
			marginBottom: 12,
		},
		quickActionsRow: {
			flexDirection: "row",
			gap: 8,
		},
		quickActionButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.palette.background.paper,
			borderRadius: 8,
			padding: 12,
			gap: 6,
			borderWidth: 1,
			borderColor:
				theme.palette.mode === "light"
					? theme.palette.grey[200]
					: "rgba(255,255,255,0.08)",
		},
		quickActionLabel: {
			...theme.typography.caption,
			color: theme.palette.text.primary,
			fontWeight: "600",
			fontSize: 12,
		},
		// Product grid
		productsContainer: {
			paddingHorizontal: 12,
			paddingBottom: 24,
		},
		productsGrid: {
			gap: 8,
		},
		productRow: {
			justifyContent: "space-between",
			gap: 8,
		},
		// Empty state
		emptyState: {
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 40,
		},
		emptyIcon: {
			marginBottom: 12,
			opacity: 0.3,
		},
		emptyText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
	});

	return (
		<SafeArea>
			<Container padding="none">
				<ScrollView
					style={styles.container}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={theme.palette.primary.main}
							colors={[theme.palette.primary.main, theme.palette.secondary.main]}
							progressBackgroundColor={theme.palette.background.paper}
						/>
					}
					bounces={true}
				>
					{/* Clean Search Bar */}
					<Animated.View
						entering={FadeInDown.duration(300)}
						style={styles.searchContainer}
					>
						<SearchBar placeholder="Search products, brands..." />
					</Animated.View>

					{/* Promotional Banner - Wasoko Style */}
					<Animated.View entering={FadeInDown.delay(100).duration(300)}>
						<View style={styles.promoBanner}>
							<LinearGradient
								colors={[
									theme.palette.secondary.main,
									theme.palette.secondary.dark,
									theme.palette.secondary.darker,
								]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.promoGradient}
							>
								<Text style={styles.promoTitle}>PATA MORE FOR LESS</Text>
								<Text style={styles.promoSubtitle}>
									Wholesale prices, retail convenience
								</Text>
								<View style={styles.promoStats}>
									<View style={styles.promoStat}>
										<Ionicons
											name="cart"
											size={14}
											color="rgba(255,255,255,0.9)"
										/>
										<Text style={styles.promoStatText}>
											{totalItems} {totalItems === 1 ? "item" : "items"}
										</Text>
									</View>
									<View style={styles.promoStat}>
										<Ionicons
											name="cash"
											size={14}
											color="rgba(255,255,255,0.9)"
										/>
										<Text style={styles.promoStatText}>
											KES {totalPrice.toLocaleString()}
										</Text>
									</View>
								</View>
							</LinearGradient>
						</View>
					</Animated.View>

					{/* Categories Section */}
					{categories.length > 0 && (
						<Animated.View entering={FadeInUp.delay(150).duration(300)}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Categories</Text>
								<TouchableOpacity
									style={styles.viewAllButton}
									onPress={() =>
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
									}
									activeOpacity={0.7}
								>
									<Text style={styles.viewAllText}>View All</Text>
									<Ionicons
										name="chevron-forward"
										size={14}
										color={theme.palette.primary.main}
									/>
								</TouchableOpacity>
							</View>

							{/* Compact 3-Column Grid */}
							<View style={styles.categoriesGrid}>
								{categories.slice(0, 9).map((category, index) => (
									<Pressable
										key={category._id}
										style={({ pressed }) => [
											styles.categoryCard,
											pressed && styles.categoryCardPressed,
										]}
										onPress={() => handleCategoryPress(category)}
										accessibilityRole="button"
										accessibilityLabel={`Browse ${category.name} category`}
										accessibilityHint="Tap to view products in this category"
									>
										<Image
											source={{ uri: category.image }}
											style={styles.categoryImage}
											contentFit="cover"
											transition={200}
											cachePolicy="memory-disk"
										/>
										<Text
											style={styles.categoryName}
											numberOfLines={2}
											ellipsizeMode="tail"
										>
											{category.name}
										</Text>
									</Pressable>
								))}
							</View>
						</Animated.View>
					)}

					{/* Recommended Buttons Section */}
					<Animated.View entering={FadeInUp.delay(200).duration(300)}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Recommended Actions</Text>
						</View>

						<View style={styles.quickActionsContainer}>
							<View style={styles.quickActionsRow}>
								{quickActions.map((action) => (
									<TouchableOpacity
										key={action.id}
										style={styles.quickActionButton}
										onPress={() => handleQuickAction(action.label)}
										activeOpacity={0.7}
										accessibilityRole="button"
										accessibilityLabel={action.label}
									>
										<Ionicons
											name={action.icon as any}
											size={16}
											color={action.color}
										/>
										<Text style={styles.quickActionLabel}>{action.label}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</Animated.View>

					{/* Recommended SKUs Section */}
					<Animated.View entering={FadeInUp.delay(250).duration(300)}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Recommended SKUs</Text>
							<TouchableOpacity
								style={styles.viewAllButton}
								onPress={() =>
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
								}
								activeOpacity={0.7}
							>
								<Text style={styles.viewAllText}>View All</Text>
								<Ionicons
									name="chevron-forward"
									size={14}
									color={theme.palette.primary.main}
								/>
							</TouchableOpacity>
						</View>

						<View style={styles.productsContainer}>
							{allProducts.products.length > 0 ? (
								<View style={styles.productsGrid}>
									{/* Render products in rows of 2 */}
									{Array.from({
										length: Math.ceil(allProducts.products.length / 2),
									}).map((_, rowIndex) => {
										const startIndex = rowIndex * 2;
										const rowProducts = allProducts.products.slice(
											startIndex,
											startIndex + 2
										);

										return (
											<View key={rowIndex} style={styles.productRow}>
												{rowProducts.map((product, index) => (
													<View
														key={product._id}
														style={{ flex: 1, maxWidth: "48.5%" }}
													>
														<ProductCard
															product={product}
															index={startIndex + index}
														/>
													</View>
												))}
												{/* Add spacer if odd number of products in last row */}
												{rowProducts.length === 1 && (
													<View style={{ flex: 1, maxWidth: "48.5%" }} />
												)}
											</View>
										);
									})}
								</View>
							) : (
								<View style={styles.emptyState}>
									<Ionicons
										name="cube-outline"
										size={48}
										color={theme.palette.text.secondary}
										style={styles.emptyIcon}
									/>
									<Text style={styles.emptyText}>
										No products available at the moment
									</Text>
								</View>
							)}
						</View>
					</Animated.View>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default HomeScreen;
