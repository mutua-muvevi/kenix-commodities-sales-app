/**
 * Badge Component
 * A small label component for displaying status, counts, or categories.
 *
 * Features:
 * - Multiple color variants (primary, secondary, success, warning, error, info)
 * - Three sizes (small, medium, large)
 * - Dot mode for notification indicators
 * - Pill-shaped design
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="small">
 *   Active
 * </Badge>
 *
 * <Badge variant="error" dot />
 * ```
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';

export interface BadgeProps {
  /**
   * Badge color variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Badge size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Show as a dot indicator (no text)
   * @default false
   */
  dot?: boolean;

  /**
   * Badge content (text or number)
   */
  children?: React.ReactNode;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Badge Component
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'medium',
  dot = false,
  children,
  style,
  textStyle,
  testID,
}) => {
  // Get variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.palette.primary.main,
          },
          text: {
            color: theme.palette.primary.contrastText,
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: theme.palette.secondary.main,
          },
          text: {
            color: theme.palette.secondary.contrastText,
          },
        };

      case 'success':
        return {
          container: {
            backgroundColor: theme.palette.success.main,
          },
          text: {
            color: theme.palette.success.contrastText,
          },
        };

      case 'warning':
        return {
          container: {
            backgroundColor: theme.palette.warning.main,
          },
          text: {
            color: theme.palette.warning.contrastText,
          },
        };

      case 'error':
        return {
          container: {
            backgroundColor: theme.palette.error.main,
          },
          text: {
            color: theme.palette.error.contrastText,
          },
        };

      case 'info':
        return {
          container: {
            backgroundColor: theme.palette.info.main,
          },
          text: {
            color: theme.palette.info.contrastText,
          },
        };

      default:
        return {
          container: {
            backgroundColor: theme.palette.primary.main,
          },
          text: {
            color: theme.palette.primary.contrastText,
          },
        };
    }
  };

  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    dotSize: number;
  } => {
    if (dot) {
      switch (size) {
        case 'small':
          return {
            container: {},
            text: {},
            dotSize: 8,
          };
        case 'large':
          return {
            container: {},
            text: {},
            dotSize: 16,
          };
        case 'medium':
        default:
          return {
            container: {},
            text: {},
            dotSize: 12,
          };
      }
    }

    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: theme.spacing.xs / 2,
            paddingHorizontal: theme.spacing.xs,
            minHeight: 18,
          },
          text: {
            fontSize: 10,
            lineHeight: 14,
          },
          dotSize: 0,
        };

      case 'large':
        return {
          container: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            minHeight: 28,
          },
          text: {
            fontSize: 14,
            lineHeight: 18,
          },
          dotSize: 0,
        };

      case 'medium':
      default:
        return {
          container: {
            paddingVertical: theme.spacing.xs / 2,
            paddingHorizontal: theme.spacing.sm,
            minHeight: 22,
          },
          text: {
            fontSize: 12,
            lineHeight: 16,
          },
          dotSize: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Render dot badge
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          variantStyles.container,
          {
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: sizeStyles.dotSize / 2,
          },
          style,
        ]}
        testID={testID}
      />
    );
  }

  // Render text badge
  return (
    <View
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
      testID={testID}
    >
      <Animated.Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dot: {
    alignSelf: 'flex-start',
  },
});

export default Badge;
