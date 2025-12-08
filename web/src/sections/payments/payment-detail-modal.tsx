'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
  Stack,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  Close,
  Phone,
  Money,
  AccountBalance,
  CheckCircle,
  HourglassEmpty,
  Error,
  Undo,
  Person,
  Receipt,
  CreditCard,
  CalendarToday,
  Description
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Payment, PaymentStatus, PaymentMethod } from '../../types/payment';

interface PaymentDetailModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

const getPaymentMethodConfig = (method: PaymentMethod) => {
  switch (method) {
    case 'mpesa':
      return {
        icon: <Phone sx={{ fontSize: 24, color: '#10B981' }} />,
        label: 'M-Pesa',
        bgColor: '#D1FAE5'
      };
    case 'cash':
      return {
        icon: <Money sx={{ fontSize: 24, color: '#F59E0B' }} />,
        label: 'Cash',
        bgColor: '#FEF3C7'
      };
    case 'bank':
      return {
        icon: <AccountBalance sx={{ fontSize: 24, color: '#3B82F6' }} />,
        label: 'Bank Transfer',
        bgColor: '#DBEAFE'
      };
    default:
      return {
        icon: null,
        label: method,
        bgColor: '#F3F4F6'
      };
  }
};

const getStatusConfig = (status: PaymentStatus) => {
  switch (status) {
    case 'completed':
      return {
        color: 'success' as const,
        icon: <CheckCircle />,
        label: 'Completed'
      };
    case 'pending':
      return {
        color: 'warning' as const,
        icon: <HourglassEmpty />,
        label: 'Pending'
      };
    case 'failed':
      return {
        color: 'error' as const,
        icon: <Error />,
        label: 'Failed'
      };
    case 'refunded':
      return {
        color: 'info' as const,
        icon: <Undo />,
        label: 'Refunded'
      };
    default:
      return {
        color: 'default' as const,
        icon: null,
        label: status
      };
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start" py={1.5}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover',
        flexShrink: 0
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export function PaymentDetailModal({ open, payment, onClose }: PaymentDetailModalProps) {
  if (!payment) return null;

  const statusConfig = getStatusConfig(payment.status);
  const methodConfig = getPaymentMethodConfig(payment.paymentMethod);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Payment Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3}>
          {/* Transaction Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'background.neutral',
              borderRadius: 2
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(payment.amount)}
                </Typography>
                <Chip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  color={statusConfig.color}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Transaction ID: <strong>{payment.transactionId}</strong>
              </Typography>
            </Stack>
          </Paper>

          {/* Payment Method */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
              Payment Method
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: methodConfig.bgColor,
                borderRadius: 2
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white'
                }}
              >
                {methodConfig.icon}
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {methodConfig.label}
                </Typography>
                {payment.mpesaTransactionId && (
                  <Typography variant="caption" color="text.secondary">
                    Ref: {payment.mpesaTransactionId}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* Transaction Details */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
              Transaction Information
            </Typography>
            <Stack spacing={0.5} divider={<Divider />}>
              <InfoRow
                icon={<CalendarToday fontSize="small" color="action" />}
                label="Date & Time"
                value={format(new Date(payment.timestamp), 'PPpp')}
              />
              <InfoRow
                icon={<Receipt fontSize="small" color="action" />}
                label="Transaction ID"
                value={payment.transactionId}
              />
              {payment.mpesaTransactionId && (
                <InfoRow
                  icon={<CreditCard fontSize="small" color="action" />}
                  label="M-Pesa Transaction ID"
                  value={payment.mpesaTransactionId}
                />
              )}
              <InfoRow
                icon={<Description fontSize="small" color="action" />}
                label="Reference"
                value={payment.reference}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Payer Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
              Payer Information
            </Typography>
            <Stack spacing={0.5} divider={<Divider />}>
              <InfoRow
                icon={<Person fontSize="small" color="action" />}
                label="Name"
                value={payment.payer.name}
              />
              <InfoRow
                icon={<Phone fontSize="small" color="action" />}
                label="Phone Number"
                value={payment.payer.phone}
              />
            </Stack>
          </Box>

          {/* Related Information */}
          {(payment.orderId || payment.loanId) && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                  Related To
                </Typography>
                <Stack spacing={1}>
                  {payment.orderId && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'primary.lighter',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Order Payment
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.metadata.orderNumber || payment.orderId}
                      </Typography>
                    </Paper>
                  )}
                  {payment.loanId && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'secondary.lighter',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Loan Repayment
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.metadata.loanCode || payment.loanId}
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Additional Metadata */}
          {payment.metadata.notes && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {payment.metadata.notes}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
