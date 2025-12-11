import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import Animated, {
	FadeInDown,
	FadeInUp,
	FadeIn,
	withSpring,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SafeArea, Container } from "../../components/layout";
import { SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product/ProductCard";
import { CategorySlider } from "../../components/category/CategorySlider";
import { useTheme } from "../../hooks";
import { useProducts, useCategories, useAuth, useCart } from "../../store";
import { Category } from "../../store/types/product";

const HomeScreen = () => {
	const { theme } = useTheme();
	const user = null;
	const totalItems = 0;
	const totalPrice = 0;
	const { categories, fetchCategories } = useCategories();
	const { allProducts, fetchAllProducts } = useProducts();

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			await Promise.all([fetchCategories(), fetchAllProducts({ limit: 16 })]);
			console.log("Loading initial data...");
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
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		header: {
			paddingTop: theme.spacing.lg,
			paddingBottom: theme.spacing.sm,
		},
		welcomeCard: {
			marginHorizontal: theme.spacing.lg,
			marginBottom: theme.spacing.xl,
			overflow: "hidden",
			borderRadius: theme.borderRadius.xl,
			...theme.shadows.z8,
		},
		gradientHeader: {
			padding: theme.spacing.xl,
			paddingVertical: theme.spacing.xxl,
		},
		welcomeTextRow: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.xs,
		},
		welcomeIcon: {
			marginRight: theme.spacing.sm,
		},
		welcomeText: {
			...theme.typography.h3,
			color: theme.palette.common.white,
			fontWeight: "700",
			fontSize: 28,
			letterSpacing: -0.5,
		},
		subtitle: {
			...theme.typography.body1,
			color: "rgba(255,255,255,0.95)",
			marginBottom: theme.spacing.lg,
			fontSize: 15,
			lineHeight: 22,
		},
		statsContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: theme.spacing.md,
			gap: theme.spacing.sm,
		},
		statItem: {
			backgroundColor: "rgba(255,255,255,0.25)",
			borderRadius: theme.borderRadius.lg,
			padding: theme.spacing.md,
			paddingVertical: theme.spacing.lg,
			flex: 1,
			alignItems: "center",
			borderWidth: 1,
			borderColor: "rgba(255,255,255,0.15)",
		},
		statValue: {
			...theme.typography.h5,
			color: theme.palette.common.white,
			fontWeight: "800",
			fontSize: 20,
			marginBottom: theme.spacing.xs / 2,
		},
		statLabel: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.85)",
			fontSize: 11,
			fontWeight: "600",
			textTransform: "uppercase",
			letterSpacing: 0.5,
		},
		sectionHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: theme.spacing.xl,
			marginBottom: theme.spacing.md,
			marginHorizontal: theme.spacing.lg,
		},
		sectionTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 20,
			letterSpacing: -0.3,
		},
		viewAllButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.xs,
			paddingHorizontal: theme.spacing.sm,
		},
		viewAllText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
			marginRight: theme.spacing.xs / 2,
		},
		searchContainer: {
			paddingHorizontal: theme.spacing.lg,
			marginBottom: theme.spacing.md,
		},
		productsGrid: {
			paddingHorizontal: theme.spacing.lg,
			paddingBottom: theme.spacing.xxl,
		},
		emptyState: {
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.xxl * 2,
		},
		emptyIcon: {
			marginBottom: theme.spacing.lg,
			opacity: 0.3,
		},
		emptyText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
	});

	return (
		<SafeArea>
			<Container padding="compact">
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
					{/* Premium Welcome Card */}
					<View style={styles.header}>
						<Animated.View
							entering={FadeInDown.duration(400).springify().damping(15)}
							style={styles.welcomeCard}
						>
							<LinearGradient
								colors={[
									theme.palette.primary.main,
									theme.palette.primary.dark,
									theme.palette.primary.darker
								]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.gradientHeader}
							>
								{/* Welcome Text with Icon */}
								<Animated.View
									entering={FadeIn.delay(200).duration(300)}
									style={styles.welcomeTextRow}
								>
									<Ionicons
										name="sparkles"
										size={24}
										color="rgba(255,255,255,0.9)"
										style={styles.welcomeIcon}
									/>
									<Text style={styles.welcomeText}>
										Welcome{user ? `, ${user.name}` : ""}!
									</Text>
								</Animated.View>

								{/* Subtitle */}
								<Animated.Text
									entering={FadeIn.delay(300).duration(300)}
									style={styles.subtitle}
								>
									Find quality products at wholesale prices
								</Animated.Text>

								{/* Stats Cards */}
								<Animated.View
									entering={FadeInUp.delay(400).duration(300).springify()}
									style={styles.statsContainer}
								>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>{totalItems}</Text>
										<Text style={styles.statLabel}>Cart Items</Text>
									</View>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>
											{totalPrice > 0 ? `${totalPrice.toLocaleString()}` : "0"}
										</Text>
										<Text style={styles.statLabel}>KES Total</Text>
									</View>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>{categories.length}</Text>
										<Text style={styles.statLabel}>Categories</Text>
									</View>
								</Animated.View>
							</LinearGradient>
						</Animated.View>
					</View>

					{/* Search Bar */}
					<Animated.View
						entering={FadeInDown.delay(200).duration(300)}
						style={styles.searchContainer}
					>
						<SearchBar placeholder="Search products, brands..." />
					</Animated.View>

					{/* Categories Section */}
					{categories.length > 0 && (
						<Animated.View entering={FadeInUp.delay(300).duration(300)}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Shop by Category</Text>
								<TouchableOpacity
									style={styles.viewAllButton}
									onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
									activeOpacity={0.7}
								>
									<Text style={styles.viewAllText}>View All</Text>
									<Ionicons
										name="chevron-forward"
										size={16}
										color={theme.palette.primary.main}
									/>
								</TouchableOpacity>
							</View>
							<CategorySlider categories={categories} onCategoryPress={handleCategoryPress} />
						</Animated.View>
					)}

					{/* Featured Products Section */}
					<Animated.View entering={FadeInUp.delay(400).duration(300)}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Featured Products</Text>
							<TouchableOpacity
								style={styles.viewAllButton}
								onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
								activeOpacity={0.7}
							>
								<Text style={styles.viewAllText}>View All</Text>
								<Ionicons
									name="chevron-forward"
									size={16}
									color={theme.palette.primary.main}
								/>
							</TouchableOpacity>
						</View>

						{allProducts.products.length > 0 ? (
							<FlatList
								data={allProducts.products}
								renderItem={({ item, index }) => (
									<ProductCard product={item} index={index} />
								)}
								keyExtractor={(item) => item._id}
								numColumns={2}
								scrollEnabled={false}
								contentContainerStyle={styles.productsGrid}
								columnWrapperStyle={{
									justifyContent: "space-between",
									gap: theme.spacing.md,
								}}
							/>
						) : (
							<View style={styles.emptyState}>
								<Ionicons
									name="cube-outline"
									size={64}
									color={theme.palette.text.secondary}
									style={styles.emptyIcon}
								/>
								<Text style={styles.emptyText}>
									No products available at the moment
								</Text>
							</View>
						)}
					</Animated.View>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default HomeScreen;
