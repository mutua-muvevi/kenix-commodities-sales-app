/**
 * CartItem Component
 * Displays cart item with quantity controls and line total.
 *
 * Features:
 * - Product info (name, unit)
 * - Quantity controls (+/-)
 * - Line total calculation
 * - Remove button
 * - Compact horizontal layout
 *
 * @example
 * ```tsx
 * <CartItem
 *   item={cartItem}
 *   onQuantityChange={(qty) => updateQuantity(item.product._id, qty)}
 *   onRemove={() => removeFromCart(item.product._id)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';
import type { CartItem as CartItemType } from '@/types';

export interface CartItemProps {
  /**
   * Cart item data
   */
  item: CartItemType;

  /**
   * Handler for quantity change
   */
  onQuantityChange?: (quantity: number) => void;

  /**
   * Handler for remove item
   */
  onRemove?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Format currency in KES
 */
const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString('en-KE')}`;
};

/**
 * CartItem Component
 */
export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  testID,
}) => {
  const { product, quantity, subtotal } = item;
  const hasImage = product.images && product.images.length > 0;

  /**
   * Handle increment
   */
  const handleIncrement = () => {
    onQuantityChange?.(quantity + 1);
  };

  /**
   * Handle decrement
   */
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange?.(quantity - 1);
    } else {
      onRemove?.();
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: product.images![0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={24}
              color={theme.palette.grey[400]}
            />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Animated.Text
          style={styles.productName}
          numberOfLines={2}
        >
          {product.name}
        </Animated.Text>

        <Animated.Text style={styles.unitText}>
          {product.unitOfMeasure}
        </Animated.Text>

        <Animated.Text style={styles.priceText}>
          {formatCurrency(product.wholePrice)} each
        </Animated.Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightContainer}>
        {/* Quantity Controls */}
        <View style={styles.quantityControls}>
          {/* Decrement */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleDecrement}
            activeOpacity={0.7}
          >
            <Ionicons
              name={quantity === 1 ? 'trash-outline' : 'remove'}
              size={16}
              color={
                quantity === 1
                  ? theme.palette.error.main
                  : theme.palette.primary.main
              }
            />
          </TouchableOpacity>

          {/* Quantity Display */}
          <View style={styles.quantityDisplay}>
            <Animated.Text style={styles.quantityText}>
              {quantity}
            </Animated.Text>
          </View>

          {/* Increment */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleIncrement}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add"
              size={16}
              color={theme.palette.primary.main}
            />
          </TouchableOpacity>
        </View>

        {/* Subtotal */}
        <Animated.Text style={styles.subtotalText}>
          {formatCurrency(subtotal)}
        </Animated.Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <Ionicons
          name="close-circle"
          size={20}
          color={theme.palette.error.main}
        />
      </TouchableOpacity>
    </View>
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
    gap: theme.spacing.sm,
    ...theme.shadows.z2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.grey[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.palette.text.primary,
    lineHeight: 18,
  },
  unitText: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  priceText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs / 2,
    gap: theme.spacing.xs,
  },
  controlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.palette.background.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    minWidth: 32,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  subtotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.palette.primary.main,
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
});

export default CartItem;
