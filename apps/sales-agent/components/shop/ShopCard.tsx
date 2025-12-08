/**
 * ShopCard Component
 * Grid card layout displaying shop information with action buttons.
 *
 * Features:
 * - Shop photo with fallback avatar
 * - Shop name and owner name
 * - Approval status badge
 * - Phone number with call action
 * - Address preview
 * - Place Order button (approved shops only)
 * - Press feedback for navigation
 *
 * @example
 * ```tsx
 * <ShopCard
 *   shop={shop}
 *   onPress={() => navigate(`/shops/${shop._id}`)}
 *   onCall={() => Linking.openURL(`tel:${shop.phoneNumber}`)}
 *   onPlaceOrder={() => navigate(`/orders/create?shopId=${shop._id}`)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { theme } from '@/theme';
import type { Shop } from '@/types';

export interface ShopCardProps {
  /**
   * Shop data
   */
  shop: Shop;

  /**
   * Handler for card press (navigation)
   */
  onPress?: () => void;

  /**
   * Handler for call button
   */
  onCall?: () => void;

  /**
   * Handler for place order button
   */
  onPlaceOrder?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * ShopCard Component
 */
export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  onPress,
  onCall,
  onPlaceOrder,
  testID,
}) => {
  /**
   * Handle call action
   */
  const handleCall = (e: any) => {
    e?.stopPropagation?.();
    if (onCall) {
      onCall();
    } else {
      Linking.openURL(`tel:${shop.phoneNumber}`);
    }
  };

  /**
   * Handle place order action
   */
  const handlePlaceOrder = (e: any) => {
    e?.stopPropagation?.();
    onPlaceOrder?.();
  };

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={styles.card}
      testID={testID}
    >
      {/* Shop Photo */}
      <View style={styles.imageContainer}>
        <Avatar
          source={shop.shopPhoto ? { uri: shop.shopPhoto } : undefined}
          name={shop.shopName}
          size={120}
          shape="rounded"
        />
      </View>

      {/* Shop Info */}
      <View style={styles.infoContainer}>
        {/* Shop Name */}
        <Animated.Text
          style={styles.shopName}
          numberOfLines={1}
        >
          {shop.shopName}
        </Animated.Text>

        {/* Owner Name */}
        <View style={styles.ownerRow}>
          <Ionicons
            name="person-outline"
            size={14}
            color={theme.palette.text.secondary}
          />
          <Animated.Text
            style={styles.ownerName}
            numberOfLines={1}
          >
            {shop.name}
          </Animated.Text>
        </View>

        {/* Status Badge */}
        <StatusBadge status={shop.approvalStatus} size="small" />

        {/* Phone Number */}
        <View style={styles.phoneRow}>
          <Ionicons
            name="call-outline"
            size={14}
            color={theme.palette.primary.main}
          />
          <Animated.Text
            style={styles.phoneText}
            numberOfLines={1}
          >
            {shop.phoneNumber}
          </Animated.Text>
        </View>

        {/* Address */}
        {shop.address && (
          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.palette.text.secondary}
            />
            <Animated.Text
              style={styles.addressText}
              numberOfLines={2}
            >
              {[shop.address.area, shop.address.city]
                .filter(Boolean)
                .join(', ') || 'No address'}
            </Animated.Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Call Button */}
        <Button
          variant="outlined"
          size="small"
          leftIcon={
            <Ionicons
              name="call"
              size={16}
              color={theme.palette.primary.main}
            />
          }
          onPress={handleCall}
          style={styles.callButton}
        >
          Call
        </Button>

        {/* Place Order Button - Only for approved shops */}
        {shop.approvalStatus === 'approved' && (
          <Button
            variant="primary"
            size="small"
            leftIcon={
              <Ionicons
                name="cart"
                size={16}
                color={theme.palette.primary.contrastText}
              />
            }
            onPress={handlePlaceOrder}
            style={styles.orderButton}
          >
            Order
          </Button>
        )}
      </View>

      {/* Customer Segment Badge */}
      {shop.customerSegment && (
        <View style={styles.segmentBadge}>
          <Animated.Text style={styles.segmentText}>
            {shop.customerSegment.toUpperCase()}
          </Animated.Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: theme.palette.primary.main,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: theme.palette.text.secondary,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
  },
  orderButton: {
    flex: 1,
  },
  segmentBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.palette.secondary.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.palette.secondary.contrastText,
    letterSpacing: 0.5,
  },
});

export default ShopCard;
