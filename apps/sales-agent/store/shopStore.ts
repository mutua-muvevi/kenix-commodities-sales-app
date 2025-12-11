import { create } from 'zustand';
import apiService from '../services/api';

interface Shop {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  shopName: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: {
    street?: string;
    area?: string;
    city?: string;
    county?: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  shopPhoto?: string;
  operatingHours?: {
    open?: string;
    close?: string;
    days?: string[];
  };
  createdBy?: string;
  createdAt?: string;
}

interface ShopState {
  shops: Shop[];
  isLoading: boolean;
  error: string | null;
  selectedShop: Shop | null;
  fetchShops: (agentId: string, status?: string) => Promise<void>;
  setSelectedShop: (shop: Shop | null) => void;
  registerShop: (shopData: any) => Promise<any>;
  updateShop: (shopId: string, updateData: any) => Promise<any>;
  refreshShops: (agentId: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  isLoading: false,
  error: null,
  selectedShop: null,

  fetchShops: async (agentId: string, status?: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await apiService.getMyShops(agentId, status);
      set({ shops: data.users || data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch shops',
        isLoading: false,
      });
    }
  },

  setSelectedShop: (shop: Shop | null) => {
    set({ selectedShop: shop });
  },

  registerShop: async (shopData: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.registerShop(shopData);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to register shop',
        isLoading: false,
      });
      throw error;
    }
  },

  updateShop: async (shopId: string, updateData: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.put(`/user/edit/${shopId}`, updateData);

      // Update the shop in the local state
      const shops = get().shops;
      const updatedShops = shops.map((shop) =>
        shop._id === shopId ? { ...shop, ...updateData } : shop
      );
      set({ shops: updatedShops, isLoading: false });

      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update shop',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshShops: async (agentId: string) => {
    await get().fetchShops(agentId);
  },
}));
