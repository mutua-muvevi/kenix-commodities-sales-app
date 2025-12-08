import { Payment, PaymentStats } from './types/payment';

// Mock payment data with 25 transactions
export const _payments: Payment[] = [
  {
    _id: '1',
    transactionId: 'PAY-001',
    amount: 15000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-001',
      name: 'John Kamau',
      phone: '+254712345678'
    },
    orderId: 'ORD-2024-001',
    mpesaTransactionId: 'RJK4H5L6M7',
    reference: 'Order payment for maize',
    timestamp: new Date('2024-12-08T09:30:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-001',
      collectionType: 'order'
    }
  },
  {
    _id: '2',
    transactionId: 'PAY-002',
    amount: 25000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'cash',
    payer: {
      userId: 'user-002',
      name: 'Mary Wanjiku',
      phone: '+254723456789'
    },
    orderId: 'ORD-2024-002',
    reference: 'Cash payment for wheat',
    timestamp: new Date('2024-12-08T10:15:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-002',
      collectionType: 'order'
    }
  },
  {
    _id: '3',
    transactionId: 'PAY-003',
    amount: 50000,
    currency: 'KES',
    status: 'pending',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-003',
      name: 'Peter Omondi',
      phone: '+254734567890'
    },
    loanId: 'LOAN-2024-001',
    mpesaTransactionId: 'TXN-PENDING-001',
    reference: 'Loan repayment installment',
    timestamp: new Date('2024-12-08T11:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-001',
      collectionType: 'loan'
    }
  },
  {
    _id: '4',
    transactionId: 'PAY-004',
    amount: 35000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-004',
      name: 'Grace Nyambura',
      phone: '+254745678901'
    },
    orderId: 'ORD-2024-003',
    reference: 'Bank transfer for rice',
    timestamp: new Date('2024-12-07T14:20:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-003',
      collectionType: 'order'
    }
  },
  {
    _id: '5',
    transactionId: 'PAY-005',
    amount: 12000,
    currency: 'KES',
    status: 'failed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-005',
      name: 'David Mwangi',
      phone: '+254756789012'
    },
    orderId: 'ORD-2024-004',
    mpesaTransactionId: 'FAILED-001',
    reference: 'Failed M-Pesa transaction',
    timestamp: new Date('2024-12-07T16:45:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-004',
      collectionType: 'order'
    }
  },
  {
    _id: '6',
    transactionId: 'PAY-006',
    amount: 75000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-006',
      name: 'Sarah Akinyi',
      phone: '+254767890123'
    },
    loanId: 'LOAN-2024-002',
    mpesaTransactionId: 'RJK8H9L0M1',
    reference: 'Loan repayment full settlement',
    timestamp: new Date('2024-12-07T09:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-002',
      collectionType: 'loan'
    }
  },
  {
    _id: '7',
    transactionId: 'PAY-007',
    amount: 18000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'cash',
    payer: {
      userId: 'user-007',
      name: 'James Kipchoge',
      phone: '+254778901234'
    },
    orderId: 'ORD-2024-005',
    reference: 'Cash payment for beans',
    timestamp: new Date('2024-12-06T13:30:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-005',
      collectionType: 'order'
    }
  },
  {
    _id: '8',
    transactionId: 'PAY-008',
    amount: 42000,
    currency: 'KES',
    status: 'refunded',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-008',
      name: 'Lucy Cherono',
      phone: '+254789012345'
    },
    orderId: 'ORD-2024-006',
    mpesaTransactionId: 'RJK2H3L4M5',
    reference: 'Refunded - Order cancelled',
    timestamp: new Date('2024-12-06T10:15:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-006',
      collectionType: 'order'
    }
  },
  {
    _id: '9',
    transactionId: 'PAY-009',
    amount: 28000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-009',
      name: 'Michael Otieno',
      phone: '+254790123456'
    },
    orderId: 'ORD-2024-007',
    reference: 'Bank transfer for maize',
    timestamp: new Date('2024-12-06T08:45:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-007',
      collectionType: 'order'
    }
  },
  {
    _id: '10',
    transactionId: 'PAY-010',
    amount: 55000,
    currency: 'KES',
    status: 'pending',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-010',
      name: 'Alice Wambui',
      phone: '+254701234567'
    },
    loanId: 'LOAN-2024-003',
    reference: 'Pending bank transfer for loan',
    timestamp: new Date('2024-12-08T12:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-003',
      collectionType: 'loan'
    }
  },
  {
    _id: '11',
    transactionId: 'PAY-011',
    amount: 21000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-011',
      name: 'Robert Kariuki',
      phone: '+254712345679'
    },
    orderId: 'ORD-2024-008',
    mpesaTransactionId: 'RJK6H7L8M9',
    reference: 'Order payment for sorghum',
    timestamp: new Date('2024-12-05T15:20:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-008',
      collectionType: 'order'
    }
  },
  {
    _id: '12',
    transactionId: 'PAY-012',
    amount: 33000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'cash',
    payer: {
      userId: 'user-012',
      name: 'Elizabeth Njeri',
      phone: '+254723456780'
    },
    orderId: 'ORD-2024-009',
    reference: 'Cash payment for millet',
    timestamp: new Date('2024-12-05T11:40:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-009',
      collectionType: 'order'
    }
  },
  {
    _id: '13',
    transactionId: 'PAY-013',
    amount: 8000,
    currency: 'KES',
    status: 'failed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-013',
      name: 'Daniel Mutua',
      phone: '+254734567891'
    },
    orderId: 'ORD-2024-010',
    mpesaTransactionId: 'FAILED-002',
    reference: 'Failed payment - Insufficient funds',
    timestamp: new Date('2024-12-05T09:10:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-010',
      collectionType: 'order'
    }
  },
  {
    _id: '14',
    transactionId: 'PAY-014',
    amount: 62000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-014',
      name: 'Patricia Wairimu',
      phone: '+254745678902'
    },
    loanId: 'LOAN-2024-004',
    reference: 'Loan repayment via bank',
    timestamp: new Date('2024-12-04T14:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-004',
      collectionType: 'loan'
    }
  },
  {
    _id: '15',
    transactionId: 'PAY-015',
    amount: 19000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-015',
      name: 'Francis Kimani',
      phone: '+254756789013'
    },
    orderId: 'ORD-2024-011',
    mpesaTransactionId: 'RJK0H1L2M3',
    reference: 'M-Pesa payment for wheat',
    timestamp: new Date('2024-12-04T10:25:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-011',
      collectionType: 'order'
    }
  },
  {
    _id: '16',
    transactionId: 'PAY-016',
    amount: 45000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'cash',
    payer: {
      userId: 'user-016',
      name: 'Monica Adhiambo',
      phone: '+254767890124'
    },
    orderId: 'ORD-2024-012',
    reference: 'Cash payment for rice',
    timestamp: new Date('2024-12-03T16:50:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-012',
      collectionType: 'order'
    }
  },
  {
    _id: '17',
    transactionId: 'PAY-017',
    amount: 15000,
    currency: 'KES',
    status: 'pending',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-017',
      name: 'Vincent Ochieng',
      phone: '+254778901235'
    },
    orderId: 'ORD-2024-013',
    mpesaTransactionId: 'TXN-PENDING-002',
    reference: 'Pending M-Pesa verification',
    timestamp: new Date('2024-12-08T13:15:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-013',
      collectionType: 'order'
    }
  },
  {
    _id: '18',
    transactionId: 'PAY-018',
    amount: 38000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-018',
      name: 'Anne Mumbua',
      phone: '+254789012346'
    },
    orderId: 'ORD-2024-014',
    reference: 'Bank transfer for beans',
    timestamp: new Date('2024-12-03T09:30:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-014',
      collectionType: 'order'
    }
  },
  {
    _id: '19',
    transactionId: 'PAY-019',
    amount: 27000,
    currency: 'KES',
    status: 'refunded',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-019',
      name: 'Simon Njuguna',
      phone: '+254790123457'
    },
    orderId: 'ORD-2024-015',
    mpesaTransactionId: 'RJK4H5L6M8',
    reference: 'Refunded - Duplicate payment',
    timestamp: new Date('2024-12-02T14:20:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-015',
      collectionType: 'order'
    }
  },
  {
    _id: '20',
    transactionId: 'PAY-020',
    amount: 52000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-020',
      name: 'Christine Wangari',
      phone: '+254701234568'
    },
    loanId: 'LOAN-2024-005',
    mpesaTransactionId: 'RJK8H9L0M2',
    reference: 'Loan installment payment',
    timestamp: new Date('2024-12-02T11:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-005',
      collectionType: 'loan'
    }
  },
  {
    _id: '21',
    transactionId: 'PAY-021',
    amount: 16000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'cash',
    payer: {
      userId: 'user-021',
      name: 'Joseph Kiprono',
      phone: '+254712345680'
    },
    orderId: 'ORD-2024-016',
    reference: 'Cash payment for maize',
    timestamp: new Date('2024-12-01T15:45:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-016',
      collectionType: 'order'
    }
  },
  {
    _id: '22',
    transactionId: 'PAY-022',
    amount: 31000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-022',
      name: 'Beatrice Nyokabi',
      phone: '+254723456781'
    },
    orderId: 'ORD-2024-017',
    reference: 'Bank transfer for sorghum',
    timestamp: new Date('2024-12-01T10:30:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-017',
      collectionType: 'order'
    }
  },
  {
    _id: '23',
    transactionId: 'PAY-023',
    amount: 9500,
    currency: 'KES',
    status: 'failed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-023',
      name: 'George Wekesa',
      phone: '+254734567892'
    },
    orderId: 'ORD-2024-018',
    mpesaTransactionId: 'FAILED-003',
    reference: 'Failed - Network timeout',
    timestamp: new Date('2024-11-30T16:20:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-018',
      collectionType: 'order'
    }
  },
  {
    _id: '24',
    transactionId: 'PAY-024',
    amount: 48000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    payer: {
      userId: 'user-024',
      name: 'Eunice Chebet',
      phone: '+254745678903'
    },
    orderId: 'ORD-2024-019',
    mpesaTransactionId: 'RJK2H3L4M6',
    reference: 'M-Pesa payment for wheat',
    timestamp: new Date('2024-11-30T13:10:00').toISOString(),
    metadata: {
      orderNumber: 'ORD-2024-019',
      collectionType: 'order'
    }
  },
  {
    _id: '25',
    transactionId: 'PAY-025',
    amount: 67000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'bank',
    payer: {
      userId: 'user-025',
      name: 'Andrew Mburu',
      phone: '+254756789014'
    },
    loanId: 'LOAN-2024-006',
    reference: 'Full loan settlement',
    timestamp: new Date('2024-11-29T09:00:00').toISOString(),
    metadata: {
      loanCode: 'LOAN-2024-006',
      collectionType: 'loan'
    }
  }
];

