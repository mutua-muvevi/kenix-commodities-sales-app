/**
 * ProductCard Component
 * Displays product information with add-to-cart functionality.
 *
 * Features:
 * - Product image with placeholder
 * - Product name and category
 * - Wholesale price (KES formatted)
 * - Stock status indicator
 * - Add to cart button with +/- controls
 * - Quantity display
 * - Discount badge
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   quantity={2}
 *   onAdd={() => addToCart(product)}
 *   onRemove={() => removeFromCart(product._id)}
 *   onQuantityChange={(qty) => updateQuantity(product._id, qty)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { theme } from '@/theme';
import type { Product } from '@/types';

export interface ProductCardProps {
  /**
   * Product data
   */
  product: Product;

  /**
   * Current quantity in cart
   * @default 0
   */
  quantity?: number;

  /**
   * Handler for add to cart
   */
  onAdd?: () => void;

  /**
   * Handler for remove from cart
   */
  onRemove?: () => void;

  /**
   * Handler for quantity change
   */
  onQuantityChange?: (quantity: number) => void;

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
 * ProductCard Component
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  onQuantityChange,
  testID,
}) => {
  const hasImage = product.images && product.images.length > 0;
  const isInCart = quantity > 0;

  /**
   * Handle increment
   */
  const handleIncrement = () => {
    if (onQuantityChange) {
      onQuantityChange(quantity + 1);
    } else if (onAdd) {
      onAdd();
    }
  };

  /**
   * Handle decrement
   */
  const handleDecrement = () => {
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(quantity - 1);
    } else if (quantity === 1 && onRemove) {
      onRemove();
    }
  };

  return (
    <Card
      variant="elevated"
      style={styles.card}
      testID={testID}
    >
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
              size={48}
              color={theme.palette.grey[400]}
            />
          </View>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Animated.Text style={styles.discountText}>
              {product.discount.type === 'percentage'
                ? `-${product.discount.value}%`
                : `-KES ${product.discount.value}`}
            </Animated.Text>
          </View>
        )}

        {/* Stock Badge */}
        <View
          style={[
            styles.stockBadge,
            {
              backgroundColor: product.inStock
                ? theme.palette.success.main
                : theme.palette.error.main,
            },
          ]}
        >
          <Animated.Text style={styles.stockText}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Animated.Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Product Name */}
        <Animated.Text
          style={styles.productName}
          numberOfLines={2}
        >
          {product.name}
        </Animated.Text>

        {/* Category & Brand */}
        <View style={styles.metaRow}>
          <Badge variant="secondary" size="small">
            {product.category}
          </Badge>
          {product.brand && (
            <Animated.Text style={styles.brandText}>
              {product.brand}
            </Animated.Text>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Animated.Text style={styles.priceLabel}>
            Wholesale:
          </Animated.Text>
          <Animated.Text style={styles.priceValue}>
            {formatCurrency(product.wholePrice)}
          </Animated.Text>
        </View>

        {/* Unit */}
        <Animated.Text style={styles.unitText}>
          {product.unitOfMeasure}
        </Animated.Text>

        {/* Min Order Quantity */}
        {product.minOrderQuantity && (
          <Animated.Text style={styles.minOrderText}>
            Min order: {product.minOrderQuantity} units
          </Animated.Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!isInCart ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleIncrement}
            disabled={!product.inStock}
            activeOpacity={0.7}
          >
            <Ionicons
              name="cart-outline"
              size={18}
              color={theme.palette.primary.contrastText}
            />
            <Animated.Text style={styles.addButtonText}>
              Add to Cart
            </Animated.Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControls}>
            {/* Decrement */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleDecrement}
              activeOpacity={0.7}
            >
              <Ionicons
                name="remove"
                size={20}
                color={theme.palette.primary.main}
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
                size={20}
                color={theme.palette.primary.main}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
    width: 170,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    position: 'relative',
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
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.palette.error.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.palette.error.contrastText,
  },
  stockBadge: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    gap: theme.spacing.xs / 2,
    marginBottom: theme.spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.palette.text.primary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  brandText: {
    fontSize: 11,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  priceLabel: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.palette.primary.main,
  },
  unitText: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  minOrderText: {
    fontSize: 10,
    color: theme.palette.warning.main,
    fontWeight: '500',
  },
  actionsContainer: {
    width: '100%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.palette.primary.contrastText,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.palette.background.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
});

export default ProductCard;
