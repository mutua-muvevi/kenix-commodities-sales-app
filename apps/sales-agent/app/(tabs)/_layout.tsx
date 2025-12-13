// app/(tabs)/_layout.tsx - Sales Agent tab layout with proper safe area handling
import React from "react";
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Compact tab bar height - matching Shop app style
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      return 50 + insets.bottom;
    }
    return 56 + Math.max(insets.bottom, 8);
  };

  const tabBarHeight = getTabBarHeight();
  const ICON_SIZE = 22; // Compact icons like Shop app

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.palette.success.main,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.palette.common.white,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        tabBarActiveTintColor: theme.palette.success.main, // #22c55e
        tabBarInactiveTintColor: theme.palette.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.palette.background.paper,
          borderTopColor: theme.palette.divider,
          borderTopWidth: 0.5,
          height: tabBarHeight,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 4),
          paddingTop: 4,
          paddingHorizontal: 2,
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
          fontSize: 10,
          fontWeight: "600",
          marginTop: 0,
          marginBottom: 1,
          includeFontPadding: false,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          paddingHorizontal: 0,
          minHeight: 44,
          justifyContent: "center",
        },
        tabBarPressColor: Platform.OS === "android" ? theme.palette.success.main + "20" : undefined,
        tabBarPressOpacity: Platform.OS === "ios" ? 0.7 : undefined,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="home" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: 'Shops',
          headerTitle: 'My Shops',
          tabBarAccessibilityLabel: 'My Shops Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="storefront" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Routes',
          headerTitle: 'My Routes',
          tabBarAccessibilityLabel: 'My Routes Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="map" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          headerTitle: 'Orders',
          tabBarAccessibilityLabel: 'Orders Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="receipt" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          title: 'Performance',
          headerTitle: 'Performance',
          tabBarAccessibilityLabel: 'Performance Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="analytics" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarAccessibilityLabel: 'Profile and Settings Tab',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
