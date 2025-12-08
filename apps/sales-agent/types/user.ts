/**
 * User & Authentication Type Definitions
 * Defines types for sales agents, auth state, and login forms
 */

export interface SalesAgent {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'sales_agent';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  territory?: string;
  region?: string;
  targetShops?: number;
  commissionRate?: number;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  territory?: string;
  region?: string;
}

export interface OTPFormData {
  otp: string;
}

export interface AuthState {
  user: SalesAgent | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: SalesAgent;
    token: string;
  };
  message: string;
}

export interface PerformanceMetrics {
  shopsVisited: number;
  ordersPlaced: number;
  totalSales: number;
  commissionsEarned: number;
  targetAchievement: number; // percentage
  routesCompleted: number;
  newShopsRegistered: number;
}

export interface AgentStats {
  today: PerformanceMetrics;
  week: PerformanceMetrics;
  month: PerformanceMetrics;
  all: PerformanceMetrics;
}
