// src/lib/api/loans.ts
import apiClient from './client';

export interface Loan {
  _id: string;
  loanCode: string;
  shop: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  amount: number;
  purpose: string;
  duration: number; // In months
  interestRate: number;
  totalAmount: number; // Principal + interest
  monthlyPayment: number;
  amountPaid: number;
  outstandingBalance: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted';
  eligibilityScore: number;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  nextPaymentDue?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  _id: string;
  loan: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  paymentDate: string;
  principal: number;
  interest: number;
  balanceAfterPayment: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface LoanSchedule {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paidDate?: string;
}

export interface LoanListParams {
  page?: number;
  limit?: number;
  status?: string;
  shopId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get loans list
 */
export const getLoans = async (params?: LoanListParams) => {
  const response = await apiClient.get('/loans', { params });
  return response.data;
};

/**
 * Get single loan
 */
export const getLoan = async (loanId: string) => {
  const response = await apiClient.get(`/loans/${loanId}`);
  return response.data;
};

/**
 * Get loan repayment schedule
 */
export const getLoanSchedule = async (loanId: string) => {
  const response = await apiClient.get(`/loans/${loanId}/schedule`);
  return response.data;
};

/**
 * Get loan repayment history
 */
export const getLoanRepayments = async (loanId: string) => {
  const response = await apiClient.get(`/loans/${loanId}/repayments`);
  return response.data;
};

/**
 * Approve loan
 */
export const approveLoan = async (loanId: string, data?: { notes?: string }) => {
  const response = await apiClient.patch(`/loans/${loanId}/approve`, data);
  return response.data;
};

/**
 * Reject loan
 */
export const rejectLoan = async (loanId: string, data: { reason: string }) => {
  const response = await apiClient.patch(`/loans/${loanId}/reject`, data);
  return response.data;
};

/**
 * Disburse loan
 */
export const disburseLoan = async (loanId: string, data: { disbursementMethod: string }) => {
  const response = await apiClient.patch(`/loans/${loanId}/disburse`, data);
  return response.data;
};
