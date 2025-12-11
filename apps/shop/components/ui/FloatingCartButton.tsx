// components/ui/FloatingCartButton.tsx - Floating Action Button for Cart
import React, { useEffect } from "react";
import { TouchableOpacity, StyleSheet, Platform, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withSequence,
	withTiming,
	Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../hooks/useTheme";
import { useCart } from "../../store";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingCartButtonProps {
	hideOnRoutes?: string[]; // Routes where FAB should be hidden
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
	hideOnRoutes = ["/cart", "/(tabs)/cart"],
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const { theme } = useTheme();
	const { totalItems } = useCart();
	const insets = useSafeAreaInsets();

	// Animation values
	const scale = useSharedValue(0);
	const badgeScale = useSharedValue(1);

	// Initial entrance animation
	useEffect(() => {
		scale.value = withSpring(1, {
			damping: 15,
			stiffness: 150,
		});
	}, []);

	// Badge pop animation when items change
	useEffect(() => {
		if (totalItems > 0) {
			badgeScale.value = withSequence(
				withTiming(1.3, { duration: 150, easing: Easing.out(Easing.cubic) }),
				withTiming(1, { duration: 150, easing: Easing.in(Easing.cubic) }),
			);
		}
	}, [totalItems]);

	// Animated styles
	const fabAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const badgeAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: badgeScale.value }],
	}));

	// Hide FAB on specified routes
	const shouldHide = hideOnRoutes.some((route) => pathname?.includes(route));
	if (shouldHide) return null;

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/(tabs)/cart");
	};

	const bottomPosition = Platform.OS === "ios" ? insets.bottom + 16 : 16;
	const badgeCount = totalItems > 99 ? "99+" : totalItems.toString();

	return (
		<AnimatedTouchable
			style={[
				styles.fab,
				{
					backgroundColor: theme.palette.primary.main,
					bottom: bottomPosition,
					shadowColor: theme.palette.common.black,
				},
				fabAnimatedStyle,
			]}
			onPress={handlePress}
			activeOpacity={0.85}
			accessibilityLabel={`Shopping cart, ${totalItems} items`}
			accessibilityRole="button"
			accessibilityHint="Navigate to shopping cart"
		>
			<MaterialCommunityIcons name="shopping" size={28} color={theme.palette.primary.contrastText} />

			{totalItems > 0 && (
				<Animated.View
					style={[
						styles.badge,
						{
							backgroundColor: theme.palette.error.main,
						},
						badgeAnimatedStyle,
					]}
				>
					<Text
						style={[
							styles.badgeText,
							{
								color: theme.palette.error.contrastText,
							},
						]}
					>
						{badgeCount}
					</Text>
				</Animated.View>
			)}
		</AnimatedTouchable>
	);
};

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		right: 16,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		elevation: 6,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		zIndex: 1000,
		...Platform.select({
			android: {
				elevation: 8,
			},
			ios: {
				shadowOffset: { width: 0, height: 6 },
				shadowOpacity: 0.25,
				shadowRadius: 10,
			},
		}),
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -4,
		minWidth: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
		borderWidth: 2,
		borderColor: "#FFFFFF",
		elevation: 4,
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3,
	},
	badgeText: {
		fontSize: 11,
		fontWeight: "700",
		includeFontPadding: false,
		textAlign: "center",
	},
});
