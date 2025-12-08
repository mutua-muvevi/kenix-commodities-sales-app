/**
 * ProgressBar Component
 * Animated progress bar with current/target display.
 *
 * Features:
 * - Animated progress bar
 * - Current/Target display
 * - Percentage option
 * - Custom color support
 * - Smooth animations via reanimated
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   current={75}
 *   target={100}
 *   label="Monthly Target"
 *   showPercentage={true}
 *   color={theme.palette.success.main}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';

export interface ProgressBarProps {
  /**
   * Current value
   */
  current: number;

  /**
   * Target value
   */
  target: number;

  /**
   * Progress label (optional)
   */
  label?: string;

  /**
   * Show percentage
   * @default true
   */
  showPercentage?: boolean;

  /**
   * Progress bar color
   * @default theme.palette.primary.main
   */
  color?: string;

  /**
   * Progress bar height
   * @default 12
   */
  height?: number;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * ProgressBar Component
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  showPercentage = true,
  color = theme.palette.primary.main,
  height = 12,
  testID,
}) => {
  // Calculate percentage
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  // Animated width value
  const width = useSharedValue(0);

  // Animate width on mount and when percentage changes
  useEffect(() => {
    width.value = withSpring(percentage, {
      damping: 15,
      stiffness: 80,
    });
  }, [percentage]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  // Determine bar color based on progress
  const getBarColor = (): string => {
    if (percentage >= 100) return theme.palette.success.main;
    if (percentage >= 75) return color;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const barColor = getBarColor();

  return (
    <View style={styles.container} testID={testID}>
      {/* Header Row */}
      {(label || showPercentage) && (
        <View style={styles.headerRow}>
          {label && (
            <Animated.Text style={styles.label}>
              {label}
            </Animated.Text>
          )}

          {showPercentage && (
            <Animated.Text style={[styles.percentage, { color: barColor }]}>
              {Math.round(percentage)}%
            </Animated.Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          { height },
        ]}
      >
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              animatedStyle,
              { backgroundColor: barColor },
            ]}
          />
        </View>
      </View>

      {/* Values Row */}
      <View style={styles.valuesRow}>
        <Animated.Text style={styles.currentValue}>
          Current: {current.toLocaleString()}
        </Animated.Text>

        <Animated.Text style={styles.targetValue}>
          Target: {target.toLocaleString()}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.palette.text.primary,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.palette.text.primary,
  },
  targetValue: {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
});

export default ProgressBar;
