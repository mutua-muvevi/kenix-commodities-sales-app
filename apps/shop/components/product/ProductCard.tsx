import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../hooks";
import { useCart } from "../../store";
import type { Product } from "../../store/types/product";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = (screenWidth - 48) / 2;

interface ProductCardProps {
	product: Product;
	index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
	const { theme } = useTheme();
	const router = useRouter();
	const { addItem } = useCart();

	const handlePress = () => {
		router.push(`/products/${product._id}`);
	};

	const handleAddToCart = () => {
		addItem(product, 1);
	};

	const styles = StyleSheet.create({
		container: {
			width: CARD_WIDTH,
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg,
			marginBottom: theme.spacing.md,
			overflow: "hidden",
			...theme.shadows.z4,
		},
		imageContainer: {
			width: "100%",
			height: CARD_WIDTH * 0.8,
			backgroundColor: theme.palette.grey[100],
		},
		image: {
			width: "100%",
			height: "100%",
		},
		placeholder: {
			width: "100%",
			height: "100%",
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: theme.palette.grey[200],
		},
		content: {
			padding: theme.spacing.sm,
		},
		name: {
			...theme.typography.subtitle2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
			numberOfLines: 2,
		},
		priceRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		price: {
			...theme.typography.subtitle1,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		unit: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		addButton: {
			width: 32,
			height: 32,
			borderRadius: 16,
			backgroundColor: theme.palette.primary.main,
			justifyContent: "center",
			alignItems: "center",
		},
		outOfStock: {
			position: "absolute",
			top: theme.spacing.sm,
			right: theme.spacing.sm,
			backgroundColor: theme.palette.error.main,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.borderRadius.sm,
		},
		outOfStockText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
			fontSize: 10,
		},
	});

	return (
		<Animated.View entering={FadeInUp.delay(index * 50).springify()}>
			<TouchableOpacity
				style={styles.container}
				onPress={handlePress}
				activeOpacity={0.8}
			>
				<View style={styles.imageContainer}>
					{product.images && product.images.length > 0 ? (
						<Image
							source={{ uri: product.images[0] }}
							style={styles.image}
							contentFit="cover"
							transition={200}
						/>
					) : (
						<View style={styles.placeholder}>
							<Ionicons
								name="cube-outline"
								size={40}
								color={theme.palette.grey[400]}
							/>
						</View>
					)}
					{!product.inStock && (
						<View style={styles.outOfStock}>
							<Text style={styles.outOfStockText}>Out of Stock</Text>
						</View>
					)}
				</View>

				<View style={styles.content}>
					<Text style={styles.name} numberOfLines={2}>
						{product.name}
					</Text>
					<Text style={styles.unit}>{product.unitOfMeasure}</Text>
					<View style={styles.priceRow}>
						<Text style={styles.price}>
							KES {product.unitPrice.toLocaleString()}
						</Text>
						{product.inStock && (
							<TouchableOpacity
								style={styles.addButton}
								onPress={handleAddToCart}
							>
								<Ionicons name="add" size={20} color="#FFFFFF" />
							</TouchableOpacity>
						)}
					</View>
				</View>
			</TouchableOpacity>
		</Animated.View>
	);
};

export default ProductCard;
