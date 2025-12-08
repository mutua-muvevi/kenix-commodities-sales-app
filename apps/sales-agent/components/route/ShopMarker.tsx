/**
 * ShopMarker Component
 * Custom marker for map displaying shop with visit status.
 *
 * Features:
 * - Color by visit status (green=visited, yellow=current, gray=pending)
 * - Index number badge
 * - Shop name callout
 * - Press feedback
 *
 * @example
 * ```tsx
 * <ShopMarker
 *   shop={routeShop}
 *   index={1}
 *   onPress={() => navigate(`/shops/${shop._id}`)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';
import type { RouteShop, Shop } from '@/types';

export interface ShopMarkerProps {
  /**
   * Route shop data
   */
  shop: RouteShop;

  /**
   * Shop index/order in route
   */
  index: number;

  /**
   * Handler for marker press
   */
  onPress?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Get marker color based on visit status
 */
const getMarkerColor = (visitStatus?: string): string => {
  switch (visitStatus) {
    case 'visited':
      return theme.palette.success.main;
    case 'skipped':
      return theme.palette.warning.light;
    case 'failed':
      return theme.palette.error.main;
    case 'pending':
    default:
      return theme.palette.grey[400];
  }
};

/**
 * Get shop name from RouteShop
 */
const getShopName = (shop: RouteShop): string => {
  if (typeof shop.shop === 'string') {
    return `Shop ${shop.order}`;
  }
  return (shop.shop as Shop).shopName || `Shop ${shop.order}`;
};

/**
 * ShopMarker Component
 */
export const ShopMarker: React.FC<ShopMarkerProps> = ({
  shop,
  index,
  onPress,
  testID,
}) => {
  if (!shop.location) return null;

  const markerColor = getMarkerColor(shop.visitStatus);
  const shopName = getShopName(shop);
  const isCurrent = shop.visitStatus === 'pending' && index === 1;

  return (
    <Marker
      coordinate={{
        latitude: shop.location.latitude,
        longitude: shop.location.longitude,
      }}
      onPress={onPress}
      testID={testID}
    >
      {/* Custom Marker View */}
      <View style={styles.markerContainer}>
        {/* Marker Pin */}
        <View
          style={[
            styles.markerPin,
            {
              backgroundColor: markerColor,
              borderColor: isCurrent
                ? theme.palette.warning.main
                : markerColor,
              borderWidth: isCurrent ? 3 : 0,
            },
          ]}
        >
          {/* Index Number */}
          <Animated.Text style={styles.indexText}>
            {index}
          </Animated.Text>

          {/* Visit Status Icon */}
          {shop.visitStatus === 'visited' && (
            <View style={styles.statusIcon}>
              <Ionicons
                name="checkmark"
                size={10}
                color="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Pin Pointer */}
        <View
          style={[
            styles.markerPointer,
            { borderTopColor: markerColor },
          ]}
        />
      </View>

      {/* Callout */}
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          {/* Shop Name */}
          <Animated.Text style={styles.calloutTitle}>
            {shopName}
          </Animated.Text>

          {/* Visit Status */}
          <View style={styles.calloutRow}>
            <Ionicons
              name={
                shop.visitStatus === 'visited'
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              size={14}
              color={markerColor}
            />
            <Animated.Text style={styles.calloutText}>
              {shop.visitStatus || 'pending'}
            </Animated.Text>
          </View>

          {/* Order Placed */}
          {shop.orderPlaced && (
            <View style={styles.calloutRow}>
              <Ionicons
                name="cart"
                size={14}
                color={theme.palette.success.main}
              />
              <Animated.Text style={styles.calloutText}>
                Order Placed
              </Animated.Text>
            </View>
          )}

          {/* Distance */}
          {shop.distanceFromPrevious && (
            <View style={styles.calloutRow}>
              <Ionicons
                name="navigate"
                size={14}
                color={theme.palette.info.main}
              />
              <Animated.Text style={styles.calloutText}>
                {shop.distanceFromPrevious.toFixed(1)} km from previous
              </Animated.Text>
            </View>
          )}

          {/* Notes */}
          {shop.notes && (
            <Animated.Text
              style={styles.calloutNotes}
              numberOfLines={2}
            >
              {shop.notes}
            </Animated.Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.z4,
    position: 'relative',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.palette.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  calloutContainer: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
    maxWidth: 280,
    gap: theme.spacing.xs,
    ...theme.shadows.z8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  calloutText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    textTransform: 'capitalize',
  },
  calloutNotes: {
    fontSize: 11,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs / 2,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
});

export default ShopMarker;
