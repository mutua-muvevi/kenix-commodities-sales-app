/**
 * Header Component
 *
 * Customizable header with back button, title, subtitle, and right action slot.
 * Provides consistent navigation header across the app.
 *
 * Features:
 * - Back button with expo-router navigation
 * - Title and optional subtitle
 * - Right action slot for icons/buttons
 * - Transparent mode for overlaying content
 * - Theme-based styling
 *
 * @example
 * <Header
 *   title="Shop Details"
 *   subtitle="ABC Store"
 *   showBackButton
 *   rightAction={<IconButton icon="more-vertical" />}
 * />
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { HEADER_HEIGHT } from '../../theme/utils/dimensions';

export interface HeaderProps {
  /**
   * Header title text
   */
  title: string;

  /**
   * Optional subtitle text
   */
  subtitle?: string;

  /**
   * Show back button
   * @default false
   */
  showBackButton?: boolean;

  /**
   * Custom back button press handler
   * If not provided, uses expo-router's back navigation
   */
  onBackPress?: () => void;

  /**
   * Custom component for right side of header
   * (e.g., icon buttons, menu)
   */
  rightAction?: React.ReactNode;

  /**
   * Make header transparent (overlays content)
   * @default false
   */
  transparent?: boolean;

  /**
   * Custom style overrides
   */
  style?: ViewStyle;
}

/**
 * Header Component
 * Provides consistent navigation header with back button and actions
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  transparent = false,
  style,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const styles = StyleSheet.create({
    container: {
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      backgroundColor: transparent
        ? 'transparent'
        : theme.palette.background.paper,
      borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: theme.palette.divider,
      ...(!transparent && {
        ...theme.shadows.sm,
      }),
    },
    leftSection: {
      width: 40,
      justifyContent: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.round,
    },
    centerSection: {
      flex: 1,
      marginHorizontal: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h6,
      color: theme.palette.text.primary,
      fontWeight: '600',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.palette.text.secondary,
      marginTop: 2,
    },
    rightSection: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Left Section - Back Button */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
              size={24}
              color={theme.palette.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title & Subtitle */}
      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Section - Custom Action */}
      <View style={styles.rightSection}>{rightAction}</View>
    </View>
  );
};
