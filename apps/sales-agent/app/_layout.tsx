import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import websocketService from '../services/websocket';
import { toastConfig } from '../components/ToastConfig';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
      // Disconnect WebSocket if logged out
      websocketService.disconnect();
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to dashboard
      router.replace('/(tabs)/dashboard');
    } else if (isAuthenticated) {
      // Connect to WebSocket when authenticated
      websocketService.connect();
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
