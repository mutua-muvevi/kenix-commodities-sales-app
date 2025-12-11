import React, { useEffect, useState, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ScrollView,
	useWindowDimensions,
	Dimensions,
	Platform
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useTheme } from "../../hooks";
import { useProducts, useCategories, useCart } from "../../store";
import type { Product } from "../../store/types/product";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = (screenWidth - 32) / 2; // 16px padding on each side
const IMAGE_HEIGHT = CARD_WIDTH * 0.9;

// Filter tab type
interface FilterTab {
	id: string;
	label: string;
}

const CategoryProductsScreen = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { theme, isDark } = useTheme();
	const { allProducts } = useProducts();
	const { getCategoryById } = useCategories();
	const { addItem } = useCart();

	const [selectedFilter, setSelectedFilter] = useState<string>("all");
	const [category, setCategory] = useState<any>(null);
	const [subcategories, setSubcategories] = useState<FilterTab[]>([]);

	// Load category details
	useEffect(() => {
		loadCategoryData();
	}, [id]);

	const loadCategoryData = async () => {
		if (!id) return;

		const categoryData = await getCategoryById(id);
		setCategory(categoryData);

		// Extract unique subcategories from products
		const categoryProducts = allProducts.products.filter(
			(product) => product.category === categoryData?.name
		);

		// Create filter tabs (All + unique brands as subcategories)
		const uniqueBrands = Array.from(
			new Set(categoryProducts.map((p) => p.brand).filter(Boolean))
		).map((brand) => ({
			id: brand!,
			label: brand!,
		}));

		setSubcategories([{ id: "all", label: "All" }, ...uniqueBrands]);
	};

	// Filter products by category and selected filter
	const filteredProducts = useMemo(() => {
		let products = allProducts.products.filter(
			(product) => product.category === category?.name
		);

		if (selectedFilter !== "all") {
			products = products.filter((product) => product.brand === selectedFilter);
		}

		return products;
	}, [allProducts.products, category, selectedFilter]);

	const handleBack = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.back();
	};

	const handleSearch = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		// Navigate to search screen
		router.push("/search");
	};

	const handleFilterPress = (filterId: string) => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		setSelectedFilter(filterId);
	};

	const handleProductPress = (productId: string) => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.push(`/products/${productId}`);
	};

	const handleAddToCart = (product: Product, e: any) => {
		e.stopPropagation();
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		addItem(product, 1);
		Toast.show({
			type: "success",
			text1: "Added to cart",
			text2: `${product.name} added successfully`,
			position: "bottom",
			visibilityTime: 2000,
		});
	};

	const renderFilterTab = ({ item }: { item: FilterTab }) => {
		const isSelected = selectedFilter === item.id;

		return (
			<TouchableOpacity
				onPress={() => handleFilterPress(item.id)}
				style={[
					styles.filterTab,
					isSelected ? styles.filterTabSelected : styles.filterTabOutline,
				]}
				activeOpacity={0.7}
				accessible={true}
				accessibilityRole="button"
				accessibilityLabel={`Filter by ${item.label}`}
				accessibilityState={{ selected: isSelected }}
			>
				<Text
					style={[
						styles.filterTabText,
						isSelected ? styles.filterTabTextSelected : styles.filterTabTextOutline,
					]}
				>
					{item.label}
				</Text>
			</TouchableOpacity>
		);
	};

	const renderProductCard = ({ item, index }: { item: Product; index: number }) => {
		const hasDiscount = item.wholePrice && item.wholePrice < item.unitPrice;

		return (
			<Animated.View
				entering={FadeInUp.delay(index * 50).springify()}
				style={styles.productCard}
			>
				<TouchableOpacity
					onPress={() => handleProductPress(item._id)}
					activeOpacity={0.9}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel={`${item.name}, ${item.unitPrice} KES`}
					accessibilityHint="Double tap to view product details"
				>
					<View style={styles.imageContainer}>
						{item.images && item.images.length > 0 ? (
							<Image
								source={{ uri: item.images[0] }}
								style={styles.productImage}
								contentFit="cover"
								transition={200}
								priority="normal"
								cachePolicy="memory-disk"
							/>
						) : (
							<View style={styles.imagePlaceholder}>
								<Ionicons
									name="cube-outline"
									size={40}
									color={theme.palette.grey[400]}
								/>
							</View>
						)}

						{/* Add Button - Positioned at bottom-right of image */}
						{item.inStock && (
							<TouchableOpacity
								style={styles.addButton}
								onPress={(e) => handleAddToCart(item, e)}
								activeOpacity={0.8}
								accessible={true}
								accessibilityRole="button"
								accessibilityLabel="Add to cart"
								accessibilityHint="Double tap to add item to cart"
							>
								<Ionicons name="add" size={20} color={theme.palette.common.white} />
							</TouchableOpacity>
						)}
					</View>

					<View style={styles.productInfo}>
						{/* Price */}
						<Text
							style={styles.price}
							accessible={true}
							accessibilityLabel={`${item.unitPrice} KES`}
						>
							{item.unitPrice.toFixed(2)} KES
						</Text>

						{/* Product Name */}
						<Text
							style={styles.productName}
							numberOfLines={2}
							accessible={true}
							accessibilityLabel={item.name}
						>
							{item.name}
						</Text>

						{/* Wholesale price if available */}
						{hasDiscount && (
							<Text style={styles.wholePriceText} numberOfLines={1}>
								Bulk: {item.wholePrice.toFixed(2)} KES
							</Text>
						)}
					</View>
				</TouchableOpacity>
			</Animated.View>
		);
	};

	const styles = StyleSheet.create({
		safeArea: {
			flex: 1,
			backgroundColor: theme.palette.background.default,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: theme.palette.background.paper,
			borderBottomWidth: 1,
			borderBottomColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[300],
		},
		backButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[200],
		},
		headerTitle: {
			flex: 1,
			marginHorizontal: 12,
		},
		categoryName: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 18,
		},
		searchButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[200],
		},
		filterContainer: {
			paddingVertical: 12,
			paddingHorizontal: 16,
			backgroundColor: theme.palette.background.paper,
			borderBottomWidth: 1,
			borderBottomColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[300],
		},
		filterScrollView: {
			flexGrow: 0,
		},
		filterTab: {
			paddingHorizontal: 16,
			paddingVertical: 8,
			borderRadius: 20,
			marginRight: 8,
			minWidth: 70,
			alignItems: "center",
		},
		filterTabSelected: {
			backgroundColor: isDark
				? theme.palette.grey[700]
				: theme.palette.grey[200],
		},
		filterTabOutline: {
			backgroundColor: "transparent",
			borderWidth: 1,
			borderColor: isDark
				? theme.palette.grey[700]
				: theme.palette.grey[300],
		},
		filterTabText: {
			fontSize: 14,
			fontWeight: "600",
		},
		filterTabTextSelected: {
			color: theme.palette.text.primary,
		},
		filterTabTextOutline: {
			color: theme.palette.text.secondary,
		},
		sectionHeader: {
			paddingHorizontal: 16,
			paddingTop: 16,
			paddingBottom: 12,
			backgroundColor: theme.palette.background.default,
		},
		sectionTitle: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 16,
		},
		productsCount: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 13,
			marginTop: 2,
		},
		productsList: {
			paddingHorizontal: 16,
			paddingTop: 8,
			paddingBottom: 24,
		},
		productCard: {
			width: CARD_WIDTH,
			backgroundColor: theme.palette.common.white,
			borderRadius: 8,
			marginBottom: 12,
			overflow: "hidden",
			elevation: 2,
			shadowColor: isDark ? "#000000" : theme.palette.grey[900],
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: isDark ? 0.2 : 0.06,
			shadowRadius: 4,
		},
		imageContainer: {
			width: "100%",
			height: IMAGE_HEIGHT,
			backgroundColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[100],
			position: "relative",
		},
		productImage: {
			width: "100%",
			height: "100%",
		},
		imagePlaceholder: {
			width: "100%",
			height: "100%",
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: isDark
				? theme.palette.grey[800]
				: theme.palette.grey[200],
		},
		addButton: {
			position: "absolute",
			bottom: 8,
			right: 8,
			width: 32,
			height: 32,
			borderRadius: 16,
			backgroundColor: theme.palette.primary.main,
			justifyContent: "center",
			alignItems: "center",
			elevation: 3,
			shadowColor: theme.palette.primary.main,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
		},
		productInfo: {
			padding: 8,
		},
		price: {
			...theme.typography.subtitle2,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 15,
			marginBottom: 4,
		},
		productName: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontSize: 13,
			lineHeight: 18,
			marginBottom: 4,
			height: 36,
		},
		wholePriceText: {
			...theme.typography.caption,
			color: theme.palette.success.dark,
			fontSize: 11,
			fontWeight: "600",
		},
		emptyState: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: 60,
		},
		emptyIcon: {
			marginBottom: 16,
			opacity: 0.3,
		},
		emptyText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
	});

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			{/* Header */}
			<Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
				<TouchableOpacity
					onPress={handleBack}
					style={styles.backButton}
					activeOpacity={0.7}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel="Go back"
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={theme.palette.text.primary}
					/>
				</TouchableOpacity>

				<View style={styles.headerTitle}>
					<Text style={styles.categoryName}>{category?.name || "Category"}</Text>
				</View>

				<TouchableOpacity
					onPress={handleSearch}
					style={styles.searchButton}
					activeOpacity={0.7}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel="Search"
				>
					<Ionicons
						name="search"
						size={22}
						color={theme.palette.text.primary}
					/>
				</TouchableOpacity>
			</Animated.View>

			{/* Filter Tabs */}
			{subcategories.length > 0 && (
				<Animated.View
					entering={FadeIn.delay(100).duration(300)}
					style={styles.filterContainer}
				>
					<FlatList
						data={subcategories}
						renderItem={renderFilterTab}
						keyExtractor={(item) => item.id}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.filterScrollView}
					/>
				</Animated.View>
			)}

			{/* Section Header */}
			<Animated.View
				entering={FadeIn.delay(200).duration(300)}
				style={styles.sectionHeader}
			>
				<Text style={styles.sectionTitle}>Most popular products</Text>
				<Text style={styles.productsCount}>
					{filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
				</Text>
			</Animated.View>

			{/* Products Grid */}
			{filteredProducts.length > 0 ? (
				<FlatList
					data={filteredProducts}
					renderItem={renderProductCard}
					keyExtractor={(item) => item._id}
					numColumns={2}
					columnWrapperStyle={{
						justifyContent: "space-between",
					}}
					contentContainerStyle={styles.productsList}
					showsVerticalScrollIndicator={false}
					accessible={true}
					accessibilityLabel="Products grid"
				/>
			) : (
				<View style={styles.emptyState}>
					<Ionicons
						name="cube-outline"
						size={64}
						color={theme.palette.text.secondary}
						style={styles.emptyIcon}
					/>
					<Text style={styles.emptyText}>No products found in this category</Text>
				</View>
			)}

			<Toast />
		</SafeAreaView>
	);
};

export default CategoryProductsScreen;
