'use client';

import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  AssignmentInd,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Delivery, DeliveryStatus, PaymentStatus } from '../../types/delivery';
import { updateDeliveryStatus } from '../../lib/api/deliveries';

interface DeliveryTableRowProps {
  delivery: Delivery;
  onUpdate: () => void;
}

// Status chip color mapping
const STATUS_COLORS: Record<DeliveryStatus, 'default' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  'in-progress': 'primary',
  completed: 'success',
  failed: 'error'
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'default' | 'warning' | 'success'> = {
  pending: 'default',
  partial: 'warning',
  complete: 'success'
};

export default function DeliveryTableRow({ delivery, onUpdate }: DeliveryTableRowProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [updating, setUpdating] = useState(false);

  const completedShops = delivery.shops.filter(s => s.status === 'completed').length;
  const totalShops = delivery.shops.length;
  const progress = totalShops > 0 ? (completedShops / totalShops) * 100 : 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    handleMenuClose();
    router.push(`/dashboard/deliveries/${delivery._id}`);
  };

  const handleRowClick = () => {
    router.push(`/dashboard/deliveries/${delivery._id}`);
  };

  const handleMarkCompleted = async () => {
    handleMenuClose();
    try {
      setUpdating(true);
      await updateDeliveryStatus(delivery._id, 'completed');
      toast.success('Delivery marked as completed');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkFailed = async () => {
    handleMenuClose();
    try {
      setUpdating(true);
      await updateDeliveryStatus(delivery._id, 'failed', 'Manually marked as failed');
      toast.success('Delivery marked as failed');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update delivery');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <TableRow
        hover
        onClick={handleRowClick}
        sx={{ cursor: 'pointer', opacity: updating ? 0.6 : 1 }}
      >
        <TableCell>
          <Typography variant="subtitle2" fontWeight={600}>
            {delivery.deliveryCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(delivery.createdAt).toLocaleDateString()}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{delivery.routeName}</Typography>
        </TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={500}>
              {delivery.riderName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {delivery.riderPhone}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {completedShops}/{totalShops} shops
          </Typography>
        </TableCell>

        <TableCell>
          <Chip
            label={delivery.status.replace('-', ' ').toUpperCase()}
            color={STATUS_COLORS[delivery.status]}
            size="small"
          />
        </TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(delivery.collectedAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {formatCurrency(delivery.totalAmount)}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Chip
            label={delivery.paymentStatus.toUpperCase()}
            color={PAYMENT_STATUS_COLORS[delivery.paymentStatus]}
            size="small"
          />
        </TableCell>

        <TableCell>
          <Box sx={{ width: 100 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color={
                    progress === 100
                      ? 'success'
                      : progress > 0
                      ? 'primary'
                      : 'inherit'
                  }
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Stack>
          </Box>
        </TableCell>

        <TableCell align="right">
          <Tooltip title="Actions">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              disabled={updating}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        {delivery.status !== 'completed' && (
          <MenuItem onClick={handleMarkCompleted}>
            <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
            Mark as Completed
          </MenuItem>
        )}
        {delivery.status !== 'failed' && (
          <MenuItem onClick={handleMarkFailed}>
            <Cancel sx={{ mr: 1, fontSize: 20 }} />
            Mark as Failed
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <AssignmentInd sx={{ mr: 1, fontSize: 20 }} />
          Reassign Rider
        </MenuItem>
      </Menu>
    </>
  );
}
