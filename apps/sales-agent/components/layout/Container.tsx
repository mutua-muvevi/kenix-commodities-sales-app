/**
 * Container Component
 *
 * Flexible container with consistent padding and optional centering.
 * Provides standardized content wrapping with theme-based spacing.
 *
 * Features:
 * - Configurable padding levels
 * - Optional content centering
 * - Theme-based background
 * - Flex layout support
 *
 * @example
 * <Container padding="medium" centered>
 *   <YourContent />
 * </Container>
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ContainerProps {
  /**
   * Child components to render within container
   */
  children: React.ReactNode;

  /**
   * Padding level
   * - 'none': No padding
   * - 'small': 8px horizontal
   * - 'medium': 16px horizontal (default)
   * - 'large': 24px horizontal
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';

  /**
   * Center content horizontally and vertically
   * @default false
   */
  centered?: boolean;

  /**
   * Custom style overrides
   */
  style?: ViewStyle;
}

/**
 * Container Component
 * Provides consistent padding and optional centering for content
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'medium',
  centered = false,
  style,
}) => {
  const { theme } = useTheme();

  const getPaddingValue = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return theme.spacing.sm;
      case 'medium':
        return theme.spacing.md;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: getPaddingValue(),
      ...(centered && {
        justifyContent: 'center',
        alignItems: 'center',
      }),
    },
  });

  return <View style={[styles.container, style]}>{children}</View>;
};
