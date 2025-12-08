/**
 * LoadingSpinner Component
 * A flexible loading indicator with optional fullscreen overlay.
 *
 * Features:
 * - Three sizes (small, medium, large)
 * - Fullscreen overlay mode
 * - Optional message text
 * - Custom color support
 * - Theme-aware styling
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="large" fullScreen message="Loading data..." />
 * <LoadingSpinner size="small" color={theme.palette.primary.main} />
 * ```
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Modal,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';

export interface LoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Spinner color
   * @default theme.palette.primary.main
   */
  color?: string;

  /**
   * Show as fullscreen overlay
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Optional loading message
   */
  message?: string;

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
 * LoadingSpinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = theme.palette.primary.main,
  fullScreen = false,
  message,
  style,
  testID,
}) => {
  // Get spinner size value
  const getSpinnerSize = (): 'small' | 'large' => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      case 'medium':
      default:
        return 'large';
    }
  };

  // Render spinner content
  const renderSpinner = () => (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreenContainer,
        style,
      ]}
      testID={testID}
      accessible
      accessibilityLabel={message || 'Loading'}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
    >
      <View style={styles.content}>
        <ActivityIndicator
          size={getSpinnerSize()}
          color={color}
          testID={testID ? `${testID}-spinner` : undefined}
        />
        {message && (
          <Animated.Text style={[styles.message, { color }]}>
            {message}
          </Animated.Text>
        )}
      </View>
    </View>
  );

  // If fullscreen, wrap in Modal
  if (fullScreen) {
    return (
      <Modal
        transparent
        visible
        animationType="fade"
        statusBarTranslucent
        testID={testID ? `${testID}-modal` : undefined}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator
              size={getSpinnerSize()}
              color={color}
              testID={testID ? `${testID}-spinner` : undefined}
            />
            {message && (
              <Animated.Text style={[styles.message, styles.fullScreenMessage]}>
                {message}
              </Animated.Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // Regular spinner
  return renderSpinner();
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...theme.typography.body2,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.z20,
  },
  fullScreenMessage: {
    color: theme.palette.text.primary,
    fontWeight: '500',
  },
});

export default LoadingSpinner;
