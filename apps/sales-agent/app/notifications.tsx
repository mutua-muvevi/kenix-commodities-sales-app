/**
 * Notifications Screen
 *
 * Complete production-ready notifications display with:
 * - Grouped notifications (Today, Yesterday, This Week, Earlier)
 * - Filter tabs (All, Unread, Shop Updates, Orders, Payments)
 * - Swipe actions (swipe left to delete, swipe right to mark as read)
 * - Pull-to-refresh
 * - Priority indicators
 * - Smart navigation based on notification type
 * - Empty states
 * - Mark all as read
 * - Clear all notifications
 * - Proper error handling
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNotifications,
  useNotificationActions,
  useNotificationLoading,
  useUnreadCount,
} from '../store/hooks/use-notification';
import { Notification, NotificationType } from '../types/notification';
import { useAuthStore } from '../store/authStore';

type FilterType = 'all' | 'unread' | 'shops' | 'orders' | 'payments';

interface NotificationSection {
  title: string;
  data: Notification[];
}

export default function NotificationsScreen() {
  const user = useAuthStore((state) => state.user);
  const notifications = useNotifications();
  const isLoading = useNotificationLoading();
  const unreadCount = useUnreadCount();
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotificationActions();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?._id) {
      fetchNotifications(user._id);
    }
  }, [user?._id]);

  // Filter notifications based on active filter
  const filteredNotifications = useMemo((): Notification[] => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'shops':
        return notifications.filter((n) =>
          ['shop_approved', 'shop_rejected'].includes(n.type)
        );
      case 'orders':
        return notifications.filter((n) =>
          ['order_status', 'order_confirmed', 'order_delivered', 'order_cancelled'].includes(n.type)
        );
      case 'payments':
        return notifications.filter((n) =>
          ['commission_paid', 'commission_update'].includes(n.type)
        );
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  // Group notifications by date
  const groupedNotifications = useMemo((): NotificationSection[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayNotifs: Notification[] = [];
    const yesterdayNotifs: Notification[] = [];
    const thisWeekNotifs: Notification[] = [];
    const earlierNotifs: Notification[] = [];

    filteredNotifications.forEach((notif) => {
      const notifDate = new Date(notif.createdAt);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        todayNotifs.push(notif);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        yesterdayNotifs.push(notif);
      } else if (notifDate >= weekAgo) {
        thisWeekNotifs.push(notif);
      } else {
        earlierNotifs.push(notif);
      }
    });

    const sections: NotificationSection[] = [];

    if (todayNotifs.length > 0) {
      sections.push({ title: 'Today', data: todayNotifs });
    }
    if (yesterdayNotifs.length > 0) {
      sections.push({ title: 'Yesterday', data: yesterdayNotifs });
    }
    if (thisWeekNotifs.length > 0) {
      sections.push({ title: 'This Week', data: thisWeekNotifs });
    }
    if (earlierNotifs.length > 0) {
      sections.push({ title: 'Earlier', data: earlierNotifs });
    }

    return sections;
  }, [filteredNotifications]);

  const handleRefresh = useCallback(async () => {
    if (!user?._id) return;
    setRefreshing(true);
    try {
      await fetchNotifications(user._id);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh Failed',
        text2: 'Could not refresh notifications',
      });
    } finally {
      setRefreshing(false);
    }
  }, [user?._id, fetchNotifications]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.actionable && notification.data?.entityId) {
      const { entityType, entityId } = notification.data;

      switch (entityType) {
        case 'shop':
          router.push(`/shop/${entityId}`);
          break;
        case 'order':
          router.push(`/orders/${entityId}`);
          break;
        case 'route':
          router.push('/(tabs)/routes');
          break;
        case 'commission':
        case 'target':
          router.push('/(tabs)/performance');
          break;
        default:
          // No navigation for generic notifications
          break;
      }
    }
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(async () => {
    if (!user?._id || unreadCount === 0) return;

    try {
      await markAllAsRead(user._id);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Toast.show({
        type: 'success',
        text1: 'All marked as read',
        text2: `${unreadCount} notification${unreadCount > 1 ? 's' : ''} marked`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not mark all as read',
      });
    }
  }, [user?._id, unreadCount, markAllAsRead]);

  const handleClearAll = useCallback(() => {
    if (!user?._id || notifications.length === 0) return;

    Alert.alert(
      'Clear All Notifications',
      `Are you sure you want to delete all ${notifications.length} notification${notifications.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotifications(user._id);
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Toast.show({
                type: 'success',
                text1: 'Notifications Cleared',
                text2: 'All notifications deleted',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not clear notifications',
              });
            }
          },
        },
      ]
    );
  }, [user?._id, notifications.length, clearAllNotifications]);

  const handleDelete = useCallback(async (notificationId: string) => {
    setDeletingIds((prev) => new Set(prev).add(notificationId));
    try {
      await deleteNotification(notificationId);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Toast.show({
        type: 'success',
        text1: 'Notification Deleted',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: 'Could not delete notification',
      });
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  }, [deleteNotification]);

  const getNotificationIcon = (type: NotificationType): string => {
    const iconMap: Record<NotificationType, string> = {
      route_assigned: 'map-outline',
      order_confirmed: 'checkmark-circle-outline',
      order_delivered: 'rocket-outline',
      shop_approved: 'business-outline',
      shop_rejected: 'close-circle-outline',
      commission_paid: 'cash-outline',
      commission_update: 'cash-outline',
      inventory_update: 'alert-outline',
      price_update: 'pricetag-outline',
      promotion: 'gift-outline',
      system: 'settings-outline',
      announcement: 'megaphone-outline',
      order_status: 'cube-outline',
      order_cancelled: 'close-circle-outline',
      route_reminder: 'alarm-outline',
      target_reminder: 'trending-up-outline',
      target_achieved: 'trophy-outline',
    };

    return iconMap[type] || 'notifications-outline';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const colorMap: Record<NotificationType, string> = {
      route_assigned: '#2196F3',
      order_confirmed: '#4CAF50',
      order_delivered: '#4CAF50',
      shop_approved: '#4CAF50',
      shop_rejected: '#F44336',
      commission_paid: '#4CAF50',
      commission_update: '#4CAF50',
      inventory_update: '#FF9800',
      price_update: '#2196F3',
      promotion: '#9C27B0',
      system: '#757575',
      announcement: '#2196F3',
      order_status: '#2196F3',
      order_cancelled: '#F44336',
      route_reminder: '#FF9800',
      target_reminder: '#FF9800',
      target_achieved: '#4CAF50',
    };

    return colorMap[type] || '#757575';
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderRightActions = (notification: Notification) => (
    <Animated.View style={styles.swipeDeleteContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(notification._id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLeftActions = (notification: Notification) => {
    if (notification.read) return null;

    return (
      <Animated.View style={styles.swipeReadContainer}>
        <TouchableOpacity
          style={styles.readButton}
          onPress={async () => {
            await markAsRead(notification._id);
            if (Platform.OS !== 'web') {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
          <Text style={styles.readButtonText}>Mark Read</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const color = getNotificationColor(item.type);
    const isDeleting = deletingIds.has(item._id);

    if (isDeleting) {
      return (
        <View style={styles.deletingCard}>
          <ActivityIndicator size="small" color="#F44336" />
          <Text style={styles.deletingText}>Deleting...</Text>
        </View>
      );
    }

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
        overshootRight={false}
        overshootLeft={false}
      >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            !item.read && styles.unreadCard,
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationContent}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.notificationTitle,
                    !item.read && styles.boldText,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>

              <Text
                style={[
                  styles.notificationMessage,
                  !item.read && styles.semiBoldText,
                ]}
                numberOfLines={2}
              >
                {item.message}
              </Text>

              <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
            </View>

            {/* Action Indicator */}
            {item.actionable && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9ca3af"
                style={styles.chevron}
              />
            )}
          </View>

          {/* Priority Indicator */}
          {(item.priority === 'urgent' || item.priority === 'high') && (
            <View
              style={[
                styles.priorityIndicator,
                {
                  backgroundColor: item.priority === 'urgent' ? '#F44336' : '#FF9800',
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.title === 'Today' && unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={
          activeFilter === 'unread'
            ? 'checkmark-circle-outline'
            : 'notifications-off-outline'
        }
        size={64}
        color="#9ca3af"
      />
      <Text style={styles.emptyTitle}>
        {activeFilter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'unread'
          ? "You've read all your notifications"
          : "We'll notify you when something new happens"}
      </Text>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all' as FilterType, label: 'All', count: notifications.length },
        { key: 'unread' as FilterType, label: 'Unread', count: unreadCount },
        {
          key: 'shops' as FilterType,
          label: 'Shops',
          count: notifications.filter((n) =>
            ['shop_approved', 'shop_rejected'].includes(n.type)
          ).length,
        },
        {
          key: 'orders' as FilterType,
          label: 'Orders',
          count: notifications.filter((n) =>
            ['order_status', 'order_confirmed', 'order_delivered', 'order_cancelled'].includes(
              n.type
            )
          ).length,
        },
        {
          key: 'payments' as FilterType,
          label: 'Payments',
          count: notifications.filter((n) =>
            ['commission_paid', 'commission_update'].includes(n.type)
          ).length,
        },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterTab, activeFilter === filter.key && styles.activeFilterTab]}
          onPress={async () => {
            setActiveFilter(filter.key);
            if (Platform.OS !== 'web') {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.activeFilterTabText,
            ]}
          >
            {filter.label}
          </Text>
          {filter.count > 0 && (
            <View
              style={[
                styles.filterBadge,
                activeFilter === filter.key && styles.activeFilterBadge,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  activeFilter === filter.key && styles.activeFilterBadgeText,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={styles.headerRight}>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerAction}>
            <Ionicons name="checkmark-done" size={22} color="#22c55e" />
          </TouchableOpacity>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.headerAction}>
            <Ionicons name="trash-outline" size={22} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {renderHeader()}
      {renderFilterTabs()}
      <SectionList
        sections={groupedNotifications}
        renderItem={renderNotification}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          groupedNotifications.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#22c55e',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeFilterBadge: {
    backgroundColor: '#15803d',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  activeFilterBadgeText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#2196F3',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  notificationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  semiBoldText: {
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  swipeDeleteContainer: {
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 12,
    marginBottom: 8,
    paddingRight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeReadContainer: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 12,
    marginBottom: 8,
    paddingLeft: 20,
  },
  readButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deletingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
    gap: 12,
  },
  deletingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
});
