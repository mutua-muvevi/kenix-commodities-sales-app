import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	Easing,
	withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
import { Category } from "../../store/types/product";
import { Card } from "../ui/Card";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = (screenWidth - 32) / 2;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CategoryCardProps {
	category: Category;
	index?: number;
	onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, index = 0, onPress }) => {
	const { theme, isDark } = useTheme();
	const router = useRouter();

	const scale = useSharedValue(1);
	const elevation = useSharedValue(4);

	const handlePressIn = () => {
		scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
		elevation.value = withTiming(8, { duration: 100 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15, stiffness: 300 });
		elevation.value = withTiming(4, { duration: 100 });
	};

	const handlePress = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		if (onPress) {
			onPress();
		} else {
			router.push(`/category/${category._id}`);
		}
	};

	const productCount = category.products?.length || 0;

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const styles = StyleSheet.create({
		container: {
			width: CARD_WIDTH,
			marginBottom: theme.spacing.sm,
		},
		animatedWrapper: {
			flex: 1,
		},
		imageContainer: {
			position: "relative",
			height: 110,
			borderRadius: theme.borderRadius.lg,
			overflow: "hidden",
			backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
		},
		image: {
			width: "100%",
			height: "100%",
		},
		overlay: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			top: 0,
			justifyContent: "flex-end",
			padding: theme.spacing.md,
		},
		content: {
			alignItems: "flex-start",
		},
		topBadge: {
			position: "absolute",
			top: theme.spacing.sm,
			right: theme.spacing.sm,
			backgroundColor: "rgba(255,255,255,0.25)",
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: 4,
			borderRadius: theme.borderRadius.md,
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
			borderWidth: 1,
			borderColor: "rgba(255,255,255,0.3)",
		},
		badgeText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontSize: 10,
			fontWeight: "700",
		},
		name: {
			...theme.typography.subtitle1,
			color: theme.palette.common.white,
			fontWeight: "700",
			marginBottom: 4,
			textShadowColor: "rgba(0,0,0,0.5)",
			textShadowOffset: { width: 0, height: 2 },
			textShadowRadius: 4,
			fontSize: 15,
			letterSpacing: -0.2,
		},
		productCountRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
		},
		productCount: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.95)",
			fontSize: 12,
			fontWeight: "600",
			textShadowColor: "rgba(0,0,0,0.4)",
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
		},
		fallbackContainer: {
			backgroundColor: theme.palette.grey[200],
			alignItems: "center",
			justifyContent: "center",
		},
		fallbackText: {
			fontSize: 40,
		},
	});

	return (
		<Animated.View entering={FadeInUp.delay(index * 80).springify().damping(15)} style={styles.animatedWrapper}>
			<AnimatedTouchable
				style={[styles.container, cardAnimatedStyle]}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				activeOpacity={1}
				accessible={true}
				accessibilityRole="button"
				accessibilityLabel={`${category.name} category, ${productCount} products available`}
				accessibilityHint="Double tap to view products in this category"
			>
				<Card style={{ padding: 0 }} variant="elevated">
					<View style={styles.imageContainer}>
						{category.image ? (
							<>
								<Image
									source={{ uri: category.image }}
									style={styles.image}
									contentFit="cover"
									transition={300}
									priority="high"
									cachePolicy="memory-disk"
								/>
								<LinearGradient
									colors={[
										"transparent",
										"rgba(0,0,0,0.3)",
										"rgba(0,0,0,0.7)"
									]}
									locations={[0, 0.5, 1]}
									style={styles.overlay}
								>
									<View style={styles.content}>
										<Text
											style={styles.name}
											numberOfLines={1}
											accessible={true}
											accessibilityLabel={category.name}
										>
											{category.name}
										</Text>
										<View style={styles.productCountRow}>
											<Ionicons
												name="cube-outline"
												size={12}
												color="rgba(255,255,255,0.95)"
											/>
											<Text style={styles.productCount}>
												{productCount} {productCount !== 1 ? "products" : "product"}
											</Text>
										</View>
									</View>
								</LinearGradient>
								{productCount > 0 && (
									<View style={styles.topBadge}>
										<Ionicons
											name="checkmark-circle"
											size={12}
											color={theme.palette.common.white}
										/>
										<Text style={styles.badgeText}>{productCount}</Text>
									</View>
								)}
							</>
						) : (
							<>
								<LinearGradient
									colors={[
										theme.palette.primary.light,
										theme.palette.primary.main,
										theme.palette.primary.dark
									]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={[styles.image, styles.fallbackContainer]}
								>
									<Text style={styles.fallbackText}>{category.icon || "📦"}</Text>
								</LinearGradient>
								<LinearGradient
									colors={[
										"transparent",
										"rgba(0,0,0,0.3)",
										"rgba(0,0,0,0.6)"
									]}
									locations={[0, 0.5, 1]}
									style={styles.overlay}
								>
									<View style={styles.content}>
										<Text style={styles.name} numberOfLines={1}>
											{category.name}
										</Text>
										<View style={styles.productCountRow}>
											<Ionicons
												name="cube-outline"
												size={12}
												color="rgba(255,255,255,0.95)"
											/>
											<Text style={styles.productCount}>
												{productCount} {productCount !== 1 ? "products" : "product"}
											</Text>
										</View>
									</View>
								</LinearGradient>
							</>
						)}
					</View>
				</Card>
			</AnimatedTouchable>
		</Animated.View>
	);
};