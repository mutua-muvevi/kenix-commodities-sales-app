// app/(tabs)/_layout.tsx - Updated with Offers instead of Search
import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useCart } from "../../store";

const TabsLayout = () => {
	const { theme } = useTheme();
	const { totalItems } = useCart();
	const insets = useSafeAreaInsets();

	// Calculate proper heights for different devices
	const getTabBarHeight = () => {
		if (Platform.OS === "ios") {
			return 49 + insets.bottom;
		}

		const baseHeight = 60;
		const additionalPadding = Math.max(insets.bottom, 16);
		return baseHeight + additionalPadding;
	};

	const tabBarHeight = getTabBarHeight();
	const ICON_SIZE = 24;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.palette.primary.main,
				tabBarInactiveTintColor: theme.palette.text.secondary,
				tabBarStyle: {
					backgroundColor: theme.palette.background.paper,
					borderTopColor: theme.palette.divider,
					borderTopWidth: 0.5,
					height: tabBarHeight,
					paddingBottom: Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 8),
					paddingTop: 8,
					paddingHorizontal: 4,
					...(Platform.OS === "android" && {
						elevation: 12,
						shadowColor: theme.palette.common.black,
						shadowOffset: { width: 0, height: -3 },
						shadowOpacity: 0.15,
						shadowRadius: 6,
						position: "absolute" as const,
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 999,
					}),
					...(Platform.OS === "ios" && {
						shadowColor: theme.palette.common.black,
						shadowOffset: { width: 0, height: -1 },
						shadowOpacity: 0.1,
						shadowRadius: 3,
					}),
				},
				tabBarLabelStyle: {
					fontSize: Platform.OS === "ios" ? 10 : 11,
					fontWeight: "600",
					marginTop: 2,
					marginBottom: 2,
					includeFontPadding: false,
				},
				tabBarIconStyle: {
					marginTop: Platform.OS === "ios" ? 2 : 4,
					marginBottom: 0,
				},
				tabBarItemStyle: {
					paddingVertical: Platform.OS === "ios" ? 4 : 6,
					paddingHorizontal: 2,
					minHeight: 48,
					justifyContent: "center",
				},
				tabBarPressColor: Platform.OS === "android" ? theme.palette.primary.main + "20" : undefined,
				tabBarPressOpacity: Platform.OS === "ios" ? 0.7 : undefined,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarAccessibilityLabel: "Home Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							name={focused ? "home" : "home"}
							size={ICON_SIZE}
							color={color}
							style={{
								marginBottom: Platform.OS === "android" ? 2 : 0,
								opacity: focused ? 1 : 0.6,
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="categories"
				options={{
					title: "Categories",
					tabBarAccessibilityLabel: "Categories Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							name="category"
							size={ICON_SIZE}
							color={color}
							style={{
								marginBottom: Platform.OS === "android" ? 2 : 0,
								opacity: focused ? 1 : 0.6,
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="offers"
				options={{
					title: "Offers",
					tabBarAccessibilityLabel: "Offers Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							name={focused ? "local-offer" : "local-offer"}
							size={ICON_SIZE}
							color={color}
							style={{
								marginBottom: Platform.OS === "android" ? 2 : 0,
								opacity: focused ? 1 : 0.6,
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="cart"
				options={{
					title: "Cart",
					tabBarAccessibilityLabel: `Cart Tab${totalItems > 0 ? `, ${totalItems} items` : ""}`,
					tabBarBadge: totalItems > 0 ? (totalItems > 99 ? "99+" : totalItems) : undefined,
					tabBarBadgeStyle: {
						backgroundColor: theme.palette.error.main,
						color: theme.palette.error.contrastText,
						fontSize: 9,
						fontWeight: "700",
						minWidth: 18,
						height: 18,
						borderRadius: 9,
						borderWidth: Platform.OS === "ios" ? 0 : 1,
						borderColor: theme.palette.background.paper,
						top: Platform.OS === "android" ? 2 : 0,
					},
					tabBarIcon: ({ color, focused }) => (
						<MaterialCommunityIcons
							name={focused ? "shopping" : "shopping-outline"}
							size={ICON_SIZE}
							color={color}
							style={{
								marginBottom: Platform.OS === "android" ? 2 : 0,
								opacity: focused ? 1 : 0.6,
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarAccessibilityLabel: "Profile Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							name={focused ? "person" : "person-outline"}
							size={ICON_SIZE}
							color={color}
							style={{
								marginBottom: Platform.OS === "android" ? 2 : 0,
								opacity: focused ? 1 : 0.6,
							}}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
