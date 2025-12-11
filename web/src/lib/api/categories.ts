// src/lib/api/categories.ts
import apiClient from './client';

export interface Category {
  _id: string;
  categoryName: string;
  description?: string;
  image?: string;
  parent?: string | Category;
  displayOrder?: number;
  isActive?: boolean;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  categoryName: string;
  description?: string;
  image?: string;
  parent?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  isActive?: boolean;
}

/**
 * Get list of categories with pagination
 */
export const getCategories = async (params?: CategoryListParams) => {
  const response = await apiClient.get('/categories', { params });
  return response.data;
};

/**
 * Get single category
 */
export const getCategory = async (categoryId: string) => {
  const response = await apiClient.get(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Create category (Admin only)
 */
export const createCategory = async (data: CreateCategoryData) => {
  const response = await apiClient.post('/categories', data);
  return response.data;
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (categoryId: string, data: Partial<CreateCategoryData>) => {
  const response = await apiClient.patch(`/categories/${categoryId}`, data);
  return response.data;
};

/**
 * Delete category (Admin only)
 */
export const deleteCategory = async (categoryId: string) => {
  const response = await apiClient.delete(`/categories/${categoryId}`);
  return response.data;
};
