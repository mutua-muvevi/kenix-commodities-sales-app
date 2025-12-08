/**
 * Button Component
 * A highly customizable button component with animations, haptic feedback, and loading states.
 *
 * Features:
 * - Multiple variants (primary, secondary, outlined, text, danger)
 * - Three sizes (small, medium, large)
 * - Loading state with spinner
 * - Disabled state
 * - Icon support (left/right)
 * - Full width option
 * - Press animations via react-native-reanimated
 * - Haptic feedback
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="large"
 *   leftIcon={<Ionicons name="add" size={20} color="white" />}
 *   onPress={() => console.log('Pressed')}
 * >
 *   Add Shop
 * </Button>
 * ```
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
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

export interface ButtonProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Shows loading spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Disables button interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;

  /**
   * Makes button take full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Press handler
   */
  onPress: () => void;

  /**
   * Button label/content
   */
  children: React.ReactNode;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  children,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale down animation
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });

    opacity.value = withTiming(0.8, { duration: 150 });
  }, [disabled, loading, scale, opacity]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;

    // Scale back animation
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });

    opacity.value = withTiming(1, { duration: 150 });
  }, [disabled, loading, scale, opacity]);

  // Handle press
  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    // Medium haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [disabled, loading, onPress]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Get variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    const baseStyles = {
      container: {} as ViewStyle,
      text: {} as TextStyle,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.palette.primary.main,
            ...theme.shadows.z4,
          },
          text: {
            color: theme.palette.primary.contrastText,
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: theme.palette.secondary.main,
            ...theme.shadows.z4,
          },
          text: {
            color: theme.palette.secondary.contrastText,
          },
        };

      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.palette.primary.main,
          },
          text: {
            color: theme.palette.primary.main,
          },
        };

      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.palette.primary.main,
          },
        };

      case 'danger':
        return {
          container: {
            backgroundColor: theme.palette.error.main,
            ...theme.shadows.z4,
          },
          text: {
            color: theme.palette.error.contrastText,
          },
        };

      default:
        return baseStyles;
    }
  };

  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconSize: number;
  } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            minHeight: 36,
          },
          text: {
            ...theme.typography.button,
            fontSize: 12,
          },
          iconSize: 16,
        };

      case 'large':
        return {
          container: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            minHeight: 54,
          },
          text: {
            ...theme.typography.button,
            fontSize: 16,
          },
          iconSize: 24,
        };

      case 'medium':
      default:
        return {
          container: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            minHeight: 44,
          },
          text: {
            ...theme.typography.button,
          },
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Disabled style
  const disabledStyle: ViewStyle = (disabled || loading)
    ? {
        backgroundColor: theme.palette.action.disabledBackground,
        opacity: theme.palette.action.disabledOpacity,
        ...theme.shadows.none,
      }
    : {};

  const disabledTextStyle: TextStyle = (disabled || loading)
    ? {
        color: theme.palette.text.disabled,
      }
    : {};

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabledStyle,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
          style={styles.loader}
        />
      )}

      {!loading && leftIcon && (
        <Animated.View style={styles.leftIcon}>{leftIcon}</Animated.View>
      )}

      <Animated.Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          disabledTextStyle,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Animated.Text>

      {!loading && rightIcon && (
        <Animated.View style={styles.rightIcon}>{rightIcon}</Animated.View>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  loader: {
    marginRight: theme.spacing.xs,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button;
