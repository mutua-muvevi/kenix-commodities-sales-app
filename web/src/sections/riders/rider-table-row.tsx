'use client';

import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Stack,
  Box,
  Rating,
} from '@mui/material';
import { Visibility, CheckCircle, Block } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Rider } from '@/types/rider';
import RiderQuickActions from './rider-quick-actions';

interface RiderTableRowProps {
  rider: Rider;
  onActionComplete: () => void;
}

export default function RiderTableRow({ rider, onActionComplete }: RiderTableRowProps) {
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);

  // Get status chip color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle view rider
  const handleView = () => {
    router.push(`/dashboard/riders/${rider._id}`);
  };

  // Handle approve click
  const handleApproveClick = () => {
    if (rider.approvalStatus === 'pending') {
      setApproveDialogOpen(true);
    }
  };

  // Handle ban click
  const handleBanClick = () => {
    if (rider.approvalStatus !== 'banned') {
      setBanDialogOpen(true);
    } else {
      setUnbanDialogOpen(true);
    }
  };

  // Format wallet balance with color
  const walletBalanceColor = rider.walletBalance >= 0 ? 'success.main' : 'error.main';

  return (
    <>
      <TableRow hover>
        {/* Rider Name & Avatar */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={rider.avatar}
              alt={`${rider.firstName} ${rider.lastName}`}
              sx={{ width: 40, height: 40 }}
            >
              {rider.firstName.charAt(0)}{rider.lastName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {rider.firstName} {rider.lastName}
              </Typography>
              {!rider.isActive && (
                <Typography variant="caption" color="text.secondary">
                  (Inactive)
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        {/* Contact Info */}
        <TableCell>
          <Typography variant="body2">{rider.email}</Typography>
          <Typography variant="caption" color="text.secondary">
            {rider.phone}
          </Typography>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Chip
            label={rider.approvalStatus.charAt(0).toUpperCase() + rider.approvalStatus.slice(1)}
            color={getStatusColor(rider.approvalStatus)}
            size="small"
          />
        </TableCell>

        {/* Deliveries */}
        <TableCell align="center">
          <Typography variant="body2" fontWeight={600}>
            {rider.deliveriesCompleted}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            total
          </Typography>
        </TableCell>

        {/* Collection Rate */}
        <TableCell align="center">
          <Typography
            variant="body2"
            fontWeight={600}
            color={rider.collectionRate >= 80 ? 'success.main' : rider.collectionRate >= 50 ? 'warning.main' : 'error.main'}
          >
            {rider.collectionRate.toFixed(1)}%
          </Typography>
        </TableCell>

        {/* Wallet Balance */}
        <TableCell align="right">
          <Typography variant="body2" fontWeight={600} color={walletBalanceColor}>
            KES {rider.walletBalance.toLocaleString()}
          </Typography>
        </TableCell>

        {/* Rating */}
        <TableCell align="center">
          <Box>
            <Rating value={rider.rating} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary" display="block">
              {rider.rating.toFixed(1)}
            </Typography>
          </Box>
        </TableCell>

        {/* Actions */}
        <TableCell align="right">
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {/* View Details */}
            <IconButton
              size="small"
              onClick={handleView}
              title="View Details"
            >
              <Visibility fontSize="small" />
            </IconButton>

            {/* Approve (only for pending riders) */}
            {rider.approvalStatus === 'pending' && (
              <IconButton
                size="small"
                color="success"
                onClick={handleApproveClick}
                title="Approve Rider"
              >
                <CheckCircle fontSize="small" />
              </IconButton>
            )}

            {/* Ban/Unban */}
            <IconButton
              size="small"
              color={rider.approvalStatus === 'banned' ? 'primary' : 'error'}
              onClick={handleBanClick}
              title={rider.approvalStatus === 'banned' ? 'Unban Rider' : 'Ban Rider'}
            >
              <Block fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Action Dialogs */}
      <RiderQuickActions
        riderId={rider._id}
        riderName={`${rider.firstName} ${rider.lastName}`}
        currentStatus={rider.approvalStatus}
        approveDialogOpen={approveDialogOpen}
        banDialogOpen={banDialogOpen}
        unbanDialogOpen={unbanDialogOpen}
        onApproveDialogClose={() => setApproveDialogOpen(false)}
        onBanDialogClose={() => setBanDialogOpen(false)}
        onUnbanDialogClose={() => setUnbanDialogOpen(false)}
        onActionComplete={onActionComplete}
      />
    </>
  );
}
