/**
 * Card Component
 * A flexible container component with elevation and press feedback.
 *
 * Features:
 * - Multiple variants (default, elevated, outlined)
 * - Optional press feedback
 * - Theme-aware shadows
 * - Customizable styling
 * - Press animations
 *
 * @example
 * ```tsx
 * <Card variant="elevated" onPress={() => console.log('Pressed')}>
 *   <Text>Card Content</Text>
 * </Card>
 * ```
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface CardProps {
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined';

  /**
   * Press handler - makes card touchable
   */
  onPress?: (event: GestureResponderEvent) => void;

  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Disable card interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Card Component
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  onPress,
  children,
  style,
  disabled = false,
  testID,
  accessibilityLabel,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(getInitialElevation(variant));

  // Get initial elevation based on variant
  function getInitialElevation(v: 'default' | 'elevated' | 'outlined'): number {
    switch (v) {
      case 'elevated':
        return 8;
      case 'outlined':
        return 0;
      case 'default':
      default:
        return 4;
    }
  }

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale down animation
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 400,
    });

    // Reduce elevation
    elevation.value = withTiming(2, { duration: 150 });
  }, [disabled, onPress, scale, elevation]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    if (disabled || !onPress) return;

    // Scale back animation
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 400,
    });

    // Restore elevation
    const initialElevation = getInitialElevation(variant);
    elevation.value = withTiming(initialElevation, { duration: 150 });
  }, [disabled, onPress, scale, elevation, variant]);

  // Handle press
  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (disabled || !onPress) return;

      // Medium haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress(event);
    },
    [disabled, onPress]
  );

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.palette.background.default,
          ...theme.shadows.z8,
        };

      case 'outlined':
        return {
          backgroundColor: theme.palette.background.default,
          borderWidth: 1,
          borderColor: theme.palette.divider,
        };

      case 'default':
      default:
        return {
          backgroundColor: theme.palette.background.default,
          ...theme.shadows.z4,
        };
    }
  };

  // If not pressable, render as View
  if (!onPress) {
    return (
      <View
        style={[styles.container, getVariantStyles(), style]}
        testID={testID}
      >
        {children}
      </View>
    );
  }

  // Render as TouchableOpacity with animations
  return (
    <AnimatedTouchableOpacity
      style={[styles.container, getVariantStyles(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
});

export default Card;
