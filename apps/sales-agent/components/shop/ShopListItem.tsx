/**
 * ShopListItem Component
 * Compact list item for route view showing shop in sequence.
 *
 * Features:
 * - Index number badge
 * - Shop name and status
 * - Visit status indicator
 * - Chevron right for navigation
 * - Compact design for list view
 *
 * @example
 * ```tsx
 * <ShopListItem
 *   shop={shop}
 *   index={1}
 *   onPress={() => navigate(`/shops/${shop._id}`)}
 *   showActions={true}
 * />
 * ```
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { theme } from '@/theme';
import type { Shop } from '@/types';

export interface ShopListItemProps {
  /**
   * Shop data
   */
  shop: Shop;

  /**
   * Position index in route
   */
  index: number;

  /**
   * Handler for item press
   */
  onPress?: () => void;

  /**
   * Show action buttons
   * @default false
   */
  showActions?: boolean;

  /**
   * Visit status (for route shops)
   */
  visitStatus?: 'pending' | 'visited' | 'skipped' | 'failed';

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Get visit status indicator
 */
const getVisitIndicator = (status?: string) => {
  switch (status) {
    case 'visited':
      return {
        icon: 'checkmark-circle' as const,
        color: theme.palette.success.main,
      };
    case 'skipped':
      return {
        icon: 'remove-circle' as const,
        color: theme.palette.warning.main,
      };
    case 'failed':
      return {
        icon: 'close-circle' as const,
        color: theme.palette.error.main,
      };
    case 'pending':
    default:
      return {
        icon: 'ellipse-outline' as const,
        color: theme.palette.grey[400],
      };
  }
};

/**
 * ShopListItem Component
 */
export const ShopListItem: React.FC<ShopListItemProps> = ({
  shop,
  index,
  onPress,
  showActions = false,
  visitStatus,
  testID,
}) => {
  const visitIndicator = getVisitIndicator(visitStatus);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      testID={testID}
    >
      {/* Index Badge */}
      <View style={styles.indexBadge}>
        <Animated.Text style={styles.indexText}>
          {index}
        </Animated.Text>
      </View>

      {/* Shop Info */}
      <View style={styles.infoContainer}>
        <Animated.Text
          style={styles.shopName}
          numberOfLines={1}
        >
          {shop.shopName}
        </Animated.Text>

        <View style={styles.detailsRow}>
          {/* Shop Status */}
          <StatusBadge status={shop.approvalStatus} size="small" />

          {/* Visit Status Indicator */}
          {visitStatus && (
            <View style={styles.visitIndicator}>
              <Ionicons
                name={visitIndicator.icon}
                size={16}
                color={visitIndicator.color}
              />
              <Animated.Text
                style={[
                  styles.visitStatusText,
                  { color: visitIndicator.color },
                ]}
              >
                {visitStatus}
              </Animated.Text>
            </View>
          )}
        </View>

        {/* Address */}
        {shop.address && (
          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={theme.palette.text.secondary}
            />
            <Animated.Text
              style={styles.addressText}
              numberOfLines={1}
            >
              {[shop.address.area, shop.address.city]
                .filter(Boolean)
                .join(', ') || 'No address'}
            </Animated.Text>
          </View>
        )}
      </View>

      {/* Chevron Icon */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.palette.text.secondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.z2,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.palette.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.palette.primary.contrastText,
  },
  infoContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.palette.text.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  visitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  visitStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  addressText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    flex: 1,
  },
});

export default ShopListItem;
