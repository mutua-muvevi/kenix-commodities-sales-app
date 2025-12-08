/**
 * StatCard Component
 * Displays a statistic with optional trend indicator.
 *
 * Features:
 * - Large value display
 * - Descriptive title
 * - Icon with background color
 * - Optional trend indicator (arrow up/down)
 * - Press feedback
 * - Animated entrance
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Orders Today"
 *   value={12}
 *   icon="cart"
 *   iconColor={theme.palette.primary.main}
 *   trend="up"
 *   trendValue="+15%"
 *   onPress={() => navigate('/orders')}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';

export interface StatCardProps {
  /**
   * Statistic title
   */
  title: string;

  /**
   * Statistic value (number or string)
   */
  value: string | number;

  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Icon color
   * @default theme.palette.primary.main
   */
  iconColor?: string;

  /**
   * Trend direction
   */
  trend?: 'up' | 'down' | 'neutral';

  /**
   * Trend value text
   */
  trendValue?: string;

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
 * Get trend icon and color
 */
const getTrendConfig = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return {
        icon: 'trending-up' as const,
        color: theme.palette.success.main,
      };
    case 'down':
      return {
        icon: 'trending-down' as const,
        color: theme.palette.error.main,
      };
    case 'neutral':
    default:
      return {
        icon: 'remove' as const,
        color: theme.palette.grey[500],
      };
  }
};

/**
 * StatCard Component
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = theme.palette.primary.main,
  trend,
  trendValue,
  onPress,
  testID,
}) => {
  const trendConfig = getTrendConfig(trend);
  const isClickable = !!onPress;

  const CardContainer = isClickable ? TouchableOpacity : View;

  return (
    <CardContainer
      style={styles.container}
      onPress={onPress}
      activeOpacity={isClickable ? 0.7 : 1}
      testID={testID}
    >
      {/* Icon Section */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}15` },
          ]}
        >
          <Ionicons
            name={icon}
            size={28}
            color={iconColor}
          />
        </View>
      )}

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Animated.Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>

        {/* Value Row */}
        <View style={styles.valueRow}>
          <Animated.Text style={styles.value}>
            {value}
          </Animated.Text>

          {/* Trend Indicator */}
          {trend && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: `${trendConfig.color}15` },
              ]}
            >
              <Ionicons
                name={trendConfig.icon}
                size={14}
                color={trendConfig.color}
              />
              {trendValue && (
                <Animated.Text
                  style={[
                    styles.trendValue,
                    { color: trendConfig.color },
                  ]}
                >
                  {trendValue}
                </Animated.Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Arrow Indicator (if clickable) */}
      {isClickable && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.palette.text.secondary}
          style={styles.arrow}
        />
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.xs,
    gap: theme.spacing.md,
    ...theme.shadows.z4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: 'auto',
  },
});

export default StatCard;
