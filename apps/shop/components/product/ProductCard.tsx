// components/product/ProductCard.tsx - Updated with smaller spacing and items
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, FlatList, RefreshControl, Dimensions } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeArea, Container } from "../../components/layout";
import { SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product";
import { useTheme } from "../../hooks";
import { useProducts, useCategories, useAuth, useCart } from "../../store";

const { width: screenWidth } = Dimensions.get("window");

const HomeScreen = () => {
	const { theme } = useTheme();
	const user = null;
	const totalItems = 0;
	const totalPrice = 0;
	const categories = [];
	const allProducts = { products: [] };
	const isLoadingProducts = false;
	const { fetchCategories } = useCategories();
	const { fetchAllProducts } = useProducts();

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			await Promise.all([fetchCategories(), fetchAllProducts({ limit: 16 })]); // More items
			console.log("Loading initial data...");
		} catch (error) {
			console.error("Error loading data:", error);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadInitialData();
		setRefreshing(false);
	};

	const styles = StyleSheet.create({
		header: {
			paddingTop: theme.spacing.md, // Reduced from lg
		},
		welcomeCard: {
			marginBottom: theme.spacing.md, // Reduced from lg
			overflow: "hidden",
			marginHorizontal: theme.spacing.sm,
		},
		gradientHeader: {
			padding: theme.spacing.lg, // Reduced from xl
			borderRadius: theme.borderRadius.lg,
		},
		welcomeText: {
			...theme.typography.h3, // Smaller than h2
			color: theme.palette.common.white,
			fontWeight: "700",
			marginBottom: theme.spacing.xs / 2, // Much tighter
		},
		subtitle: {
			...theme.typography.body2, // Smaller than body1
			color: "rgba(255,255,255,0.9)",
			marginBottom: theme.spacing.md, // Reduced from lg
		},
		statsContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: theme.spacing.sm, // Reduced from md
		},
		statItem: {
			backgroundColor: "rgba(255,255,255,0.2)",
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.sm, // Reduced from md
			flex: 1,
			marginHorizontal: 2, // Much tighter
		},
		statValue: {
			...theme.typography.subtitle1, // Smaller than h6
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		statLabel: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.8)",
			fontSize: 10, // Smaller
		},
		sectionTitle: {
			...theme.typography.h5, // Smaller than h4
			color: theme.palette.text.primary,
			marginVertical: theme.spacing.md, // Reduced from lg
			marginHorizontal: theme.spacing.sm, // Reduced from md
			fontWeight: "700",
		},
		categoriesContainer: {
			paddingHorizontal: theme.spacing.sm, // Reduced from md
		},
		categoryItem: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg, // Reduced from xl
			padding: theme.spacing.md, // Reduced from lg
			marginRight: theme.spacing.sm, // Reduced from md
			alignItems: "center",
			minWidth: 70, // Reduced from 80
			...theme.shadows.z4,
		},
		categoryIcon: {
			fontSize: 28, // Reduced from 32
			marginBottom: theme.spacing.xs, // Reduced from sm
		},
		categoryName: {
			...theme.typography.caption,
			color: theme.palette.text.primary,
			textAlign: "center",
			fontWeight: "600",
			fontSize: 10, // Smaller
		},
		productsGrid: {
			paddingHorizontal: theme.spacing.sm, // Reduced from md
		},
		searchContainer: {
			paddingHorizontal: theme.spacing.sm,
			marginBottom: theme.spacing.sm,
		},
	});

	return (
		<SafeArea>
			<Container padding="compact">
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				>
					<View style={styles.header}>
						<Animated.View entering={FadeInDown.springify()} style={styles.welcomeCard}>
							<LinearGradient
								colors={[theme.palette.primary.main, theme.palette.primary.dark]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.gradientHeader}
							>
								<Text style={styles.welcomeText}>Welcome{user ? `, ${user.name}` : ""}!</Text>
								<Text style={styles.subtitle}>Find fresh groceries at the best prices</Text>

								<View style={styles.statsContainer}>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>{totalItems}</Text>
										<Text style={styles.statLabel}>Cart Items</Text>
									</View>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>KES {totalPrice}</Text>
										<Text style={styles.statLabel}>Total</Text>
									</View>
									<View style={styles.statItem}>
										<Text style={styles.statValue}>{categories.length}</Text>
										<Text style={styles.statLabel}>Categories</Text>
									</View>
								</View>
							</LinearGradient>
						</Animated.View>
					</View>

					{/* Search Bar */}
					<View style={styles.searchContainer}>
						<SearchBar placeholder="Search products..." />
					</View>

					{/* Categories */}
					{categories.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>Categories</Text>
							<FlatList
								data={categories}
								renderItem={({ item, index }) => (
									<Animated.View entering={FadeInRight.delay(index * 100).springify()}>
										<View style={styles.categoryItem}>
											<Text style={styles.categoryIcon}>{item.icon || "📦"}</Text>
											<Text style={styles.categoryName}>{item.name}</Text>
										</View>
									</Animated.View>
								)}
								keyExtractor={(item) => item._id}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.categoriesContainer}
							/>
						</>
					)}

					{/* Products */}
					<Text style={styles.sectionTitle}>Featured Products</Text>
					<FlatList
						data={allProducts.products}
						renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
						keyExtractor={(item) => item._id}
						numColumns={2}
						scrollEnabled={false}
						contentContainerStyle={styles.productsGrid}
						columnWrapperStyle={{ justifyContent: "space-between" }}
					/>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default HomeScreen;
