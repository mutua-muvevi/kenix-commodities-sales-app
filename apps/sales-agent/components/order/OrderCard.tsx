/**
 * OrderCard Component
 * Displays order summary information in a card format.
 *
 * Features:
 * - Order number/ID display
 * - Formatted order date
 * - Status badge
 * - Shop name
 * - Item count
 * - Total amount (KES formatted)
 * - Press feedback for navigation
 *
 * @example
 * ```tsx
 * <OrderCard
 *   order={order}
 *   onPress={() => navigate(`/orders/${order._id}`)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { theme } from '@/theme';
import type { Order } from '@/types';

export interface OrderCardProps {
  /**
   * Order data
   */
  order: Order;

  /**
   * Handler for card press
   */
  onPress?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Format currency in KES
 */
const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date to readable format
 */
const formatDate = (dateString: string): string => {
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
    year: 'numeric',
  });
};

/**
 * Get shop name from order
 */
const getShopName = (order: Order): string => {
  if (typeof order.shop === 'string') {
    return 'Unknown Shop';
  }
  return order.shop.shopName || 'Unknown Shop';
};

/**
 * OrderCard Component
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  testID,
}) => {
  const shopName = getShopName(order);
  const itemCount = order.products.length;

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={styles.card}
      testID={testID}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.orderIdContainer}>
          <Ionicons
            name="receipt-outline"
            size={16}
            color={theme.palette.primary.main}
          />
          <Animated.Text style={styles.orderId}>
            {order.orderId}
          </Animated.Text>
        </View>

        <StatusBadge status={order.status} size="small" />
      </View>

      {/* Shop Name */}
      <View style={styles.shopRow}>
        <Ionicons
          name="storefront-outline"
          size={14}
          color={theme.palette.text.secondary}
        />
        <Animated.Text
          style={styles.shopName}
          numberOfLines={1}
        >
          {shopName}
        </Animated.Text>
      </View>

      {/* Order Details */}
      <View style={styles.detailsContainer}>
        {/* Item Count */}
        <View style={styles.detailRow}>
          <Ionicons
            name="cube-outline"
            size={14}
            color={theme.palette.text.secondary}
          />
          <Animated.Text style={styles.detailLabel}>
            Items:
          </Animated.Text>
          <Animated.Text style={styles.detailValue}>
            {itemCount}
          </Animated.Text>
        </View>

        {/* Total Amount */}
        <View style={styles.detailRow}>
          <Ionicons
            name="cash-outline"
            size={14}
            color={theme.palette.success.main}
          />
          <Animated.Text style={styles.detailLabel}>
            Total:
          </Animated.Text>
          <Animated.Text style={styles.totalAmount}>
            {formatCurrency(order.finalPrice)}
          </Animated.Text>
        </View>
      </View>

      {/* Footer Row */}
      <View style={styles.footerRow}>
        {/* Payment Status */}
        <View style={styles.paymentBadge}>
          <Ionicons
            name={
              order.paymentStatus === 'paid'
                ? 'checkmark-circle'
                : 'time-outline'
            }
            size={12}
            color={
              order.paymentStatus === 'paid'
                ? theme.palette.success.main
                : theme.palette.warning.main
            }
          />
          <Animated.Text
            style={[
              styles.paymentText,
              {
                color:
                  order.paymentStatus === 'paid'
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
              },
            ]}
          >
            {order.paymentStatus}
          </Animated.Text>
        </View>

        {/* Date */}
        <Animated.Text style={styles.dateText}>
          {formatDate(order.createdAt)}
        </Animated.Text>
      </View>

      {/* Delivery Date (if exists) */}
      {order.deliveryDate && (
        <View style={styles.deliveryRow}>
          <Ionicons
            name="calendar-outline"
            size={12}
            color={theme.palette.info.main}
          />
          <Animated.Text style={styles.deliveryText}>
            Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-KE')}
          </Animated.Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  shopName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.palette.text.secondary,
  },
  detailsContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.palette.text.primary,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.palette.success.main,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.borderRadius.sm,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
  deliveryText: {
    fontSize: 11,
    color: theme.palette.info.main,
    fontWeight: '500',
  },
});

export default OrderCard;
