/**
 * StatusBadge Component
 * A specialized badge component for displaying order/route status with icons and colors.
 *
 * Features:
 * - Auto-color mapping based on status
 * - Icon + text combination
 * - Two sizes (small, medium)
 * - Theme-aware styling
 * - Supports order and route statuses
 *
 * @example
 * ```tsx
 * <StatusBadge status="delivered" />
 * <StatusBadge status="pending" size="small" />
 * <StatusBadge status="in_progress" />
 * ```
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import type { OrderStatus } from '@/types';

type RouteStatus = 'pending' | 'in_progress' | 'completed';

export type BadgeStatus = OrderStatus | RouteStatus;

export interface StatusBadgeProps {
  /**
   * Status value
   */
  status: BadgeStatus;

  /**
   * Badge size
   * @default 'medium'
   */
  size?: 'small' | 'medium';

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Status configuration mapping
 */
interface StatusConfig {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

/**
 * Get status configuration
 */
const getStatusConfig = (status: BadgeStatus): StatusConfig => {
  const statusMap: Record<string, StatusConfig> = {
    // Order statuses
    pending: {
      label: 'Pending',
      icon: 'time-outline',
      color: theme.palette.warning.dark,
      backgroundColor: theme.palette.warning.lighter,
    },
    confirmed: {
      label: 'Confirmed',
      icon: 'checkmark-circle-outline',
      color: theme.palette.info.dark,
      backgroundColor: theme.palette.info.lighter,
    },
    processing: {
      label: 'Processing',
      icon: 'sync-outline',
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.secondary.lighter,
    },
    approved: {
      label: 'Approved',
      icon: 'checkmark-done-outline',
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.lighter,
    },
    rejected: {
      label: 'Rejected',
      icon: 'close-circle-outline',
      color: theme.palette.error.dark,
      backgroundColor: theme.palette.error.lighter,
    },
    ready_for_dispatch: {
      label: 'Ready',
      icon: 'cube-outline',
      color: theme.palette.info.dark,
      backgroundColor: theme.palette.info.lighter,
    },
    dispatched: {
      label: 'Dispatched',
      icon: 'send-outline',
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.secondary.lighter,
    },
    in_transit: {
      label: 'In Transit',
      icon: 'car-outline',
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.secondary.lighter,
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      icon: 'bicycle-outline',
      color: theme.palette.primary.dark,
      backgroundColor: theme.palette.primary.lighter,
    },
    shipped: {
      label: 'Shipped',
      icon: 'airplane-outline',
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.secondary.lighter,
    },
    delivered: {
      label: 'Delivered',
      icon: 'checkmark-done-circle-outline',
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.lighter,
    },
    cancelled: {
      label: 'Cancelled',
      icon: 'close-outline',
      color: theme.palette.grey[700],
      backgroundColor: theme.palette.grey[200],
    },
    failed: {
      label: 'Failed',
      icon: 'alert-circle-outline',
      color: theme.palette.error.dark,
      backgroundColor: theme.palette.error.lighter,
    },

    // Route statuses
    in_progress: {
      label: 'In Progress',
      icon: 'navigate-outline',
      color: theme.palette.primary.dark,
      backgroundColor: theme.palette.primary.lighter,
    },
    completed: {
      label: 'Completed',
      icon: 'checkmark-circle-outline',
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.lighter,
    },
  };

  return (
    statusMap[status] || {
      label: status,
      icon: 'information-circle-outline',
      color: theme.palette.grey[700],
      backgroundColor: theme.palette.grey[200],
    }
  );
};

/**
 * StatusBadge Component
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  style,
  testID,
}) => {
  const config = getStatusConfig(status);

  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconSize: number;
  } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: theme.spacing.xs / 2,
            paddingHorizontal: theme.spacing.xs,
            minHeight: 20,
            gap: theme.spacing.xs / 2,
          },
          text: {
            fontSize: 10,
            lineHeight: 14,
          },
          iconSize: 12,
        };

      case 'medium':
      default:
        return {
          container: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            minHeight: 26,
            gap: theme.spacing.xs,
          },
          text: {
            fontSize: 12,
            lineHeight: 16,
          },
          iconSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
      testID={testID}
    >
      <Ionicons
        name={config.icon}
        size={sizeStyles.iconSize}
        color={config.color}
      />
      <Animated.Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: config.color },
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatusBadge;
