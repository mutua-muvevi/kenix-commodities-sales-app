/**
 * Theme Store Slice
 * Manages theme preferences and dark mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStorage } from '../../middleware/persist';
import { actionLogger } from '../../middleware/logger';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // State
  mode: ThemeMode;
  isDark: boolean;

  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setIsDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial State
      mode: 'system',
      isDark: false,

      // Set Theme
      setTheme: (mode: ThemeMode) => {
        actionLogger('ThemeStore', 'setTheme', mode);
        set({ mode });

        // If mode is light or dark, update isDark immediately
        if (mode === 'light') {
          set({ isDark: false });
        } else if (mode === 'dark') {
          set({ isDark: true });
        }
        // If system, isDark should be set by system detection
      },

      // Toggle Theme
      toggleTheme: () => {
        actionLogger('ThemeStore', 'toggleTheme');
        const { mode } = get();

        // If system mode, switch to explicit light/dark
        if (mode === 'system') {
          const { isDark } = get();
          const newMode = isDark ? 'light' : 'dark';
          set({ mode: newMode, isDark: !isDark });
        } else {
          // Toggle between light and dark
          const newMode = mode === 'light' ? 'dark' : 'light';
          set({ mode: newMode, isDark: newMode === 'dark' });
        }
      },

      // Set Is Dark (used by system theme detection)
      setIsDark: (isDark: boolean) => {
        actionLogger('ThemeStore', 'setIsDark', isDark);
        set({ isDark });
      },
    }),
    {
      name: 'sales-agent-theme',
      storage: asyncStorage,
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
);
