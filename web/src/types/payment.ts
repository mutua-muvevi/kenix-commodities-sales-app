export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'mpesa' | 'cash' | 'bank';

export type CollectionType = 'order' | 'loan';

export interface PaymentPayer {
  userId: string;
  name: string;
  phone: string;
}

export interface PaymentMetadata {
  orderNumber?: string;
  loanCode?: string;
  collectionType: CollectionType;
  notes?: string;
}

export interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  payer: PaymentPayer;
  orderId?: string;
  loanId?: string;
  mpesaTransactionId?: string;
  reference: string;
  timestamp: string;
  metadata: PaymentMetadata;
}

export interface PaymentStats {
  totalCollected: number;
  pending: number;
  failed: number;
  todayCollection: number;
}

export interface PaymentFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: PaymentStatus | 'all';
  method?: PaymentMethod | 'all';
  type?: CollectionType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExportPaymentsData {
  csv: string;
  filename: string;
}
