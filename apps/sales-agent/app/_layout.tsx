import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import websocketService from '../services/websocket';
import { toastConfig } from '../components/ToastConfig';

export default function RootLayout() {
  // TEMPORARY: Bypass authentication for UI/UX testing
  // TODO: Re-enable authentication when sales agent users are created

  // const segments = useSegments();
  // const router = useRouter();
  // const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  // const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Connect to WebSocket for real-time features (optional for now)
  useEffect(() => {
    // websocketService.connect();
    // return () => websocketService.disconnect();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
