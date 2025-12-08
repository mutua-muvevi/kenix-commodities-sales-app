'use client';

import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Avatar,
  Stack,
  Typography,
  Chip,
  IconButton,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import type { SalesAgent } from '@/types/sales-agent';
import { Iconify } from '@/components/iconify';
import { CustomPopover, usePopover } from '@/components/custom-popover';
import { SalesAgentQuickActions } from './sales-agent-quick-actions';

interface SalesAgentTableRowProps {
  agent: SalesAgent;
  onActionComplete: () => void;
}

export function SalesAgentTableRow({ agent, onActionComplete }: SalesAgentTableRowProps) {
  const router = useRouter();
  const popover = usePopover();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'ban' | 'unban'>('approve');

  const getStatusColor = (status: string) => {
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

  const handleViewDetails = () => {
    router.push(`/dashboard/sales-agents/${agent._id}`);
    popover.onClose();
  };

  const handleApprove = () => {
    setActionType('approve');
    setActionDialogOpen(true);
    popover.onClose();
  };

  const handleBan = () => {
    setActionType('ban');
    setActionDialogOpen(true);
    popover.onClose();
  };

  const handleUnban = () => {
    setActionType('unban');
    setActionDialogOpen(true);
    popover.onClose();
  };

  const handleActionSuccess = () => {
    setActionDialogOpen(false);
    onActionComplete();
  };

  const fullName = `${agent.firstName} ${agent.lastName}`;
  const initials = `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`;

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              {initials}
            </Avatar>
            <Stack>
              <Typography variant="subtitle2" noWrap>
                {fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {agent.email}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{agent.phone}</Typography>
        </TableCell>

        <TableCell align="center">
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="subtitle2">{agent.shopsRegistered}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              +{agent.monthlyMetrics.shopRegistrations} this month
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="center">
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="subtitle2">{agent.ordersPlaced}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              +{agent.monthlyMetrics.orders} this month
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography variant="subtitle2">
              UGX {agent.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              +UGX {agent.monthlyMetrics.revenue.toLocaleString()}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography variant="subtitle2" sx={{ color: 'warning.main' }}>
              UGX {agent.totalCommission.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {agent.commissionRate}% rate
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="center">
          <Chip
            label={agent.approvalStatus.toUpperCase()}
            color={getStatusColor(agent.approvalStatus)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 200 }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Iconify icon="mdi:eye" />
          View Details
        </MenuItem>

        {agent.approvalStatus === 'pending' && (
          <MenuItem onClick={handleApprove} sx={{ color: 'success.main' }}>
            <Iconify icon="mdi:check-circle" />
            Approve Agent
          </MenuItem>
        )}

        {agent.approvalStatus === 'approved' && (
          <MenuItem onClick={handleBan} sx={{ color: 'error.main' }}>
            <Iconify icon="mdi:cancel" />
            Ban Agent
          </MenuItem>
        )}

        {agent.approvalStatus === 'banned' && (
          <MenuItem onClick={handleUnban} sx={{ color: 'info.main' }}>
            <Iconify icon="mdi:restore" />
            Unban Agent
          </MenuItem>
        )}
      </CustomPopover>

      <SalesAgentQuickActions
        agent={agent}
        actionType={actionType}
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </>
  );
}
