/**
 * Component Style Factory
 * Pre-built component styles using theme tokens
 */

import { ViewStyle, TextStyle } from 'react-native';
import { ThemeType } from './types/theme';
import { alpha } from './utils/colors';

/**
 * Create component styles based on theme
 * @param theme - Theme object
 * @returns Component styles
 */
export const createComponentStyles = (theme: ThemeType) => {
  const { palette, spacing, borderRadius, shadows, typography } = theme;

  /**
   * Button styles
   */
  const button = {
    // Primary button
    primary: {
      container: {
        backgroundColor: palette.primary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.z4,
      } as ViewStyle,
      text: {
        ...typography.button,
        color: palette.primary.contrastText,
      } as TextStyle,
      disabled: {
        backgroundColor: palette.action.disabledBackground,
        ...shadows.none,
      } as ViewStyle,
    },

    // Secondary button
    secondary: {
      container: {
        backgroundColor: palette.secondary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.z4,
      } as ViewStyle,
      text: {
        ...typography.button,
        color: palette.secondary.contrastText,
      } as TextStyle,
      disabled: {
        backgroundColor: palette.action.disabledBackground,
        ...shadows.none,
      } as ViewStyle,
    },

    // Outlined button
    outlined: {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: palette.primary.main,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      } as ViewStyle,
      text: {
        ...typography.button,
        color: palette.primary.main,
      } as TextStyle,
      disabled: {
        borderColor: palette.action.disabled,
      } as ViewStyle,
    },

    // Text button
    text: {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      } as ViewStyle,
      text: {
        ...typography.button,
        color: palette.primary.main,
      } as TextStyle,
      disabled: {} as ViewStyle,
    },

    // Icon button
    icon: {
      container: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: alpha(palette.primary.main, 0.08),
      } as ViewStyle,
      pressed: {
        backgroundColor: alpha(palette.primary.main, 0.16),
      } as ViewStyle,
    },

    // FAB (Floating Action Button)
    fab: {
      container: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: palette.primary.main,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.z12,
      } as ViewStyle,
      icon: {
        color: palette.primary.contrastText,
      },
    },
  };

  /**
   * Card styles
   */
  const card = {
    // Default card
    default: {
      container: {
        backgroundColor: palette.background.paper,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.z4,
      } as ViewStyle,
      title: {
        ...typography.h6,
        color: palette.text.primary,
        marginBottom: spacing.xs,
      } as TextStyle,
      subtitle: {
        ...typography.body2,
        color: palette.text.secondary,
      } as TextStyle,
    },

    // Elevated card
    elevated: {
      container: {
        backgroundColor: palette.background.paper,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.z8,
      } as ViewStyle,
    },

    // Outlined card
    outlined: {
      container: {
        backgroundColor: palette.background.paper,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: palette.divider,
      } as ViewStyle,
    },

    // Interactive card (pressable)
    interactive: {
      container: {
        backgroundColor: palette.background.paper,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.z4,
      } as ViewStyle,
      pressed: {
        ...shadows.z1,
        backgroundColor: palette.action.hover,
      } as ViewStyle,
    },
  };

  /**
   * Input styles
   */
  const input = {
    // Default input
    default: {
      container: {
        marginBottom: spacing.md,
      } as ViewStyle,
      label: {
        ...typography.subtitle2,
        color: palette.text.primary,
        marginBottom: spacing.xs,
      } as TextStyle,
      input: {
        backgroundColor: palette.background.paper,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: palette.divider,
        ...typography.body1,
        color: palette.text.primary,
      } as ViewStyle & TextStyle,
      inputFocused: {
        borderColor: palette.primary.main,
        ...shadows.z4,
      } as ViewStyle,
      inputError: {
        borderColor: palette.error.main,
      } as ViewStyle,
      helper: {
        ...typography.caption,
        color: palette.text.secondary,
        marginTop: spacing.xs,
      } as TextStyle,
      error: {
        ...typography.caption,
        color: palette.error.main,
        marginTop: spacing.xs,
      } as TextStyle,
    },

    // Outlined input
    outlined: {
      input: {
        backgroundColor: 'transparent',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: palette.divider,
        ...typography.body1,
        color: palette.text.primary,
      } as ViewStyle & TextStyle,
      inputFocused: {
        borderColor: palette.primary.main,
        borderWidth: 2,
      } as ViewStyle,
    },

    // Filled input
    filled: {
      input: {
        backgroundColor: alpha(palette.grey[500], 0.08),
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderBottomColor: palette.divider,
        ...typography.body1,
        color: palette.text.primary,
      } as ViewStyle & TextStyle,
      inputFocused: {
        borderBottomColor: palette.primary.main,
        backgroundColor: alpha(palette.grey[500], 0.12),
      } as ViewStyle,
    },
  };

  /**
   * List item styles
   */
  const listItem = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: palette.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: palette.divider,
    } as ViewStyle,
    pressed: {
      backgroundColor: palette.action.hover,
    } as ViewStyle,
    selected: {
      backgroundColor: palette.action.selected,
    } as ViewStyle,
    title: {
      ...typography.body1,
      color: palette.text.primary,
    } as TextStyle,
    subtitle: {
      ...typography.body2,
      color: palette.text.secondary,
    } as TextStyle,
  };

  /**
   * Chip styles
   */
  const chip = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: alpha(palette.primary.main, 0.12),
    } as ViewStyle,
    text: {
      ...typography.caption,
      color: palette.primary.main,
      fontWeight: '600',
    } as TextStyle,
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.primary.main,
    } as ViewStyle,
  };

  /**
   * Badge styles
   */
  const badge = {
    container: {
      minWidth: 20,
      height: 20,
      borderRadius: borderRadius.full,
      backgroundColor: palette.error.main,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: spacing.xs,
    } as ViewStyle,
    text: {
      fontSize: 10,
      fontWeight: '700',
      color: palette.error.contrastText,
    } as TextStyle,
    dot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.full,
      backgroundColor: palette.error.main,
    } as ViewStyle,
  };

  /**
   * Avatar styles
   */
  const avatar = {
    small: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: palette.grey[300],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    } as ViewStyle,
    medium: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: palette.grey[300],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    } as ViewStyle,
    large: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.full,
      backgroundColor: palette.grey[300],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    } as ViewStyle,
  };

  /**
   * Divider styles
   */
  const divider = {
    horizontal: {
      height: 1,
      backgroundColor: palette.divider,
      marginVertical: spacing.md,
    } as ViewStyle,
    vertical: {
      width: 1,
      backgroundColor: palette.divider,
      marginHorizontal: spacing.md,
    } as ViewStyle,
  };

  /**
   * Modal styles
   */
  const modal = {
    overlay: {
      flex: 1,
      backgroundColor: alpha('#000000', 0.5),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    } as ViewStyle,
    container: {
      backgroundColor: palette.background.paper,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
      ...shadows.z24,
    } as ViewStyle,
    header: {
      marginBottom: spacing.md,
    } as ViewStyle,
    title: {
      ...typography.h5,
      color: palette.text.primary,
    } as TextStyle,
    body: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    footer: {
      flexDirection: 'row' as const,
      justifyContent: 'flex-end' as const,
      gap: spacing.sm,
    } as ViewStyle,
  };

  /**
   * Bottom sheet styles
   */
  const bottomSheet = {
    overlay: {
      flex: 1,
      backgroundColor: alpha('#000000', 0.5),
      justifyContent: 'flex-end' as const,
    } as ViewStyle,
    container: {
      backgroundColor: palette.background.paper,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.z16,
    } as ViewStyle,
    handle: {
      width: 40,
      height: 4,
      backgroundColor: palette.grey[300],
      borderRadius: borderRadius.full,
      alignSelf: 'center' as const,
      marginBottom: spacing.md,
    } as ViewStyle,
  };

  /**
   * Toast styles
   */
  const toast = {
    container: {
      backgroundColor: palette.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      margin: spacing.md,
      ...shadows.z8,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    } as ViewStyle,
    success: {
      borderLeftWidth: 4,
      borderLeftColor: palette.success.main,
    } as ViewStyle,
    error: {
      borderLeftWidth: 4,
      borderLeftColor: palette.error.main,
    } as ViewStyle,
    warning: {
      borderLeftWidth: 4,
      borderLeftColor: palette.warning.main,
    } as ViewStyle,
    info: {
      borderLeftWidth: 4,
      borderLeftColor: palette.info.main,
    } as ViewStyle,
    text: {
      ...typography.body2,
      color: palette.text.primary,
      flex: 1,
      marginLeft: spacing.sm,
    } as TextStyle,
  };

  return {
    button,
    card,
    input,
    listItem,
    chip,
    badge,
    avatar,
    divider,
    modal,
    bottomSheet,
    toast,
  };
};

/**
 * Export component styles type
 */
export type ComponentStyles = ReturnType<typeof createComponentStyles>;
