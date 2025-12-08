// src/lib/api/settings.ts
import apiClient from './client';

export interface SystemSettings {
  _id: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  loanInterestRate: number;
  salesAgentCommissionRate: number;
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    shortCode: string;
    passKey: string;
    environment: 'sandbox' | 'production';
  };
  sms: {
    apiKey: string;
    username: string;
    senderId: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedAt: string;
}

export interface UpdateSettingsData {
  minimumOrderAmount?: number;
  deliveryFee?: number;
  loanInterestRate?: number;
  salesAgentCommissionRate?: number;
}

/**
 * Get system settings
 */
export const getSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

/**
 * Update system settings
 */
export const updateSettings = async (data: UpdateSettingsData) => {
  const response = await apiClient.patch('/settings', data);
  return response.data;
};

/**
 * Update M-Pesa configuration
 */
export const updateMpesaConfig = async (data: SystemSettings['mpesa']) => {
  const response = await apiClient.patch('/settings/mpesa', data);
  return response.data;
};

/**
 * Update SMS configuration
 */
export const updateSmsConfig = async (data: SystemSettings['sms']) => {
  const response = await apiClient.patch('/settings/sms', data);
  return response.data;
};
