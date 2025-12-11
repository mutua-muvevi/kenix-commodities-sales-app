/**
 * Shop Type Definitions
 * Defines types for shops, KYC registration, and shop-related operations
 */

export interface Shop {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  shopName: string;
  businessRegNumber?: string;
  location?: GeoLocation;
  address?: Address;
  approvalStatus: ShopStatus;
  rejectionReason?: string;
  shopPhoto?: string;
  operatingHours?: OperatingHours;
  category?: ShopCategory;
  specialNotes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  totalSpent?: number;
  customerSegment?: CustomerSegment;
  creditLimit?: number;
  creditUsed?: number;
  recentOrders?: any[]; // For quick reorder feature
  accountActivated?: boolean; // Shop owner has login credentials
  credentialsSent?: boolean; // Credentials were sent via SMS/WhatsApp
}

export type ShopStatus = 'pending' | 'approved' | 'rejected';
export type ShopCategory = 'retail' | 'wholesale' | 'kiosk' | 'supermarket' | 'other';
export type CustomerSegment = 'new' | 'active' | 'vip' | 'dormant' | 'at_risk';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street?: string;
  area?: string;
  city?: string;
  county?: string;
  postalCode?: string;
}

export interface OperatingHours {
  open?: string;
  close?: string;
  days?: string[];
}

export interface ShopFormData {
  shopName: string;
  ownerName: string;
  phoneNumber: string;
  email?: string;
  businessRegNumber?: string;
  location?: GeoLocation;
  address?: Address;
  shopPhoto?: string;
  operatingHours?: OperatingHours;
  category?: ShopCategory;
  specialNotes?: string;
}

export interface KYCFormData {
  shopName: string;
  ownerName: string;
  phoneNumber: string;
  email?: string;
  businessRegNumber?: string;
  address: Address;
  shopPhoto: string;
  category: ShopCategory;
  operatingHours?: OperatingHours;
  specialNotes?: string;
}

export interface KYCUploadResponse {
  success: boolean;
  data: {
    shop: Shop;
  };
  message: string;
}

export interface ShopListItem {
  _id: string;
  shopName: string;
  ownerName: string;
  phoneNumber: string;
  approvalStatus: ShopStatus;
  lastOrderDate?: string;
  totalOrders?: number;
  location?: GeoLocation;
  customerSegment?: CustomerSegment;
  distance?: number; // km from current location
}

export interface RFMSegment {
  recency: number; // days since last order
  frequency: number; // number of orders
  monetary: number; // total spent
  segment: CustomerSegment;
  score: number; // 1-5
}

export interface ShopInsights {
  rfm?: RFMSegment;
  averageOrderValue: number;
  preferredProducts: string[];
  lastVisitDate?: string;
  nextRecommendedVisit?: string;
  orderingPattern?: 'regular' | 'seasonal' | 'irregular';
}