// Helper function to get payment statistics
export function getPaymentStats(): PaymentStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedPayments = _payments.filter(p => p.status === 'completed');
  const pendingPayments = _payments.filter(p => p.status === 'pending');
  const failedPayments = _payments.filter(p => p.status === 'failed');

  const todayPayments = completedPayments.filter(p => {
    const paymentDate = new Date(p.timestamp);
    paymentDate.setHours(0, 0, 0, 0);
    return paymentDate.getTime() === today.getTime();
  });

  return {
    totalCollected: completedPayments.reduce((sum, p) => sum + p.amount, 0),
    pending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    failed: failedPayments.length,
    todayCollection: todayPayments.reduce((sum, p) => sum + p.amount, 0)
  };
}

// Helper function to filter payments
export function filterPayments(
  payments: Payment[],
  filters?: {
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
): Payment[] {
  let filtered = [...payments];

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  if (filters?.method && filters.method !== 'all') {
    filtered = filtered.filter(p => p.paymentMethod === filters.method);
  }

  if (filters?.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter(p => new Date(p.timestamp) >= fromDate);
  }

  if (filters?.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(p => new Date(p.timestamp) <= toDate);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.transactionId.toLowerCase().includes(searchLower) ||
      p.payer.name.toLowerCase().includes(searchLower) ||
      p.payer.phone.includes(searchLower) ||
      p.reference.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
