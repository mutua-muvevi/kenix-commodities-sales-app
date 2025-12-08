/**
 * QuickActionCard Component
 * Displays a quick action button with icon and description.
 *
 * Features:
 * - Icon with colored background
 * - Title and description
 * - Full-width tap area
 * - Arrow indicator
 * - Press feedback
 * - Gradient background option
 *
 * @example
 * ```tsx
 * <QuickActionCard
 *   title="Register Shop"
 *   description="Add a new shop to your route"
 *   icon="add-circle"
 *   iconColor={theme.palette.success.main}
 *   onPress={() => navigate('/shops/register')}
 * />
 * ```
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';

export interface QuickActionCardProps {
  /**
   * Action title
   */
  title: string;

  /**
   * Action description (optional)
   */
  description?: string;

  /**
   * Icon name from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Icon color
   * @default theme.palette.primary.main
   */
  iconColor?: string;

  /**
   * Background color
   * @default theme.palette.background.default
   */
  backgroundColor?: string;

  /**
   * Handler for press
   */
  onPress: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * QuickActionCard Component
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  iconColor = theme.palette.primary.main,
  backgroundColor = theme.palette.background.default,
  onPress,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${iconColor}15` },
        ]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.Text style={styles.title}>
          {title}
        </Animated.Text>

        {description && (
          <Animated.Text
            style={styles.description}
            numberOfLines={2}
          >
            {description}
          </Animated.Text>
        )}
      </View>

      {/* Arrow Indicator */}
      <Ionicons
        name="chevron-forward"
        size={24}
        color={theme.palette.text.secondary}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.xs,
    gap: theme.spacing.md,
    ...theme.shadows.z4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  description: {
    fontSize: 13,
    color: theme.palette.text.secondary,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 'auto',
  },
});

export default QuickActionCard;
