/**
 * Shop Store Slice
 * Manages shop data, KYC registration, and shop operations
 */

import { create } from 'zustand';
import { Shop, ShopStatus, KYCFormData } from '../../../types/shop';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface ShopState {
  // State
  shops: Shop[];
  selectedShop: Shop | null;
  isLoading: boolean;
  error: string | null;
  filterStatus: ShopStatus | 'all';

  // Actions
  fetchShops: (agentId: string, status?: ShopStatus) => Promise<void>;
  fetchShopById: (shopId: string) => Promise<Shop>;
  addShop: (shop: Shop) => void;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;
  setSelectedShop: (shop: Shop | null) => void;
  registerShop: (kycData: KYCFormData) => Promise<Shop>;
  setFilterStatus: (status: ShopStatus | 'all') => void;
  getFilteredShops: () => Shop[];
  clearError: () => void;
  refreshShops: (agentId: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  // Initial State
  shops: [],
  selectedShop: null,
  isLoading: false,
  error: null,
  filterStatus: 'all',

  // Fetch Shops
  fetchShops: async (agentId: string, status?: ShopStatus) => {
    actionLogger('ShopStore', 'fetchShops', { agentId, status });
    try {
      set({ isLoading: true, error: null });

      const data = await apiService.getMyShops(agentId, status);
      const shops = data.users || data;

      set({
        shops,
        isLoading: false,
        error: null,
      });

      actionLogger('ShopStore', 'fetchShops', `Loaded ${shops.length} shops`);
    } catch (error: any) {
      errorLogger('ShopStore', 'fetchShops', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch shops',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch Shop By ID
  fetchShopById: async (shopId: string) => {
    actionLogger('ShopStore', 'fetchShopById', shopId);
    try {
      set({ isLoading: true, error: null });

      const shop = await apiService.getShopById(shopId);

      // Update shop in list if exists
      const { shops } = get();
      const updatedShops = shops.map((s) => (s._id === shopId ? shop : s));

      set({
        shops: updatedShops,
        selectedShop: shop,
        isLoading: false,
        error: null,
      });

      actionLogger('ShopStore', 'fetchShopById', 'Success');
      return shop;
    } catch (error: any) {
      errorLogger('ShopStore', 'fetchShopById', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch shop',
        isLoading: false,
      });
      throw error;
    }
  },

  // Add Shop
  addShop: (shop: Shop) => {
    actionLogger('ShopStore', 'addShop', shop._id);
    const { shops } = get();
    set({ shops: [shop, ...shops] });
  },

  // Update Shop
  updateShop: (shopId: string, updates: Partial<Shop>) => {
    actionLogger('ShopStore', 'updateShop', { shopId, updates });
    const { shops, selectedShop } = get();

    const updatedShops = shops.map((shop) =>
      shop._id === shopId ? { ...shop, ...updates } : shop
    );

    set({
      shops: updatedShops,
      selectedShop:
        selectedShop?._id === shopId ? { ...selectedShop, ...updates } : selectedShop,
    });
  },

  // Set Selected Shop
  setSelectedShop: (shop: Shop | null) => {
    actionLogger('ShopStore', 'setSelectedShop', shop?._id);
    set({ selectedShop: shop });
  },

  // Register Shop (KYC)
  registerShop: async (kycData: KYCFormData) => {
    actionLogger('ShopStore', 'registerShop', kycData.shopName);
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.registerShop(kycData);
      const newShop = response.shop || response;

      // Add to shops list
      const { shops } = get();
      set({
        shops: [newShop, ...shops],
        selectedShop: newShop,
        isLoading: false,
        error: null,
      });

      actionLogger('ShopStore', 'registerShop', 'Success');
      return newShop;
    } catch (error: any) {
      errorLogger('ShopStore', 'registerShop', error);
      set({
        error:
          error.response?.data?.message || error.message || 'Failed to register shop',
        isLoading: false,
      });
      throw error;
    }
  },

  // Set Filter Status
  setFilterStatus: (status: ShopStatus | 'all') => {
    actionLogger('ShopStore', 'setFilterStatus', status);
    set({ filterStatus: status });
  },

  // Get Filtered Shops
  getFilteredShops: () => {
    const { shops, filterStatus } = get();
    if (filterStatus === 'all') return shops;
    return shops.filter((shop) => shop.approvalStatus === filterStatus);
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Refresh Shops
  refreshShops: async (agentId: string) => {
    actionLogger('ShopStore', 'refreshShops', agentId);
    await get().fetchShops(agentId);
  },
}));
