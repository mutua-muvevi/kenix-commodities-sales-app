import { useEffect, useRef } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/authStore';
import { toastConfig } from '../components/ToastConfig';
import {
  registerForPushNotifications,
  sendPushTokenToBackend,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../services/notifications';

export default function RootLayout() {
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Load user on app start
    loadUser();
  }, []);

  // Setup push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Register for push notifications
      registerForPushNotifications().then((token) => {
        if (token) {
          sendPushTokenToBackend(token);
          console.log('[Notifications] Push token registered');
        }
      });

      // Handle notifications received while app is in foreground
      notificationListener.current = addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;
        console.log('[Notifications] Received:', title);

        // Show toast for foreground notifications
        Toast.show({
          type: data?.type === 'error' ? 'error' : 'info',
          text1: title || 'Notification',
          text2: body || '',
        });
      });

      // Handle notification tap/response
      responseListener.current = addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;
        console.log('[Notifications] Tapped:', data);

        // Navigate based on notification type
        if (data?.screen) {
          switch (data.screen) {
            case 'route':
              router.push('/(tabs)');
              break;
            case 'wallet':
              router.push('/(tabs)/wallet');
              break;
            case 'history':
              router.push('/(tabs)/history');
              break;
            default:
              router.push('/(tabs)');
          }
        }
      });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, user]);

  // Handle authentication routing
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
