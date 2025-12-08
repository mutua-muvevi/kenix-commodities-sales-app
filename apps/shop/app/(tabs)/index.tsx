import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, FlatList, RefreshControl } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeArea, Container } from "../../components/layout";
import { SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product";
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
		await loadInitialData();
		setRefreshing(false);
	};

	const handleCategoryPress = (category: Category) => {
		console.log("Category pressed:", category.name);
		// Navigate to category products
	};

	const styles = StyleSheet.create({
		header: {
			paddingTop: theme.spacing.md,
		},
		welcomeCard: {
			marginBottom: theme.spacing.md,
			overflow: "hidden",
			marginHorizontal: theme.spacing.sm,
		},
		gradientHeader: {
			padding: theme.spacing.lg,
			borderRadius: theme.borderRadius.lg,
		},
		welcomeText: {
			...theme.typography.h3,
			color: theme.palette.common.white,
			fontWeight: "700",
			marginBottom: theme.spacing.xs / 2,
		},
		subtitle: {
			...theme.typography.body2,
			color: "rgba(255,255,255,0.9)",
			marginBottom: theme.spacing.md,
		},
		statsContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: theme.spacing.sm,
		},
		statItem: {
			backgroundColor: "rgba(255,255,255,0.2)",
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.sm,
			flex: 1,
			marginHorizontal: 2,
		},
		statValue: {
			...theme.typography.subtitle1,
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		statLabel: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.8)",
			fontSize: 10,
		},
		sectionTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginVertical: theme.spacing.md,
			marginHorizontal: theme.spacing.sm,
			fontWeight: "700",
		},
		searchContainer: {
			paddingHorizontal: theme.spacing.sm,
			marginBottom: theme.spacing.sm,
		},
		productsGrid: {
			paddingHorizontal: theme.spacing.sm,
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
							<CategorySlider categories={categories} onCategoryPress={handleCategoryPress} />
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
