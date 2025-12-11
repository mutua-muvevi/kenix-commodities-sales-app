// app/(tabs)/_layout.tsx - Clean 4-tab layout (Home, Categories, Offers, More)
import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

const TabsLayout = () => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();

	// Compact tab bar height - Wasoko style
	const getTabBarHeight = () => {
		if (Platform.OS === "ios") {
			return 50 + insets.bottom;
		}
		return 56 + Math.max(insets.bottom, 8);
	};

	const tabBarHeight = getTabBarHeight();
	const ICON_SIZE = 22; // Smaller, more compact icons

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
					paddingBottom: Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 4),
					paddingTop: 4, // Reduced from 8 to 4
					paddingHorizontal: 2, // Reduced from 4 to 2
					...(Platform.OS === "android" && {
						elevation: 8,
						shadowColor: theme.palette.common.black,
						shadowOffset: { width: 0, height: -2 },
						shadowOpacity: 0.1,
						shadowRadius: 4,
						position: "absolute" as const,
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 999,
					}),
					...(Platform.OS === "ios" && {
						shadowColor: theme.palette.common.black,
						shadowOffset: { width: 0, height: -1 },
						shadowOpacity: 0.08,
						shadowRadius: 2,
					}),
				},
				tabBarLabelStyle: {
					fontSize: 10, // Consistent 10px
					fontWeight: "600",
					marginTop: 0, // Remove top margin
					marginBottom: 1,
					includeFontPadding: false,
				},
				tabBarIconStyle: {
					marginTop: 0, // Remove top margin
					marginBottom: 0,
				},
				tabBarItemStyle: {
					paddingVertical: 4, // Reduced padding
					paddingHorizontal: 0,
					minHeight: 44, // Reduced from 48 to 44
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
						<MaterialIcons name="home" size={ICON_SIZE} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="categories"
				options={{
					title: "Categories",
					tabBarAccessibilityLabel: "Categories Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons name="category" size={ICON_SIZE} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="offers"
				options={{
					title: "Offers",
					tabBarAccessibilityLabel: "Offers Tab",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons name="local-offer" size={ICON_SIZE} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "More",
					tabBarAccessibilityLabel: "More Tab - Profile and Settings",
					tabBarIcon: ({ color, focused }) => (
						<MaterialIcons
							name={focused ? "person" : "person-outline"}
							size={ICON_SIZE}
							color={color}
						/>
					),
				}}
			/>
			{/* Cart tab hidden - using FAB instead */}
			<Tabs.Screen
				name="cart"
				options={{
					href: null, // Hide from tab bar
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
