/**
 * Notifications Screen
 *
 * Features:
 * - Grouped notifications (Today, Yesterday, Earlier)
 * - Different icons/colors by type
 * - Unread indicator (blue dot)
 * - Mark as read on tap
 * - Mark all as read button
 * - Swipe to dismiss (future enhancement)
 * - Pull-to-refresh
 * - Empty state
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import {
  useNotifications,
  useNotificationActions,
  useNotificationLoading,
  useUnreadCount,
} from '../store/hooks/use-notification';
import { Notification, NotificationType } from '../types/notification';
import { useTheme } from '../hooks/useTheme';

interface NotificationSection {
  title: string;
  data: Notification[];
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const notifications = useNotifications();
  const isLoading = useNotificationLoading();
  const unreadCount = useUnreadCount();
  const { fetchNotifications, markAsRead, markAllAsRead, refreshNotifications } =
    useNotificationActions();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Group notifications by date
  const groupedNotifications = useMemo((): NotificationSection[] => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayNotifs: Notification[] = [];
    const yesterdayNotifs: Notification[] = [];
    const earlierNotifs: Notification[] = [];

    notifications.forEach((notif) => {
      const notifDate = notif.createdAt.split('T')[0];

      if (notifDate === todayStr) {
        todayNotifs.push(notif);
      } else if (notifDate === yesterdayStr) {
        yesterdayNotifs.push(notif);
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
    if (earlierNotifs.length > 0) {
      sections.push({ title: 'Earlier', data: earlierNotifs });
    }

    return sections;
  }, [notifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate if actionable
    if (notification.actionable && notification.actionUrl) {
      // Parse actionUrl and navigate
      // For now, just log it
      console.log('Navigate to:', notification.actionUrl);
      // router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

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
      route_assigned: theme.palette.info.main,
      order_confirmed: theme.palette.success.main,
      order_delivered: theme.palette.success.main,
      shop_approved: theme.palette.success.main,
      shop_rejected: theme.palette.error.main,
      commission_paid: theme.palette.success.main,
      commission_update: theme.palette.success.main,
      inventory_update: theme.palette.warning.main,
      price_update: theme.palette.info.main,
      promotion: theme.palette.secondary.main,
      system: theme.palette.grey[600],
      announcement: theme.palette.info.main,
      order_status: theme.palette.info.main,
      order_cancelled: theme.palette.error.main,
      route_reminder: theme.palette.warning.main,
      target_reminder: theme.palette.warning.main,
      target_achieved: theme.palette.success.main,
    };

    return colorMap[type] || theme.palette.grey[600];
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
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const color = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.read
              ? theme.palette.background.paper
              : theme.palette.primary.lighter,
            borderColor: theme.palette.divider,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
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
                  { color: theme.palette.text.primary },
                  !item.read && styles.boldText,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.palette.info.main }]} />
              )}
            </View>

            <Text
              style={[
                styles.notificationMessage,
                { color: theme.palette.text.secondary },
                !item.read && styles.semiBoldText,
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            <Text style={[styles.notificationTime, { color: theme.palette.text.secondary }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>

          {/* Action Indicator */}
          {item.actionable && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.palette.text.secondary}
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
                backgroundColor:
                  item.priority === 'urgent' ? theme.palette.error.main : theme.palette.warning.main,
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.palette.background.default }]}>
      <Text style={[styles.sectionTitle, { color: theme.palette.text.primary }]}>
        {section.title}
      </Text>
      {section.title === 'Today' && unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: theme.palette.info.main }]}>
          <Text style={[styles.unreadBadgeText, { color: theme.palette.common.white }]}>
            {unreadCount}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color={theme.palette.grey[400]} />
      <Text style={[styles.emptyTitle, { color: theme.palette.text.primary }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.palette.text.secondary }]}>
        You're all caught up! We'll notify you when something new happens.
      </Text>
    </View>
  );

  const renderMarkAllReadButton = () => {
    if (unreadCount === 0) return null;

    return (
      <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
        <Ionicons name="checkmark-done" size={20} color={theme.palette.primary.main} />
        <Text style={[styles.markAllText, { color: theme.palette.primary.main }]}>
          Mark all read
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <ScreenWrapper headerTitle="Notifications" showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={[styles.loadingText, { color: theme.palette.text.secondary }]}>
            Loading notifications...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      headerTitle="Notifications"
      showBackButton
      scrollable={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      rightAction={renderMarkAllReadButton()}
    >
      <SectionList
        sections={groupedNotifications}
        renderItem={renderNotification}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
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
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notificationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    overflow: 'hidden',
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
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
