/**
 * Category Type Definitions
 * Defines types for product categories
 */

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parentCategory?: {
    _id: string;
    name: string;
  } | string;
  displayOrder?: number;
  isActive: boolean;
  products?: any[]; // Optional: included when includeProducts=true
  productCount?: number; // Optional: included when includeProducts=true
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListItem {
  _id: string;
  name: string;
  image?: string;
  productCount: number;
  isActive: boolean;
}

export interface CategoryFilters {
  isActive?: boolean;
  parentCategory?: string;
  includeProducts?: boolean;
  sortBy?: 'name' | 'displayOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCategories: number;
      limit: number;
    };
  };
}
