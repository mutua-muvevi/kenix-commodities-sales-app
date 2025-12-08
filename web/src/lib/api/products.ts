// src/lib/api/products.ts
import apiClient from './client';

export interface Product {
  _id: string;
  productName: string;
  description: string;
  category: {
    _id: string;
    categoryName: string;
  };
  price: number;
  wholesalePrice?: number;
  unitPrice?: number;
  sku: string;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock';
  quantity: number;
  reserved: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  productName: string;
  description: string;
  category: string;
  price: number;
  wholesalePrice?: number;
  unitPrice?: number;
  sku: string;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock';
  quantity: number;
  images?: string[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  stockStatus?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Get list of products
 */
export const getProducts = async (params?: ProductListParams) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

/**
 * Get single product
 */
export const getProduct = async (productId: string) => {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
};

/**
 * Create new product (Admin only)
 */
export const createProduct = async (data: CreateProductData) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

/**
 * Update product (Admin only)
 */
export const updateProduct = async (productId: string, data: Partial<CreateProductData>) => {
  const response = await apiClient.patch(`/products/${productId}`, data);
  return response.data;
};

/**
 * Delete product (Admin only)
 */
export const deleteProduct = async (productId: string) => {
  const response = await apiClient.delete(`/products/${productId}`);
  return response.data;
};
