import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../store/networkStore';
import { getPendingActionsCount } from '../services/offline';

export default function OfflineBanner() {
  const { isOnline } = useNetworkStore();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending actions count
  useEffect(() => {
    const fetchPendingCount = async () => {
      const count = await getPendingActionsCount();
      setPendingCount(count);
    };
    fetchPendingCount();

    // Refresh count periodically when offline
    const interval = setInterval(fetchPendingCount, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  // Don't render if online (but keep animation for smooth transition)
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>You're offline</Text>
          {pendingCount > 0 && (
            <Text style={styles.subtitle}>
              {pendingCount} action{pendingCount > 1 ? 's' : ''} pending sync
            </Text>
          )}
        </View>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF9800',
    zIndex: 1000,
    elevation: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '700',
  },
});
