// src/lib/api/categories.ts
import apiClient from './client';

export interface Category {
  _id: string;
  categoryName: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all categories
 */
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
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
export const createCategory = async (data: { categoryName: string; description?: string; image?: string }) => {
  const response = await apiClient.post('/categories', data);
  return response.data;
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (categoryId: string, data: Partial<Category>) => {
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
