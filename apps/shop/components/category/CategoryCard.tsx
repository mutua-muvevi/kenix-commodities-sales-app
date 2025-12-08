import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
	const { theme } = useTheme();
	const router = useRouter();

	const scale = useSharedValue(1);

	const handlePressIn = () => {
		scale.value = withSpring(0.95);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const handlePress = () => {
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
			// Wrapper for layout animation to prevent conflicts
		},
		imageContainer: {
			position: "relative",
			height: 100,
			borderRadius: theme.borderRadius.md,
			overflow: "hidden",
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
			padding: theme.spacing.sm,
		},
		content: {
			alignItems: "center",
		},
		name: {
			...theme.typography.subtitle2,
			color: theme.palette.common.white,
			fontWeight: "700",
			textAlign: "center",
			marginBottom: 2,
			textShadowColor: "rgba(0,0,0,0.3)",
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 2,
		},
		productCount: {
			...theme.typography.caption,
			color: "rgba(255,255,255,0.9)",
			fontSize: 11,
			fontWeight: "500",
			textShadowColor: "rgba(0,0,0,0.3)",
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 2,
		},
		fallbackContainer: {
			backgroundColor: theme.palette.grey[200],
			alignItems: "center",
			justifyContent: "center",
		},
		fallbackText: {
			fontSize: 32,
		},
	});

	return (
		// Separate layout animation from transform animation to fix warning
		<Animated.View entering={FadeInUp.delay(index * 100).springify()} style={styles.animatedWrapper}>
			<AnimatedTouchable
				style={[styles.container, cardAnimatedStyle]}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				activeOpacity={1}
			>
				<Card style={{ padding: 0 }} variant="elevated">
					<View style={styles.imageContainer}>
						{category.image ? (
							<Image
								source={{ uri: category.image }}
								style={styles.image}
								contentFit="cover"
								placeholder="https://via.placeholder.com/200x100?text=..."
								transition={300}
							/>
						) : (
							<View style={[styles.image, styles.fallbackContainer]}>
								<Text style={styles.fallbackText}>📦</Text>
							</View>
						)}

						<LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.overlay}>
							<View style={styles.content}>
								<Text style={styles.name} numberOfLines={1}>
									{category.name}
								</Text>
								<Text style={styles.productCount}>
									{productCount} item{productCount !== 1 ? "s" : ""}
								</Text>
							</View>
						</LinearGradient>
					</View>
				</Card>
			</AnimatedTouchable>
		</Animated.View>
	);
};