// src/lib/api/inventory.ts
import apiClient from './client';

export interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    sku: string;
    images?: string[];
  };
  quantity: number;
  reserved: number;
  available: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  minStockLevel: number;
  lastRestockDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryHistory {
  _id: string;
  product: {
    _id: string;
    productName: string;
  };
  type: 'adjustment' | 'restock' | 'sale' | 'return' | 'damage';
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface AdjustStockData {
  adjustmentType: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  stockStatus?: string;
  category?: string;
}

/**
 * Get inventory list
 */
export const getInventory = async (params?: InventoryListParams) => {
  const response = await apiClient.get('/inventory', { params });
  return response.data;
};

/**
 * Get single inventory item
 */
export const getInventoryItem = async (productId: string) => {
  const response = await apiClient.get(`/inventory/${productId}`);
  return response.data;
};

/**
 * Adjust stock
 */
export const adjustStock = async (productId: string, data: AdjustStockData) => {
  const response = await apiClient.patch(`/inventory/${productId}/adjust`, data);
  return response.data;
};

/**
 * Get inventory history
 */
export const getInventoryHistory = async (productId?: string, params?: { page?: number; limit?: number }) => {
  const url = productId ? `/inventory/${productId}/history` : '/inventory/history';
  const response = await apiClient.get(url, { params });
  return response.data;
};

/**
 * Set minimum stock level
 */
export const setMinStockLevel = async (productId: string, minStockLevel: number) => {
  const response = await apiClient.patch(`/inventory/${productId}/min-stock`, { minStockLevel });
  return response.data;
};

/**
 * Export inventory to CSV
 */
export const exportInventory = async () => {
  const response = await apiClient.get('/inventory/export', {
    responseType: 'blob',
  });
  return response.data;
};
