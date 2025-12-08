import { create } from 'zustand';
import { deliveryService } from '../services/api';
import type { Delivery } from '../types';

interface HistoryFilters {
  status?: 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

interface HistoryState {
  deliveries: Delivery[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: Pagination;
  filters: HistoryFilters;

  loadHistory: (riderId: string, page?: number) => Promise<void>;
  loadMore: (riderId: string) => Promise<void>;
  setFilters: (filters: HistoryFilters) => void;
  resetFilters: () => void;
  clearHistory: () => void;
  clearError: () => void;
}

const initialPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
  hasMore: false,
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  deliveries: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: initialPagination,
  filters: {},

  loadHistory: async (riderId: string, page: number = 1) => {
    set({ isLoading: page === 1, isLoadingMore: page > 1, error: null });

    try {
      const { filters } = get();
      const response = await deliveryService.getHistory(riderId, {
        page,
        limit: 20,
        ...filters,
      });

      set({
        deliveries:
          page === 1
            ? response.deliveries
            : [...get().deliveries, ...response.deliveries],
        pagination: response.pagination,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load delivery history',
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  loadMore: async (riderId: string) => {
    const { pagination, isLoadingMore } = get();
    if (isLoadingMore || !pagination.hasMore) return;

    await get().loadHistory(riderId, pagination.page + 1);
  },

  setFilters: (filters: HistoryFilters) => {
    set({ filters, deliveries: [], pagination: initialPagination });
  },

  resetFilters: () => {
    set({ filters: {}, deliveries: [], pagination: initialPagination });
  },

  clearHistory: () => {
    set({ deliveries: [], pagination: initialPagination, error: null });
  },

  clearError: () => set({ error: null }),
}));
