import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouteStore } from '../../store/routeStore';
import { useNetworkStore } from '../../store/networkStore';
import { startBackgroundTracking } from '../../services/location';
import { startSyncListener } from '../../services/sync';
import OfflineBanner from '../../components/OfflineBanner';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const { loadActiveRoute, loadWallet, activeRoute, initializeWebSocketListeners, cleanupWebSocketListeners } = useRouteStore();
  const { initialize: initializeNetwork } = useNetworkStore();

  useEffect(() => {
    // Initialize network monitoring
    const unsubscribeNetwork = initializeNetwork();

    // Start sync listener for offline actions
    const unsubscribeSync = startSyncListener();

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Load initial data
      loadActiveRoute(user._id);
      loadWallet(user._id);

      // Initialize WebSocket listeners for real-time updates
      initializeWebSocketListeners(user._id);

      // Start background location tracking if there's an active route
      if (activeRoute) {
        startBackgroundTracking();
      }
    }

    // Cleanup on unmount
    return () => {
      cleanupWebSocketListeners();
    };
  }, [user, activeRoute]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#0066CC',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Active Route',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={size} color={color} />
          ),
          headerTitle: 'Active Delivery',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          headerTitle: 'My Wallet',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          headerTitle: 'Delivery History',
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          headerTitle: 'My Performance',
        }}
      />
    </Tabs>
  );
}
