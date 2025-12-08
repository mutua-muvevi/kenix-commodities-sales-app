'use client';

import React from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Box,
  Typography,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Phone,
  Money,
  AccountBalance,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  Error,
  Undo
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Payment, PaymentStatus, PaymentMethod } from '../../types/payment';

interface PaymentTableRowProps {
  payment: Payment;
  onView: (payment: Payment) => void;
}

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'mpesa':
      return <Phone sx={{ fontSize: 20, color: '#10B981' }} />;
    case 'cash':
      return <Money sx={{ fontSize: 20, color: '#F59E0B' }} />;
    case 'bank':
      return <AccountBalance sx={{ fontSize: 20, color: '#3B82F6' }} />;
    default:
      return null;
  }
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case 'mpesa':
      return 'M-Pesa';
    case 'cash':
      return 'Cash';
    case 'bank':
      return 'Bank Transfer';
    default:
      return method;
  }
};

const getStatusConfig = (status: PaymentStatus) => {
  switch (status) {
    case 'completed':
      return {
        color: 'success' as const,
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        label: 'Completed'
      };
    case 'pending':
      return {
        color: 'warning' as const,
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        label: 'Pending'
      };
    case 'failed':
      return {
        color: 'error' as const,
        icon: <Error sx={{ fontSize: 16 }} />,
        label: 'Failed'
      };
    case 'refunded':
      return {
        color: 'info' as const,
        icon: <Undo sx={{ fontSize: 16 }} />,
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export function PaymentTableRow({ payment, onView }: PaymentTableRowProps) {
  const statusConfig = getStatusConfig(payment.status);

  return (
    <TableRow
      hover
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
    >
      {/* Transaction ID */}
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {payment.transactionId}
        </Typography>
      </TableCell>

      {/* Date & Time */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {format(new Date(payment.timestamp), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(payment.timestamp), 'HH:mm:ss')}
          </Typography>
        </Stack>
      </TableCell>

      {/* Amount */}
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(payment.amount)}
        </Typography>
      </TableCell>

      {/* Payment Method */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          {getPaymentMethodIcon(payment.paymentMethod)}
          <Typography variant="body2">
            {getPaymentMethodLabel(payment.paymentMethod)}
          </Typography>
        </Stack>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          icon={statusConfig.icon}
          label={statusConfig.label}
          color={statusConfig.color}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </TableCell>

      {/* Payer */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={500}>
            {payment.payer.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payment.payer.phone}
          </Typography>
        </Stack>
      </TableCell>

      {/* Related To */}
      <TableCell>
        {payment.orderId && (
          <Tooltip title="Order Payment">
            <Chip
              label={payment.metadata.orderNumber || payment.orderId}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.75rem' }}
            />
          </Tooltip>
        )}
        {payment.loanId && (
          <Tooltip title="Loan Payment">
            <Chip
              label={payment.metadata.loanCode || payment.loanId}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: '0.75rem' }}
            />
          </Tooltip>
        )}
        {!payment.orderId && !payment.loanId && (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>

      {/* Reference */}
      <TableCell>
        <Tooltip title={payment.reference}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {payment.reference}
          </Typography>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onView(payment);
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.lighter'
              }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
