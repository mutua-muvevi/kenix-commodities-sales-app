import { _payments, getPaymentStats as getMockStats, filterPayments } from '../../_mock/_payments';
import type {
  Payment,
  PaymentStats,
  PaymentFilters,
  PaymentsResponse,
  ExportPaymentsData
} from '../../types/payment';
import { format } from 'date-fns';

// Simulated API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get paginated list of payments with filters
 */
export async function getPayments(filters?: PaymentFilters): Promise<PaymentsResponse> {
  await delay();

  let filtered = filterPayments(_payments, filters);

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginated = filtered.slice(startIndex, endIndex);

  return {
    payments: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

/**
 * Get a single payment by ID
 */
export async function getPayment(id: string): Promise<Payment | null> {
  await delay(300);

  const payment = _payments.find(p => p._id === id || p.transactionId === id);
  return payment || null;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  await delay(300);

  return getMockStats();
}

/**
 * Get all payments for a specific order
 */
export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  await delay(400);

  return _payments
    .filter(p => p.orderId === orderId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get all payments for a specific loan
 */
export async function getPaymentsByLoan(loanId: string): Promise<Payment[]> {
  await delay(400);

  return _payments
    .filter(p => p.loanId === loanId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Export payments to CSV format
 */
export async function exportPayments(filters?: PaymentFilters): Promise<ExportPaymentsData> {
  await delay(800);

  let filtered = filterPayments(_payments, filters);

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // CSV headers
  const headers = [
    'Transaction ID',
    'Date',
    'Amount (KES)',
    'Status',
    'Payment Method',
    'Payer Name',
    'Payer Phone',
    'Order ID',
    'Loan ID',
    'M-Pesa Transaction ID',
    'Reference',
    'Collection Type'
  ];

  // CSV rows
  const rows = filtered.map(payment => [
    payment.transactionId,
    format(new Date(payment.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    payment.amount.toFixed(2),
    payment.status,
    payment.paymentMethod,
    payment.payer.name,
    payment.payer.phone,
    payment.orderId || '-',
    payment.loanId || '-',
    payment.mpesaTransactionId || '-',
    payment.reference,
    payment.metadata.collectionType
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Generate filename with timestamp
  const filename = `payments_export_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;

  return {
    csv: csvContent,
    filename
  };
}

/**
 * Search payments by transaction ID, payer name, or phone
 */
export async function searchPayments(query: string): Promise<Payment[]> {
  await delay(400);

  const searchLower = query.toLowerCase();

  return _payments
    .filter(p =>
      p.transactionId.toLowerCase().includes(searchLower) ||
      p.payer.name.toLowerCase().includes(searchLower) ||
      p.payer.phone.includes(searchLower) ||
      p.reference.toLowerCase().includes(searchLower)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get payment method statistics
 */
export async function getPaymentMethodStats(): Promise<Record<string, number>> {
  await delay(300);

  const completedPayments = _payments.filter(p => p.status === 'completed');

  return {
    mpesa: completedPayments.filter(p => p.paymentMethod === 'mpesa').reduce((sum, p) => sum + p.amount, 0),
    cash: completedPayments.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.amount, 0),
    bank: completedPayments.filter(p => p.paymentMethod === 'bank').reduce((sum, p) => sum + p.amount, 0)
  };
}
