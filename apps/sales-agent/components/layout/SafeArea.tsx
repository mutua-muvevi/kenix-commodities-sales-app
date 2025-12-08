/**
 * SafeArea Component
 *
 * Provides safe area context wrapper with configurable edges and background color.
 * Handles device-specific safe areas (notch, dynamic island, navigation bars).
 *
 * Features:
 * - Configurable safe area edges
 * - Theme-based background color
 * - Custom background color override
 * - iOS notch/dynamic island support
 * - Android navigation bar support
 *
 * @example
 * <SafeArea edges={['top', 'bottom']}>
 *   <YourContent />
 * </SafeArea>
 */

import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

export interface SafeAreaProps {
  /**
   * Child components to render within safe area
   */
  children: React.ReactNode;

  /**
   * Which edges to apply safe area padding to
   * @default ['top', 'bottom', 'left', 'right']
   */
  edges?: Edge[];

  /**
   * Custom style overrides
   */
  style?: ViewStyle;

  /**
   * Custom background color (overrides theme)
   */
  backgroundColor?: string;
}

/**
 * SafeArea Component
 * Wraps content in safe area context with configurable edges
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor || theme.palette.background.default,
    },
  });

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
};
