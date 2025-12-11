import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

/**
 * Theme Configuration
 *
 * Defines the comprehensive theme structure for the Sales Agent App.
 * Supports both light and dark modes with blue/green accent colors.
 */

interface ThemePalette {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  divider: string;
  border: string;
  grey: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  common: {
    black: string;
    white: string;
  };
}

interface ThemeTypography {
  h1: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  h2: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  h3: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  h4: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  h5: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  h6: {
    fontSize: number;
    fontWeight: '700' | '600' | '500' | '400';
    lineHeight: number;
  };
  subtitle1: {
    fontSize: number;
    fontWeight: '600' | '500' | '400';
    lineHeight: number;
  };
  subtitle2: {
    fontSize: number;
    fontWeight: '600' | '500' | '400';
    lineHeight: number;
  };
  body1: {
    fontSize: number;
    fontWeight: '400';
    lineHeight: number;
  };
  body2: {
    fontSize: number;
    fontWeight: '400';
    lineHeight: number;
  };
  button: {
    fontSize: number;
    fontWeight: '600' | '500';
    lineHeight: number;
    textTransform: 'uppercase' | 'none';
  };
  caption: {
    fontSize: number;
    fontWeight: '400';
    lineHeight: number;
  };
  overline: {
    fontSize: number;
    fontWeight: '500';
    lineHeight: number;
    textTransform: 'uppercase';
  };
}

interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface ThemeShadows {
  none: {};
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

interface ThemeBorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface Theme {
  palette: ThemePalette;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
}

const lightPalette: ThemePalette = {
  primary: {
    main: '#1976D2', // Blue
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#4CAF50', // Green
    light: '#66BB6A',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#66BB6A',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    surface: '#FAFAFA',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  divider: '#E0E0E0',
  border: '#EEEEEE',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
};

const darkPalette: ThemePalette = {
  primary: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#000000',
  },
  secondary: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#4CAF50',
    contrastText: '#000000',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#4CAF50',
    contrastText: '#000000',
  },
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#F44336',
    contrastText: '#000000',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#FF9800',
    contrastText: '#000000',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0288D1',
    contrastText: '#000000',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    surface: '#2C2C2C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#666666',
    hint: '#808080',
  },
  divider: '#373737',
  border: '#2C2C2C',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
};

const typography: ThemeTypography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
};

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const shadows: ThemeShadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

const borderRadius: ThemeBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const createTheme = (mode: 'light' | 'dark'): Theme => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  typography,
  spacing,
  shadows,
  borderRadius,
});

/**
 * useTheme Hook
 *
 * Provides access to the current theme based on system color scheme.
 * Returns the complete theme object with palette, typography, spacing, shadows, and border radius.
 *
 * @returns Theme object and helpers
 *
 * @example
 * const { theme, isDark, colors } = useTheme();
 *
 * <View style={{ backgroundColor: colors.background.default }}>
 *   <Text style={{ color: colors.text.primary }}>Hello</Text>
 * </View>
 */
export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = useMemo(() => createTheme(isDark ? 'dark' : 'light'), [isDark]);

  return {
    theme,
    isDark,
    colors: theme.palette,
    typography: theme.typography,
    spacing: theme.spacing,
    shadows: theme.shadows,
    borderRadius: theme.borderRadius,
  };
};

/**
 * useThemeStyles Hook
 *
 * Provides commonly used style patterns based on the current theme.
 * Reduces boilerplate for frequently used component styles.
 *
 * @returns Object with common style patterns
 *
 * @example
 * const styles = useThemeStyles();
 *
 * <View style={styles.container}>
 *   <View style={styles.card}>
 *     <Text style={styles.title}>Title</Text>
 *     <Text style={styles.body}>Content</Text>
 *   </View>
 * </View>
 */
export const useThemeStyles = () => {
  const { theme } = useTheme();

  return useMemo(() => ({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.palette.background.default,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.palette.background.default,
    },
    surface: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.palette.background.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.card,
    },
    // Text styles
    title: {
      ...theme.typography.h4,
      color: theme.palette.text.primary,
    },
    subtitle: {
      ...theme.typography.subtitle1,
      color: theme.palette.text.secondary,
    },
    body: {
      ...theme.typography.body1,
      color: theme.palette.text.primary,
    },
    caption: {
      ...theme.typography.caption,
      color: theme.palette.text.secondary,
    },
    // Layout helpers
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    column: {
      flexDirection: 'column' as const,
    },
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    spaceBetween: {
      justifyContent: 'space-between' as const,
    },
    // Spacing helpers
    mb_xs: { marginBottom: theme.spacing.xs },
    mb_sm: { marginBottom: theme.spacing.sm },
    mb_md: { marginBottom: theme.spacing.md },
    mb_lg: { marginBottom: theme.spacing.lg },
    mt_xs: { marginTop: theme.spacing.xs },
    mt_sm: { marginTop: theme.spacing.sm },
    mt_md: { marginTop: theme.spacing.md },
    mt_lg: { marginTop: theme.spacing.lg },
    // Border and divider
    divider: {
      height: 1,
      backgroundColor: theme.palette.divider,
    },
    border: {
      borderWidth: 1,
      borderColor: theme.palette.border,
    },
  }), [theme]);
};
