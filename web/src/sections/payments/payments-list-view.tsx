'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Stack
} from '@mui/material';
import { toast } from 'sonner';
import { PaymentSummaryCards } from './payment-summary-cards';
import { PaymentTableToolbar } from './payment-table-toolbar';
import { PaymentTableRow } from './payment-table-row';
import { PaymentDetailModal } from './payment-detail-modal';
import {
  getPayments,
  getPaymentStats,
  exportPayments
} from '../../lib/api/payments';
import type { Payment, PaymentStats, PaymentStatus, PaymentMethod } from '../../types/payment';

export function PaymentsListView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalCollected: 0,
    pending: 0,
    failed: 0,
    todayCollection: 0
  });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all' as PaymentStatus | 'all',
    method: 'all' as PaymentMethod | 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPayments({
        ...filters,
        page: page + 1,
        limit: rowsPerPage
      });
      setPayments(response.payments);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load payment statistics');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const exportData = await exportPayments(filters);

      // Create blob and download
      const blob = new Blob([exportData.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', exportData.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Payments exported successfully');
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast.error('Failed to export payments');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Payments & Transactions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and track all payment transactions
        </Typography>
      </Stack>

      {/* Summary Cards */}
      <PaymentSummaryCards stats={stats} loading={loading && payments.length === 0} />

      {/* Filters */}
      <PaymentTableToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        exportLoading={exportLoading}
      />

      {/* Table */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Transaction ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date & Time
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Method
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Payer
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Related To
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Reference
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No payments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <PaymentTableRow
                    key={payment._id}
                    payment={payment}
                    onView={handleViewPayment}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && payments.length > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: 1,
              borderColor: 'divider'
            }}
          />
        )}
      </Card>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        open={detailModalOpen}
        payment={selectedPayment}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
        }}
      />
    </Box>
  );
}
