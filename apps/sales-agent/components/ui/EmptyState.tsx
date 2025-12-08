/**
 * EmptyState Component
 * A component to display when a list or view has no data.
 *
 * Features:
 * - Icon support via Ionicons
 * - Title and description text
 * - Optional action button
 * - Centered layout
 * - Theme-aware styling
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="file-tray-outline"
 *   title="No Orders Yet"
 *   description="You haven't placed any orders yet. Start by visiting shops in your route."
 *   actionLabel="View Routes"
 *   onAction={() => navigation.navigate('Routes')}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  /**
   * Ionicons icon name
   * @default 'file-tray-outline'
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Icon size
   * @default 64
   */
  iconSize?: number;

  /**
   * Icon color
   */
  iconColor?: string;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text (optional)
   */
  description?: string;

  /**
   * Action button label (optional)
   */
  actionLabel?: string;

  /**
   * Action button press handler
   */
  onAction?: () => void;

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
 * EmptyState Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  iconSize = 64,
  iconColor = theme.palette.grey[400],
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
      accessibilityRole="text"
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </View>

      {/* Title */}
      <Animated.Text style={styles.title}>{title}</Animated.Text>

      {/* Description */}
      {description && (
        <Animated.Text style={styles.description}>
          {description}
        </Animated.Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <Button
            variant="primary"
            size="medium"
            onPress={onAction}
            style={styles.actionButton}
          >
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },
  title: {
    ...theme.typography.h5,
    color: theme.palette.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  description: {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
    maxWidth: 300,
  },
  actionContainer: {
    marginTop: theme.spacing.md,
  },
  actionButton: {
    minWidth: 150,
  },
});

export default EmptyState;
