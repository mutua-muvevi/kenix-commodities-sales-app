// app/account/favorites.tsx - Favorites Screen
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useFavorites, useProductsStore, useCart } from "../../store";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with spacing

const FavoritesScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { favorites, removeFavorite } = useFavorites();
	const { getProductById } = useProductsStore();
	const { addItem } = useCart();

	const handleRemoveFavorite = (productId: string, productName: string) => {
		removeFavorite(productId);
		Toast.show({
			type: "success",
			text1: "Removed from Favorites",
			text2: `${productName} has been removed from your favorites`,
			position: "bottom",
		});
	};

	const handleAddToCart = (productId: string) => {
		const product = getProductById(productId);
		if (!product) return;

		if (!product.inStock) {
			Toast.show({
				type: "error",
				text1: "Out of Stock",
				text2: `${product.name} is currently out of stock`,
				position: "bottom",
			});
			return;
		}

		addItem({
			productId: product._id,
			name: product.name,
			unitPrice: product.unitPrice,
			unitOfMeasure: product.unitOfMeasure,
			quantity: 1,
			inStock: product.inStock,
		});

		Toast.show({
			type: "success",
			text1: "Added to Cart",
			text2: `${product.name} added to cart`,
			position: "bottom",
		});
	};

	const handleViewProduct = (productId: string) => {
		router.push(`/products/${productId}`);
	};

	const FavoriteCard = ({ item, index }: { item: any; index: number }) => {
		const product = getProductById(item.productId);
		if (!product) return null;

		return (
			<Animated.View entering={FadeInUp.delay(index * 50).springify()}>
				<Card style={styles.favoriteCard}>
					<TouchableOpacity
						activeOpacity={0.8}
						onPress={() => handleViewProduct(item.productId)}
						style={styles.cardContent}
					>
						{/* Product Image */}
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: item.image || "https://picsum.photos/200/200" }}
								style={styles.productImage}
							/>
							{!product.inStock && (
								<View style={styles.outOfStockBadge}>
									<Text style={styles.outOfStockText}>Out of Stock</Text>
								</View>
							)}
						</View>

						{/* Product Info */}
						<View style={styles.productInfo}>
							<Text style={styles.productName} numberOfLines={2}>
								{item.name}
							</Text>
							<Text style={styles.productPrice}>KES {item.unitPrice.toFixed(2)}</Text>
							{product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
						</View>

						{/* Actions */}
						<View style={styles.actions}>
							<TouchableOpacity
								style={styles.addToCartButton}
								onPress={(e) => {
									e.stopPropagation();
									handleAddToCart(item.productId);
								}}
								disabled={!product.inStock}
							>
								<Ionicons
									name="cart-outline"
									size={20}
									color={product.inStock ? theme.palette.primary.main : theme.palette.text.disabled}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.removeButton}
								onPress={(e) => {
									e.stopPropagation();
									handleRemoveFavorite(item.productId, item.name);
								}}
							>
								<Ionicons name="heart" size={20} color={theme.palette.error.main} />
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</Card>
			</Animated.View>
		);
	};

	const EmptyState = () => (
		<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
			<Text style={styles.emptyIcon}>💝</Text>
			<Text style={styles.emptyTitle}>No Favorites Yet</Text>
			<Text style={styles.emptyDescription}>
				Start adding products to your favorites to see them here. Tap the heart icon on any product to save it.
			</Text>
			<Button
				title="Browse Products"
				variant="gradient"
				onPress={() => router.push("/")}
				style={styles.browseButton}
			/>
		</Animated.View>
	);

	const styles = StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		backButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.background.surface,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.md,
		},
		headerTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			flex: 1,
		},
		headerCount: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		infoCard: {
			backgroundColor: theme.palette.info.light,
			marginVertical: theme.spacing.lg,
		},
		infoText: {
			...theme.typography.body2,
			color: theme.palette.info.dark,
			lineHeight: 20,
		},
		gridContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			justifyContent: "space-between",
			paddingBottom: theme.spacing.xxl,
		},
		favoriteCard: {
			width: CARD_WIDTH,
			marginBottom: theme.spacing.md,
			padding: 0,
			overflow: "hidden",
		},
		cardContent: {
			flex: 1,
		},
		imageContainer: {
			width: "100%",
			height: CARD_WIDTH * 0.8,
			backgroundColor: theme.palette.background.surface,
			position: "relative",
		},
		productImage: {
			width: "100%",
			height: "100%",
			resizeMode: "cover",
		},
		outOfStockBadge: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0, 0, 0, 0.6)",
			alignItems: "center",
			justifyContent: "center",
		},
		outOfStockText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		productInfo: {
			padding: theme.spacing.sm,
		},
		productName: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
			minHeight: 36,
		},
		productPrice: {
			...theme.typography.subtitle2,
			color: theme.palette.primary.main,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
		},
		productBrand: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		actions: {
			flexDirection: "row",
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		addToCartButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.sm,
			borderRightWidth: 1,
			borderRightColor: theme.palette.divider,
		},
		removeButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.sm,
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl * 2,
		},
		emptyIcon: {
			fontSize: 64,
			marginBottom: theme.spacing.lg,
		},
		emptyTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
		},
		emptyDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
			paddingHorizontal: theme.spacing.lg,
			marginBottom: theme.spacing.xl,
		},
		browseButton: {
			minWidth: 200,
		},
	});

	return (
		<SafeArea>
			<View style={{ flex: 1, backgroundColor: theme.palette.background.default }}>
				{/* Header */}
				<Animated.View entering={FadeInUp.springify()}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>My Favorites</Text>
						{favorites.length > 0 && <Text style={styles.headerCount}>{favorites.length} items</Text>}
					</View>
				</Animated.View>

				{favorites.length === 0 ? (
					<EmptyState />
				) : (
					<ScrollView showsVerticalScrollIndicator={false}>
						<Container>
							{/* Info Card */}
							<Animated.View entering={FadeInUp.delay(100).springify()}>
								<Card style={styles.infoCard}>
									<Text style={styles.infoText}>
										Your favorite products are saved here. You can easily add them to your cart or remove
										them from favorites.
									</Text>
								</Card>
							</Animated.View>

							{/* Favorites Grid */}
							<View style={styles.gridContainer}>
								{favorites.map((favorite, index) => (
									<FavoriteCard key={favorite.productId} item={favorite} index={index} />
								))}
							</View>
						</Container>
					</ScrollView>
				)}
			</View>
		</SafeArea>
	);
};

export default FavoritesScreen;
