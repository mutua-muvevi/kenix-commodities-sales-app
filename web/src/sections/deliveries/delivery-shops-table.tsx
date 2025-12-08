'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import type { DeliveryShop } from '@/types/delivery';

interface DeliveryShopsTableProps {
  shops: DeliveryShop[];
}

export default function DeliveryShopsTable({ shops }: DeliveryShopsTableProps) {
  // Get status chip color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'success' as const,
          icon: <CheckCircle fontSize="small" />,
          label: 'Delivered',
        };
      case 'in-progress':
        return {
          color: 'info' as const,
          icon: <Schedule fontSize="small" />,
          label: 'In Progress',
        };
      case 'failed':
        return {
          color: 'error' as const,
          icon: <Cancel fontSize="small" />,
          label: 'Failed',
        };
      default:
        return {
          color: 'default' as const,
          icon: <Schedule fontSize="small" />,
          label: 'Pending',
        };
    }
  };

  // Format date/time
  const formatDateTime = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>#</TableCell>
            <TableCell>Shop Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Arrived At</TableCell>
            <TableCell align="right">Completed At</TableCell>
            <TableCell>Delivery Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  No shops in this delivery
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            shops.map((shop) => {
              const statusDisplay = getStatusDisplay(shop.status);
              return (
                <TableRow
                  key={shop.shopId}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: shop.status === 'completed' ? 'success.lighter' : 'transparent',
                  }}
                >
                  {/* Sequence Number */}
                  <TableCell>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: shop.status === 'completed' ? 'success.main' : 'grey.300',
                        color: shop.status === 'completed' ? 'white' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {shop.sequenceNumber}
                    </Box>
                  </TableCell>

                  {/* Shop Name */}
                  <TableCell>
                    <Typography variant="subtitle2">{shop.shopName}</Typography>
                  </TableCell>

                  {/* Address */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {shop.address}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      icon={statusDisplay.icon}
                      label={statusDisplay.label}
                      color={statusDisplay.color}
                      size="small"
                    />
                  </TableCell>

                  {/* Arrived At */}
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(shop.arrivedAt)}
                    </Typography>
                  </TableCell>

                  {/* Completed At */}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={shop.completedAt ? 'success.main' : 'text.secondary'}
                      fontWeight={shop.completedAt ? 600 : 400}
                    >
                      {formatDateTime(shop.completedAt)}
                    </Typography>
                  </TableCell>

                  {/* Delivery Note */}
                  <TableCell>
                    {shop.deliveryNote ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {shop.deliveryNote}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
