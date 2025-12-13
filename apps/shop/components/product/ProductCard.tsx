import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useTheme } from "../../hooks";
import { useCart } from "../../store";
import type { Product } from "../../store/types/product";

const { width: screenWidth } = Dimensions.get("window");
// Card width will be controlled by parent container
const IMAGE_ASPECT_RATIO = 0.85;

interface ProductCardProps {
	product: Product;
	index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
	const { theme, isDark } = useTheme();
	const router = useRouter();
	const { addItem } = useCart();

	// Animation values
	const scale = useSharedValue(1);
	const buttonScale = useSharedValue(1);

	const handlePressIn = () => {
		scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15, stiffness: 300 });
	};

	const handlePress = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.push(`/products/${product._id}`);
	};

	const handleAddToCart = (e: any) => {
		e.stopPropagation();
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		buttonScale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
			buttonScale.value = withSpring(1, { damping: 10, stiffness: 400 });
		});
		addItem(product, 1);

		// Show toast notification
		Toast.show({
			type: "success",
			text1: "Added to cart",
			text2: `${product.name}`,
			position: "bottom",
			visibilityTime: 2000,
		});
	};

	const animatedCardStyle = useAnimatedStyle(() => ({
		width: '100%',
		transform: [{ scale: scale.value }],
	}));

	const animatedButtonStyle = useAnimatedStyle(() => ({
		transform: [{ scale: buttonScale.value }],
	}));

	// Calculate discount percentage if wholesale price exists
	const hasDiscount = product.wholePrice && product.wholePrice < product.unitPrice;
	const discountPercent = hasDiscount
		? Math.round(((product.unitPrice - product.wholePrice) / product.unitPrice) * 100)
		: 0;

	// Determine stock status
	const isLowStock = product.quantity > 0 && product.quantity <= 10;
	const stockStatus = !product.inStock
		? "Out of Stock"
		: isLowStock
		? `Only ${product.quantity} left`
		: "In Stock";

	const styles = StyleSheet.create({
		container: {
			width: "100%",
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg,
			marginBottom: theme.spacing.md,
			overflow: "hidden",
			elevation: 4,
			shadowColor: isDark ? "#000000" : theme.palette.grey[900],
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: isDark ? 0.3 : 0.08,
			shadowRadius: 8,
			borderWidth: 1,
			borderColor: isDark ? theme.palette.grey[800] : theme.palette.grey[200],
		},
		imageContainer: {
			width: "100%",
			aspectRatio: 1 / IMAGE_ASPECT_RATIO,
			backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
			position: "relative",
		},
		image: {
			width: "100%",
			height: "100%",
		},
		imageOverlay: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			height: 60,
		},
		placeholder: {
			width: "100%",
			height: "100%",
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[200],
		},
		badgeContainer: {
			position: "absolute",
			top: theme.spacing.sm,
			left: 0,
			right: 0,
			flexDirection: "row",
			justifyContent: "space-between",
			paddingHorizontal: theme.spacing.sm,
		},
		discountBadge: {
			backgroundColor: theme.palette.error.main,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: 4,
			borderRadius: theme.borderRadius.md,
			flexDirection: "row",
			alignItems: "center",
			gap: 2,
		},
		discountText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "700",
			fontSize: 11,
		},
		stockBadge: {
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: 4,
			borderRadius: theme.borderRadius.md,
		},
		stockBadgeOutOfStock: {
			backgroundColor: theme.palette.error.main,
		},
		stockBadgeLow: {
			backgroundColor: theme.palette.warning.main,
		},
		stockBadgeInStock: {
			backgroundColor: theme.palette.success.main,
		},
		stockText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
			fontSize: 10,
		},
		content: {
			padding: theme.spacing.md,
		},
		name: {
			...theme.typography.subtitle2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: 4,
			height: 36,
			lineHeight: 18,
		},
		unitRow: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.xs,
		},
		unit: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 11,
		},
		divider: {
			height: 1,
			backgroundColor: isDark ? theme.palette.grey[700] : theme.palette.grey[200],
			marginVertical: theme.spacing.sm,
		},
		priceSection: {
			gap: 6,
		},
		priceRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		priceColumn: {
			flex: 1,
		},
		priceLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 10,
			marginBottom: 2,
		},
		price: {
			...theme.typography.subtitle1,
			color: theme.palette.primary.main,
			fontWeight: "700",
			fontSize: 16,
		},
		wholePriceRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
		},
		wholePrice: {
			...theme.typography.body2,
			color: theme.palette.success.dark,
			fontWeight: "600",
			fontSize: 13,
		},
		oldPrice: {
			...theme.typography.caption,
			color: theme.palette.text.disabled,
			fontSize: 11,
			textDecorationLine: "line-through",
		},
		addButton: {
			width: 36,
			height: 36,
			borderRadius: 18,
			backgroundColor: theme.palette.primary.main,
			justifyContent: "center",
			alignItems: "center",
			elevation: 2,
			shadowColor: theme.palette.primary.main,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
		},
		addButtonDisabled: {
			backgroundColor: theme.palette.action.disabledBackground,
			elevation: 0,
			shadowOpacity: 0,
		},
	});

	return (
		<Animated.View
			entering={FadeInUp.delay(index * 50).springify()}
			style={animatedCardStyle}
		>
			<TouchableOpacity
				style={styles.container}
				onPress={handlePress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				activeOpacity={0.95}
				accessible={true}
				accessibilityRole="button"
				accessibilityLabel={`${product.name}, ${stockStatus}, ${product.unitPrice} KES`}
				accessibilityHint="Double tap to view product details"
			>
				<View style={styles.imageContainer}>
					{product.images && product.images.length > 0 ? (
						<>
							<Image
								source={{ uri: product.images[0] }}
								style={styles.image}
								contentFit="cover"
								transition={300}
								priority="high"
								cachePolicy="memory-disk"
							/>
							<LinearGradient
								colors={[
									"transparent",
									isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)",
								]}
								style={styles.imageOverlay}
							/>
						</>
					) : (
						<View style={styles.placeholder}>
							<Ionicons
								name="cube-outline"
								size={48}
								color={theme.palette.grey[400]}
							/>
						</View>
					)}

					<View style={styles.badgeContainer}>
						{hasDiscount && discountPercent > 0 && (
							<View style={styles.discountBadge}>
								<Ionicons
									name="pricetag"
									size={10}
									color={theme.palette.common.white}
								/>
								<Text style={styles.discountText}>-{discountPercent}%</Text>
							</View>
						)}
						<View
							style={[
								styles.stockBadge,
								!product.inStock
									? styles.stockBadgeOutOfStock
									: isLowStock
									? styles.stockBadgeLow
									: styles.stockBadgeInStock,
							]}
						>
							<Text style={styles.stockText}>{stockStatus}</Text>
						</View>
					</View>
				</View>

				<View style={styles.content}>
					<Text
						style={styles.name}
						numberOfLines={2}
						accessible={true}
						accessibilityLabel={product.name}
					>
						{product.name}
					</Text>

					<View style={styles.unitRow}>
						<Ionicons
							name="cube-outline"
							size={12}
							color={theme.palette.text.secondary}
						/>
						<Text style={[styles.unit, { marginLeft: 4 }]}>
							{product.unitOfMeasure}
						</Text>
					</View>

					<View style={styles.divider} />

					<View style={styles.priceSection}>
						<View style={styles.priceRow}>
							<View style={styles.priceColumn}>
								<Text style={styles.priceLabel}>Unit Price</Text>
								<Text
									style={styles.price}
									accessible={true}
									accessibilityLabel={`${product.unitPrice} KES`}
								>
									KES {product.unitPrice.toLocaleString()}
								</Text>
								{hasDiscount && (
									<View style={styles.wholePriceRow}>
										<Text style={styles.wholePrice}>
											KES {product.wholePrice.toLocaleString()}
										</Text>
										<Text style={styles.priceLabel}>bulk</Text>
									</View>
								)}
							</View>

							{product.inStock && (
								<Animated.View style={animatedButtonStyle}>
									<TouchableOpacity
										style={styles.addButton}
										onPress={handleAddToCart}
										activeOpacity={0.8}
										accessible={true}
										accessibilityRole="button"
										accessibilityLabel="Add to cart"
										accessibilityHint="Double tap to add one item to cart"
									>
										<Ionicons
											name="add"
											size={22}
											color={theme.palette.common.white}
										/>
									</TouchableOpacity>
								</Animated.View>
							)}

							{!product.inStock && (
								<View style={[styles.addButton, styles.addButtonDisabled]}>
									<Ionicons
										name="close"
										size={22}
										color={theme.palette.text.disabled}
									/>
								</View>
							)}
						</View>
					</View>
				</View>
			</TouchableOpacity>
		</Animated.View>
	);
};

export default ProductCard;
