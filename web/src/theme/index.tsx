// src/theme/index.ts - Enhanced Theme Configuration
"use client";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { palette } from './palette';

// Create theme with proper text contrast
export const createAppTheme = (mode: 'light' | 'dark' = 'light') => {
  const themeConfig = createTheme({
    palette: {
      mode,
      ...palette(mode),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontWeight: 800,
        lineHeight: 1.2,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        lineHeight: 1.3,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 700,
        lineHeight: 1.4,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 600,
        lineHeight: 1.4,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: '1.125rem',
      },
      h6: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: '1rem',
      },
      body1: {
        lineHeight: 1.6,
        fontSize: '1rem',
      },
      body2: {
        lineHeight: 1.6,
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            WebkitOverflowScrolling: 'touch',
          },
          body: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            // Ensure text is always visible with proper contrast
            color: mode === 'light' ? '#212B36' : '#FFFFFF',
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#121313',
          },
        },
      },
      // Enhanced Typography component overrides for better visibility
      MuiTypography: {
        styleOverrides: {
          root: ({ theme, ownerState }) => ({
            // Ensure all typography has proper contrast
            ...(ownerState?.color === 'textPrimary' && {
              color: theme.palette.text.primary,
            }),
            ...(ownerState?.color === 'textSecondary' && {
              color: theme.palette.text.secondary,
            }),
            // Override any transparent or low-contrast colors
            '&[style*="color: transparent"]': {
              color: `${theme.palette.text.primary} !important`,
            },
            '&[style*="opacity: 0"]': {
              opacity: '1 !important',
            },
          }),
        },
      },
      // Button overrides for better visibility
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            // Ensure button text is always visible
            '&.MuiButton-text': {
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}0A`,
              },
            },
            '&.MuiButton-outlined': {
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}0A`,
                borderColor: theme.palette.primary.dark,
              },
            },
            '&.MuiButton-contained': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0 2px 8px rgba(0, 35, 137, 0.24)',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0 4px 16px rgba(0, 35, 137, 0.32)',
              },
            },
          }),
        },
      },
      // Card overrides for proper backgrounds
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      // Container overrides
      MuiContainer: {
        styleOverrides: {
          root: ({ theme }) => ({
            // Ensure containers don't interfere with text visibility
            backgroundColor: 'transparent',
          }),
        },
      },
      // Box overrides to prevent color issues
      MuiBox: {
        styleOverrides: {
          root: {
            // Prevent any Box components from making text invisible
            '& *': {
              // Force visibility of any hidden text
              '&[style*="color: transparent"]': {
                color: 'inherit !important',
              },
              '&[style*="opacity: 0"]': {
                opacity: '1 !important',
              },
            },
          },
        },
      },
    },
  });

  return themeConfig;
};

// Enhanced Theme Provider Component
interface AppThemeProviderProps {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
}

export function AppThemeProvider({ 
  children, 
  mode = 'light' 
}: AppThemeProviderProps) {
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default AppThemeProvider;