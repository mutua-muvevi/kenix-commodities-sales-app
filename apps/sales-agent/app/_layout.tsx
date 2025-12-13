import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/slices/theme/theme-store';
import websocketService from '../services/websocket';
import { toastConfig } from '../components/ToastConfig';

export default function RootLayout() {
  // TEMPORARY: Bypass authentication for UI/UX testing
  // TODO: Re-enable authentication when sales agent users are created

  // const segments = useSegments();
  // const router = useRouter();
  // const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  // const [isLayoutReady, setIsLayoutReady] = useState(false);

  const systemColorScheme = useColorScheme();
  const { isDark, initializeTheme, updateSystemTheme } = useThemeStore();

  // Initialize theme when app starts
  useEffect(() => {
    initializeTheme(systemColorScheme || 'light');
  }, [initializeTheme]);

  // Update theme when system color scheme changes
  useEffect(() => {
    if (systemColorScheme) {
      updateSystemTheme(systemColorScheme);
    }
  }, [systemColorScheme, updateSystemTheme]);

  // Connect to WebSocket for real-time features (optional for now)
  useEffect(() => {
    // websocketService.connect();
    // return () => websocketService.disconnect();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
