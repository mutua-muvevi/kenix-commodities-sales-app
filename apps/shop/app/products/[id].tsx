// app/products/[id].tsx - Product Detail Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useProductsStore, useCart, useFavorites } from "../../store";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getProductById } = useProductsStore();
	const { addItem } = useCart();
	const { toggleFavorite, isFavorite } = useFavorites();

	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const product = getProductById(id || "");

	if (!product) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Product Not Found</Text>
					</View>
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>📦</Text>
						<Text style={styles.emptyTitle}>Product Not Available</Text>
						<Text style={styles.emptyDescription}>
							The product you're looking for is not available at the moment.
						</Text>
						<Button title="Go Back" variant="gradient" onPress={() => router.back()} style={styles.goBackButton} />
					</View>
				</Container>
			</SafeArea>
		);
	}

	const handleAddToCart = () => {
		addItem({
			productId: product._id,
			name: product.name,
			unitPrice: product.unitPrice,
			unitOfMeasure: product.unitOfMeasure,
			quantity: quantity,
			inStock: product.inStock,
		});
		Toast.show({
			type: "success",
			text1: "Added to Cart",
			text2: `${quantity} ${product.unitOfMeasure}${quantity > 1 ? "s" : ""} of ${product.name} added to cart`,
			position: "bottom",
		});
	};

	const handleToggleFavorite = () => {
		toggleFavorite(product);
		Toast.show({
			type: "success",
			text1: isFavorite(product._id) ? "Removed from Favorites" : "Added to Favorites",
			text2: isFavorite(product._id)
				? `${product.name} removed from your favorites`
				: `${product.name} added to your favorites`,
			position: "bottom",
		});
	};

	const incrementQuantity = () => {
		setQuantity((prev) => prev + 1);
	};

	const decrementQuantity = () => {
		if (quantity > 1) {
			setQuantity((prev) => prev - 1);
		}
	};

	const images = product.images && product.images.length > 0 ? product.images : ["https://picsum.photos/400/400"];

	const styles = StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.sm,
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
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			flex: 1,
		},
		favoriteButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.background.surface,
			alignItems: "center",
			justifyContent: "center",
		},
		imageContainer: {
			width: width,
			height: width,
			backgroundColor: theme.palette.background.surface,
			marginBottom: theme.spacing.lg,
		},
		productImage: {
			width: "100%",
			height: "100%",
			resizeMode: "cover",
		},
		imagePagination: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			position: "absolute",
			bottom: theme.spacing.md,
			left: 0,
			right: 0,
		},
		paginationDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			marginHorizontal: 4,
		},
		stockBadge: {
			position: "absolute",
			top: theme.spacing.md,
			right: theme.spacing.md,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.md,
		},
		stockBadgeText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		contentContainer: {
			paddingBottom: theme.spacing.xxl * 2,
		},
		productInfo: {
			marginBottom: theme.spacing.lg,
		},
		productName: {
			...theme.typography.h4,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.sm,
		},
		brandContainer: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		brandLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginRight: theme.spacing.xs,
		},
		brandName: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		priceCard: {
			marginBottom: theme.spacing.lg,
		},
		priceRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		priceLabel: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
		},
		priceValue: {
			...theme.typography.h5,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		divider: {
			height: 1,
			backgroundColor: theme.palette.divider,
			marginVertical: theme.spacing.md,
		},
		descriptionCard: {
			marginBottom: theme.spacing.lg,
		},
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.md,
		},
		description: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			lineHeight: 24,
		},
		tagsContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			marginTop: theme.spacing.md,
		},
		tag: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.borderRadius.full,
			backgroundColor: theme.palette.background.surface,
			marginRight: theme.spacing.sm,
			marginBottom: theme.spacing.sm,
			borderWidth: 1,
			borderColor: theme.palette.divider,
		},
		tagText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontWeight: "500",
		},
		quantityCard: {
			marginBottom: theme.spacing.lg,
		},
		quantitySelector: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		quantityControls: {
			flexDirection: "row",
			alignItems: "center",
		},
		quantityButton: {
			width: 44,
			height: 44,
			borderRadius: 22,
			backgroundColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
		},
		quantityButtonDisabled: {
			backgroundColor: theme.palette.background.surface,
			borderWidth: 1,
			borderColor: theme.palette.divider,
		},
		quantity: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			minWidth: 60,
			textAlign: "center",
		},
		totalPrice: {
			...theme.typography.h5,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		fixedBottom: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: theme.palette.background.default,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: theme.spacing.md,
			paddingBottom: theme.spacing.xl,
		},
		addToCartButton: {
			marginBottom: theme.spacing.sm,
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
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
		goBackButton: {
			minWidth: 200,
		},
	});

	return (
		<SafeArea edges={["top"]}>
			<View style={{ flex: 1, backgroundColor: theme.palette.background.default }}>
				{/* Header */}
				<Animated.View entering={FadeInDown.springify()}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle} numberOfLines={1}>
							{product.name}
						</Text>
						<TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
							<Ionicons
								name={isFavorite(product._id) ? "heart" : "heart-outline"}
								size={24}
								color={isFavorite(product._id) ? theme.palette.error.main : theme.palette.text.primary}
							/>
						</TouchableOpacity>
					</View>
				</Animated.View>

				<ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
					{/* Product Image Carousel */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<View style={styles.imageContainer}>
							<Image source={{ uri: images[selectedImageIndex] }} style={styles.productImage} />

							{/* Stock Badge */}
							<View
								style={[
									styles.stockBadge,
									{
										backgroundColor: product.inStock
											? theme.palette.success.main
											: theme.palette.error.main,
									},
								]}
							>
								<Text style={styles.stockBadgeText}>{product.inStock ? "In Stock" : "Out of Stock"}</Text>
							</View>

							{/* Image Pagination */}
							{images.length > 1 && (
								<View style={styles.imagePagination}>
									{images.map((_, index) => (
										<TouchableOpacity key={index} onPress={() => setSelectedImageIndex(index)}>
											<View
												style={[
													styles.paginationDot,
													{
														backgroundColor:
															index === selectedImageIndex
																? theme.palette.primary.main
																: theme.palette.background.surface,
													},
												]}
											/>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
					</Animated.View>

					<Container>
						<View style={styles.contentContainer}>
							{/* Product Name and Brand */}
							<Animated.View entering={FadeInUp.delay(200).springify()} style={styles.productInfo}>
								<Text style={styles.productName}>{product.name}</Text>
								{product.brand && (
									<View style={styles.brandContainer}>
										<Text style={styles.brandLabel}>Brand:</Text>
										<Text style={styles.brandName}>{product.brand}</Text>
									</View>
								)}
								{product.category && (
									<View style={styles.brandContainer}>
										<Text style={styles.brandLabel}>Category:</Text>
										<Text style={styles.brandName}>{product.category}</Text>
									</View>
								)}
							</Animated.View>

							{/* Pricing Card */}
							<Animated.View entering={FadeInUp.delay(300).springify()}>
								<Card style={styles.priceCard}>
									<View style={styles.priceRow}>
										<Text style={styles.priceLabel}>Unit Price</Text>
										<Text style={styles.priceValue}>
											KES {product.unitPrice.toFixed(2)} / {product.unitOfMeasure}
										</Text>
									</View>
									<View style={styles.divider} />
									<View style={styles.priceRow}>
										<Text style={styles.priceLabel}>Wholesale Price</Text>
										<Text style={styles.priceValue}>KES {product.wholePrice.toFixed(2)}</Text>
									</View>
								</Card>
							</Animated.View>

							{/* Description Card */}
							{product.description && (
								<Animated.View entering={FadeInUp.delay(400).springify()}>
									<Card style={styles.descriptionCard}>
										<Text style={styles.sectionTitle}>Description</Text>
										<Text style={styles.description}>{product.description}</Text>

										{/* Tags */}
										{product.tags && product.tags.length > 0 && (
											<View style={styles.tagsContainer}>
												{product.tags.map((tag, index) => (
													<View key={index} style={styles.tag}>
														<Text style={styles.tagText}>#{tag}</Text>
													</View>
												))}
											</View>
										)}
									</Card>
								</Animated.View>
							)}

							{/* Quantity Selector */}
							<Animated.View entering={FadeInUp.delay(500).springify()}>
								<Card style={styles.quantityCard}>
									<Text style={styles.sectionTitle}>Quantity</Text>
									<View style={styles.quantitySelector}>
										<View style={styles.quantityControls}>
											<TouchableOpacity
												onPress={decrementQuantity}
												style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
												disabled={quantity <= 1}
											>
												<Ionicons
													name="remove"
													size={24}
													color={
														quantity <= 1 ? theme.palette.text.disabled : theme.palette.common.white
													}
												/>
											</TouchableOpacity>

											<Text style={styles.quantity}>{quantity}</Text>

											<TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
												<Ionicons name="add" size={24} color={theme.palette.common.white} />
											</TouchableOpacity>
										</View>

										<Text style={styles.totalPrice}>KES {(product.unitPrice * quantity).toFixed(2)}</Text>
									</View>
								</Card>
							</Animated.View>
						</View>
					</Container>
				</ScrollView>

				{/* Fixed Bottom Actions */}
				<Animated.View entering={FadeInUp.delay(600).springify()} style={styles.fixedBottom}>
					<Button
						title={product.inStock ? "Add to Cart" : "Out of Stock"}
						variant="gradient"
						fullWidth
						disabled={!product.inStock}
						onPress={handleAddToCart}
						style={styles.addToCartButton}
						icon={<Ionicons name="cart" size={20} color={theme.palette.common.white} />}
					/>
				</Animated.View>
			</View>
		</SafeArea>
	);
};

export default ProductDetailScreen;
