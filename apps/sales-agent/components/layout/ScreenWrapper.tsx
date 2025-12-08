/**
 * ScreenWrapper Component
 *
 * Complete screen layout wrapper combining SafeArea, Container, ScrollView,
 * KeyboardAvoidingView, and optional Header with refresh support.
 *
 * This is the primary screen wrapper for most app screens, providing:
 * - Safe area handling
 * - Consistent padding
 * - Optional scrolling with pull-to-refresh
 * - Keyboard avoiding behavior
 * - Tab bar overlap handling
 * - Optional header integration
 *
 * @example
 * <ScreenWrapper
 *   headerTitle="Dashboard"
 *   scrollable
 *   onRefresh={handleRefresh}
 *   refreshing={isRefreshing}
 * >
 *   <YourScreenContent />
 * </ScreenWrapper>
 */

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Edge } from 'react-native-safe-area-context';
import { SafeArea } from './SafeArea';
import { Container } from './Container';
import { Header } from './Header';
import { useTheme } from '../../hooks/useTheme';
import { TAB_BAR_HEIGHT } from '../../theme/utils/dimensions';

export interface ScreenWrapperProps {
  /**
   * Child components to render within the screen
   */
  children: React.ReactNode;

  /**
   * Enable scrolling with ScrollView
   * @default false
   */
  scrollable?: boolean;

  /**
   * Pull-to-refresh state
   * @default false
   */
  refreshing?: boolean;

  /**
   * Pull-to-refresh callback
   */
  onRefresh?: () => void;

  /**
   * Header title text
   */
  headerTitle?: string;

  /**
   * Show back button in header
   * @default false
   */
  showBackButton?: boolean;

  /**
   * Custom right action component for header
   */
  rightAction?: React.ReactNode;

  /**
   * Add bottom padding for tab bar
   * Prevents content from being hidden behind tab bar
   * @default true
   */
  tabBarPadding?: boolean;

  /**
   * Enable keyboard avoiding behavior
   * @default true
   */
  keyboardAvoiding?: boolean;

  /**
   * Container padding level
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';

  /**
   * Safe area edges
   * @default ['top', 'bottom']
   */
  edges?: Edge[];

  /**
   * Custom style for the container
   */
  style?: ViewStyle;
}

/**
 * ScreenWrapper Component
 * Combines all layout primitives into a complete screen wrapper
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  refreshing = false,
  onRefresh,
  headerTitle,
  showBackButton = false,
  rightAction,
  tabBarPadding = true,
  keyboardAvoiding = true,
  padding = 'medium',
  edges = ['top', 'bottom'],
  style,
}) => {
  const { theme } = useTheme();

  // Calculate bottom padding to prevent tab bar overlap
  const getBottomPadding = (): number => {
    if (!tabBarPadding) return 0;

    // Add padding to prevent content from being hidden behind tab bar
    return Platform.select({
      ios: TAB_BAR_HEIGHT + theme.spacing.sm,
      android: TAB_BAR_HEIGHT + theme.spacing.md,
      default: TAB_BAR_HEIGHT + theme.spacing.sm,
    });
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: getBottomPadding(),
    },
    staticContent: {
      flex: 1,
      paddingBottom: getBottomPadding(),
    },
  });

  const content = (
    <Container padding={padding} style={style}>
      {children}
    </Container>
  );

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.palette.primary.main}
                colors={[theme.palette.primary.main]}
              />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      );
    }

    return <View style={styles.staticContent}>{content}</View>;
  };

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.content}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {renderContent()}
    </KeyboardAvoidingView>
  ) : (
    renderContent()
  );

  return (
    <SafeArea edges={edges}>
      {headerTitle && (
        <Header
          title={headerTitle}
          showBackButton={showBackButton}
          rightAction={rightAction}
        />
      )}
      {wrappedContent}
    </SafeArea>
  );
};
