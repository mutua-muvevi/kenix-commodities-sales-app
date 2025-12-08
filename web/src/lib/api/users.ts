// src/lib/api/users.ts
import apiClient from './client';

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: 'shop' | 'rider' | 'sales_agent' | 'admin';
  approvalStatus?: 'pending' | 'approved' | 'banned';
  search?: string;
}

/**
 * Get list of users
 */
export const getUsers = async (params?: UserListParams) => {
  const response = await apiClient.get('/user/fetch/all', { params });
  return response.data;
};

/**
 * Get single user
 */
export const getUser = async (userId: string) => {
  const response = await apiClient.get(`/user/${userId}`);
  return response.data;
};

/**
 * Approve user (Admin only)
 */
export const approveUser = async (userId: string) => {
  const response = await apiClient.patch(`/users/${userId}/approve`);
  return response.data;
};

/**
 * Reject/Ban user (Admin only)
 */
export const banUser = async (userId: string, reason?: string) => {
  const response = await apiClient.patch(`/users/${userId}/ban`, { reason });
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: any) => {
  const response = await apiClient.patch(`/user/${userId}`, data);
  return response.data;
};
