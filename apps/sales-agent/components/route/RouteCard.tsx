/**
 * RouteCard Component
 * Displays route summary with progress and actions.
 *
 * Features:
 * - Route name and date
 * - Progress indicator (visited/total shops)
 * - Status badge
 * - Total shops count
 * - Start Route button (if not started)
 * - View Details button
 * - Visual progress bar
 *
 * @example
 * ```tsx
 * <RouteCard
 *   route={route}
 *   onPress={() => navigate(`/routes/${route._id}`)}
 *   onStart={() => startRoute(route._id)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';
import type { Route } from '@/types';

export interface RouteCardProps {
  /**
   * Route data
   */
  route: Route;

  /**
   * Handler for card press
   */
  onPress?: () => void;

  /**
   * Handler for start route action
   */
  onStart?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Format date to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * RouteCard Component
 */
export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onPress,
  onStart,
  testID,
}) => {
  const progress = route.totalShops > 0
    ? (route.completedShops / route.totalShops) * 100
    : 0;

  const canStart = route.status === 'planned';
  const isInProgress = route.status === 'in_progress';

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={styles.card}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="map-outline"
            size={20}
            color={theme.palette.primary.main}
          />
          <Animated.Text
            style={styles.routeName}
            numberOfLines={2}
          >
            {route.name}
          </Animated.Text>
        </View>

        <StatusBadge status={route.status} size="small" />
      </View>

      {/* Date and Time */}
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-outline"
          size={14}
          color={theme.palette.text.secondary}
        />
        <Animated.Text style={styles.dateText}>
          {formatDate(route.scheduledDate)}
        </Animated.Text>
        {route.estimatedDuration && (
          <>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.palette.text.secondary}
              style={styles.timeIcon}
            />
            <Animated.Text style={styles.dateText}>
              ~{Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
            </Animated.Text>
          </>
        )}
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Animated.Text style={styles.progressLabel}>
            Progress
          </Animated.Text>
          <Animated.Text style={styles.progressValue}>
            {route.completedShops}/{route.totalShops} shops
          </Animated.Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor:
                    progress === 100
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                },
              ]}
            />
          </View>
          <Animated.Text style={styles.progressPercentage}>
            {Math.round(progress)}%
          </Animated.Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Total Shops */}
        <View style={styles.metric}>
          <Ionicons
            name="storefront-outline"
            size={16}
            color={theme.palette.info.main}
          />
          <Animated.Text style={styles.metricValue}>
            {route.totalShops}
          </Animated.Text>
          <Animated.Text style={styles.metricLabel}>
            Shops
          </Animated.Text>
        </View>

        {/* Distance */}
        {route.totalDistance && (
          <View style={styles.metric}>
            <Ionicons
              name="navigate-outline"
              size={16}
              color={theme.palette.warning.main}
            />
            <Animated.Text style={styles.metricValue}>
              {route.totalDistance.toFixed(1)}
            </Animated.Text>
            <Animated.Text style={styles.metricLabel}>
              km
            </Animated.Text>
          </View>
        )}

        {/* Completed */}
        <View style={styles.metric}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={theme.palette.success.main}
          />
          <Animated.Text style={styles.metricValue}>
            {route.completedShops}
          </Animated.Text>
          <Animated.Text style={styles.metricLabel}>
            Done
          </Animated.Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {canStart && onStart && (
          <Button
            variant="primary"
            size="medium"
            leftIcon={
              <Ionicons
                name="play"
                size={18}
                color={theme.palette.primary.contrastText}
              />
            }
            onPress={(e) => {
              e?.stopPropagation?.();
              onStart();
            }}
            fullWidth
          >
            Start Route
          </Button>
        )}

        {isInProgress && (
          <Button
            variant="secondary"
            size="medium"
            leftIcon={
              <Ionicons
                name="eye-outline"
                size={18}
                color={theme.palette.secondary.contrastText}
              />
            }
            onPress={onPress}
            fullWidth
          >
            View Details
          </Button>
        )}

        {!canStart && !isInProgress && (
          <Button
            variant="outlined"
            size="medium"
            leftIcon={
              <Ionicons
                name="eye-outline"
                size={18}
                color={theme.palette.primary.main}
              />
            }
            onPress={onPress}
            fullWidth
          >
            View Details
          </Button>
        )}
      </View>

      {/* Description */}
      {route.description && (
        <View style={styles.descriptionContainer}>
          <Animated.Text
            style={styles.descriptionText}
            numberOfLines={2}
          >
            {route.description}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  routeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.palette.text.primary,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
  timeIcon: {
    marginLeft: theme.spacing.sm,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.palette.text.secondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.palette.text.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.borderRadius.md,
  },
  metric: {
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.palette.text.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  actionsContainer: {
    marginBottom: theme.spacing.sm,
  },
  descriptionContainer: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
  descriptionText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    lineHeight: 16,
  },
});

export default RouteCard;
