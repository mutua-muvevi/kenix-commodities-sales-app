/**
 * Categories Store Slice
 * Manages product categories data with caching and filtering
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, CategoryFilters } from '../../../types/category';
import { asyncStorage } from '../../middleware/persist';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface CategoriesState {
  // State
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
  cacheExpiry: number; // Cache validity in milliseconds (default: 1 hour)

  // Actions
  fetchCategories: (filters?: CategoryFilters, forceRefresh?: boolean) => Promise<void>;
  getCategoryById: (categoryId: string) => Category | null;
  setSelectedCategory: (category: Category | null) => void;
  clearError: () => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
}

const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      // Initial State
      categories: [],
      selectedCategory: null,
      isLoading: false,
      error: null,
      lastFetch: null,
      cacheExpiry: CACHE_EXPIRY_MS,

      // Check if cache is valid
      isCacheValid: () => {
        const { lastFetch, cacheExpiry } = get();
        if (!lastFetch) return false;

        const now = Date.now();
        const lastFetchTime = new Date(lastFetch).getTime();
        return now - lastFetchTime < cacheExpiry;
      },

      // Fetch Categories
      fetchCategories: async (filters?: CategoryFilters, forceRefresh = false) => {
        actionLogger('CategoriesStore', 'fetchCategories', { filters, forceRefresh });

        // Check cache validity
        if (!forceRefresh && get().isCacheValid() && get().categories.length > 0) {
          actionLogger('CategoriesStore', 'fetchCategories', 'Using cached data');
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await apiService.getCategories({
            isActive: filters?.isActive !== undefined ? filters.isActive : true,
            parentCategory: filters?.parentCategory,
            includeProducts: filters?.includeProducts || false,
            sortBy: filters?.sortBy || 'displayOrder',
            sortOrder: filters?.sortOrder || 'asc',
            page: filters?.page || 1,
            limit: filters?.limit || 100, // Get all categories by default
          });

          const categories = response.data?.categories || response.categories || [];

          set({
            categories,
            isLoading: false,
            error: null,
            lastFetch: new Date().toISOString(),
          });

          actionLogger('CategoriesStore', 'fetchCategories', `Loaded ${categories.length} categories`);
        } catch (error: any) {
          errorLogger('CategoriesStore', 'fetchCategories', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch categories',
            isLoading: false,
          });
          throw error;
        }
      },

      // Get Category By ID
      getCategoryById: (categoryId: string) => {
        const { categories } = get();
        return categories.find((cat) => cat._id === categoryId) || null;
      },

      // Set Selected Category
      setSelectedCategory: (category: Category | null) => {
        actionLogger('CategoriesStore', 'setSelectedCategory', category?._id);
        set({ selectedCategory: category });
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Clear Cache
      clearCache: () => {
        actionLogger('CategoriesStore', 'clearCache');
        set({
          categories: [],
          lastFetch: null,
        });
      },
    }),
    {
      name: 'sales-agent-categories',
      storage: asyncStorage,
      partialize: (state) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
