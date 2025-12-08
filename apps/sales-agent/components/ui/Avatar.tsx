/**
 * Avatar Component
 * A circular user avatar component with image or initials fallback.
 *
 * Features:
 * - Image display from URL
 * - Initials fallback when no image
 * - Status badge overlay (online, offline, busy)
 * - Four sizes (small, medium, large, xlarge)
 * - Theme-aware styling
 * - Accessibility support
 * - Auto-generated colors for initials
 *
 * @example
 * ```tsx
 * <Avatar
 *   source="https://example.com/avatar.jpg"
 *   name="John Doe"
 *   size="large"
 *   badge="online"
 * />
 *
 * <Avatar name="Jane Smith" size="medium" />
 * ```
 */

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '@/theme';

export interface AvatarProps {
  /**
   * Image URL
   */
  source?: string;

  /**
   * User name - used for initials fallback
   */
  name?: string;

  /**
   * Avatar size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';

  /**
   * Status badge indicator
   */
  badge?: 'online' | 'offline' | 'busy';

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
 * Generate initials from name
 */
const getInitials = (name: string): string => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate background color based on name
 */
const getBackgroundColor = (name?: string): string => {
  if (!name) return theme.palette.grey[400];

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    '#9333ea', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ];

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get badge color based on status
 */
const getBadgeColor = (status: 'online' | 'offline' | 'busy'): string => {
  switch (status) {
    case 'online':
      return theme.palette.success.main;
    case 'busy':
      return theme.palette.warning.main;
    case 'offline':
    default:
      return theme.palette.grey[400];
  }
};

/**
 * Avatar Component
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  badge,
  style,
  testID,
}) => {
  // Get size styles
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    badgeSize: number;
    badgeBorderWidth: number;
  } => {
    switch (size) {
      case 'small':
        return {
          container: {
            width: 32,
            height: 32,
          },
          text: {
            fontSize: 14,
          },
          badgeSize: 10,
          badgeBorderWidth: 2,
        };

      case 'large':
        return {
          container: {
            width: 64,
            height: 64,
          },
          text: {
            fontSize: 24,
          },
          badgeSize: 16,
          badgeBorderWidth: 3,
        };

      case 'xlarge':
        return {
          container: {
            width: 96,
            height: 96,
          },
          text: {
            fontSize: 36,
          },
          badgeSize: 20,
          badgeBorderWidth: 3,
        };

      case 'medium':
      default:
        return {
          container: {
            width: 48,
            height: 48,
          },
          text: {
            fontSize: 18,
          },
          badgeSize: 14,
          badgeBorderWidth: 2,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const initials = getInitials(name || '');
  const backgroundColor = getBackgroundColor(name);

  return (
    <View
      style={[styles.wrapper, style]}
      testID={testID}
      accessible
      accessibilityLabel={name ? `Avatar for ${name}` : 'Avatar'}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.container,
          sizeStyles.container,
          { backgroundColor },
        ]}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={[styles.image, sizeStyles.container]}
            resizeMode="cover"
          />
        ) : (
          <Animated.Text
            style={[
              styles.initials,
              sizeStyles.text,
            ]}
            numberOfLines={1}
          >
            {initials}
          </Animated.Text>
        )}
      </View>

      {/* Status Badge */}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              width: sizeStyles.badgeSize,
              height: sizeStyles.badgeSize,
              borderRadius: sizeStyles.badgeSize / 2,
              borderWidth: sizeStyles.badgeBorderWidth,
              backgroundColor: getBadgeColor(badge),
            },
          ]}
          accessible
          accessibilityLabel={`Status: ${badge}`}
          accessibilityRole="text"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 9999,
  },
  initials: {
    color: theme.palette.common.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: theme.palette.background.default,
  },
});

export default Avatar;
