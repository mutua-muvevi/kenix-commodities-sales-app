/**
 * NotificationCard Component
 * Displays notification with icon, message, and actions.
 *
 * Features:
 * - Icon based on notification type
 * - Title and message
 * - Timestamp (relative time)
 * - Unread indicator (dot)
 * - Swipe to dismiss
 * - Action buttons
 * - Priority-based styling
 *
 * @example
 * ```tsx
 * <NotificationCard
 *   notification={notification}
 *   onPress={() => handleNotificationPress(notification)}
 *   onDismiss={() => dismissNotification(notification._id)}
 * />
 * ```
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';
import type { Notification, NotificationType } from '@/types';

export interface NotificationCardProps {
  /**
   * Notification data
   */
  notification: Notification;

  /**
   * Handler for notification press
   */
  onPress?: () => void;

  /**
   * Handler for dismiss action
   */
  onDismiss?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Get notification icon and color based on type
 */
const getNotificationConfig = (type: NotificationType): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
} => {
  const configs: Record<NotificationType, any> = {
    shop_approved: {
      icon: 'checkmark-circle',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    shop_rejected: {
      icon: 'close-circle',
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.lighter,
    },
    order_status: {
      icon: 'cube',
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.lighter,
    },
    order_confirmed: {
      icon: 'checkmark-done',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    order_delivered: {
      icon: 'checkmark-circle',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    order_cancelled: {
      icon: 'close-circle',
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.lighter,
    },
    route_assigned: {
      icon: 'map',
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.lighter,
    },
    route_reminder: {
      icon: 'alarm',
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.lighter,
    },
    target_reminder: {
      icon: 'flag',
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.lighter,
    },
    target_achieved: {
      icon: 'trophy',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    commission_update: {
      icon: 'cash',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    commission_paid: {
      icon: 'wallet',
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.lighter,
    },
    inventory_update: {
      icon: 'cube-outline',
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.lighter,
    },
    price_update: {
      icon: 'pricetag',
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.lighter,
    },
    promotion: {
      icon: 'gift',
      color: theme.palette.secondary.main,
      backgroundColor: theme.palette.secondary.lighter,
    },
    system: {
      icon: 'settings',
      color: theme.palette.grey[600],
      backgroundColor: theme.palette.grey[200],
    },
    announcement: {
      icon: 'megaphone',
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.lighter,
    },
  };

  return configs[type] || configs.system;
};

/**
 * Format timestamp to relative time
 */
const formatTimestamp = (dateString: string): string => {
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

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * NotificationCard Component
 */
export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDismiss,
  testID,
}) => {
  const config = getNotificationConfig(notification.type);
  const timestamp = formatTimestamp(notification.createdAt);

  /**
   * Handle dismiss action
   */
  const handleDismiss = (e: any) => {
    e?.stopPropagation?.();
    onDismiss?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unreadContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress && !notification.actionable}
      testID={testID}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <View style={styles.unreadDot} />
      )}

      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: config.backgroundColor },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={24}
          color={config.color}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Animated.Text
            style={[
              styles.title,
              !notification.read && styles.unreadTitle,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Animated.Text>

          {/* Timestamp */}
          <Animated.Text style={styles.timestamp}>
            {timestamp}
          </Animated.Text>
        </View>

        {/* Message */}
        <Animated.Text
          style={[
            styles.message,
            !notification.read && styles.unreadMessage,
          ]}
          numberOfLines={2}
        >
          {notification.message}
        </Animated.Text>

        {/* Priority Badge */}
        {notification.priority === 'urgent' && (
          <View style={styles.urgentBadge}>
            <Ionicons
              name="alert-circle"
              size={12}
              color={theme.palette.error.main}
            />
            <Animated.Text style={styles.urgentText}>
              URGENT
            </Animated.Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* Dismiss Button */}
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={20}
              color={theme.palette.text.secondary}
            />
          </TouchableOpacity>
        )}

        {/* Actionable Indicator */}
        {notification.actionable && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.palette.text.secondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.z2,
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: theme.palette.primary.lighter,
    borderLeftWidth: 4,
    borderLeftColor: theme.palette.primary.main,
  },
  unreadDot: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.palette.text.primary,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  message: {
    fontSize: 13,
    color: theme.palette.text.secondary,
    lineHeight: 18,
  },
  unreadMessage: {
    color: theme.palette.text.primary,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    backgroundColor: theme.palette.error.lighter,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs / 2,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.palette.error.main,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[100],
  },
});

export default NotificationCard;
