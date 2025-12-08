'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { toast } from 'sonner';
import type { SalesAgent } from '@/types/sales-agent';
import { approveSalesAgent, banSalesAgent, unbanSalesAgent } from '@/lib/api/sales-agents';

interface SalesAgentQuickActionsProps {
  agent: SalesAgent;
  actionType: 'approve' | 'ban' | 'unban';
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SalesAgentQuickActions({
  agent,
  actionType,
  open,
  onClose,
  onSuccess,
}: SalesAgentQuickActionsProps) {
  const [loading, setLoading] = useState(false);
  const [banReason, setBanReason] = useState('');

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await approveSalesAgent(agent._id);

      if (response.success) {
        toast.success(response.message);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to approve agent:', error);
      toast.error('Failed to approve agent');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      toast.error('Please provide a reason for banning');
      return;
    }

    try {
      setLoading(true);
      const response = await banSalesAgent(agent._id, banReason);

      if (response.success) {
        toast.success(response.message);
        setBanReason('');
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to ban agent:', error);
      toast.error('Failed to ban agent');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    try {
      setLoading(true);
      const response = await unbanSalesAgent(agent._id);

      if (response.success) {
        toast.success(response.message);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to unban agent:', error);
      toast.error('Failed to unban agent');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    switch (actionType) {
      case 'approve':
        handleApprove();
        break;
      case 'ban':
        handleBan();
        break;
      case 'unban':
        handleUnban();
        break;
    }
  };

  const getDialogContent = () => {
    const fullName = `${agent.firstName} ${agent.lastName}`;

    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Sales Agent',
          content: (
            <Stack spacing={2}>
              <Typography>
                Are you sure you want to approve <strong>{fullName}</strong>?
              </Typography>
              <Alert severity="info">
                This agent will be able to register shops and earn commissions from orders.
              </Alert>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Agent Details:
                </Typography>
                <Typography variant="body2">Email: {agent.email}</Typography>
                <Typography variant="body2">Phone: {agent.phone}</Typography>
                <Typography variant="body2">
                  Shops Registered: {agent.shopsRegistered}
                </Typography>
                <Typography variant="body2">
                  Commission Rate: {agent.commissionRate}%
                </Typography>
              </Stack>
            </Stack>
          ),
          confirmText: 'Approve Agent',
          confirmColor: 'success' as const,
        };

      case 'ban':
        return {
          title: 'Ban Sales Agent',
          content: (
            <Stack spacing={2}>
              <Typography>
                Are you sure you want to ban <strong>{fullName}</strong>?
              </Typography>
              <Alert severity="warning">
                This agent will not be able to register new shops or earn commissions. Existing
                shops will remain active.
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for banning"
                placeholder="Enter the reason for banning this agent..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                required
              />
            </Stack>
          ),
          confirmText: 'Ban Agent',
          confirmColor: 'error' as const,
        };

      case 'unban':
        return {
          title: 'Unban Sales Agent',
          content: (
            <Stack spacing={2}>
              <Typography>
                Are you sure you want to unban <strong>{fullName}</strong>?
              </Typography>
              <Alert severity="info">
                The agent status will be set to pending for review. You can approve them again to
                allow them to register shops and earn commissions.
              </Alert>
              {agent.banReason && (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Previous ban reason:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {agent.banReason}
                  </Typography>
                </Stack>
              )}
            </Stack>
          ),
          confirmText: 'Unban Agent',
          confirmColor: 'info' as const,
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogContent.title}</DialogTitle>
      <DialogContent>{dialogContent.content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAction}
          variant="contained"
          color={dialogContent.confirmColor}
          disabled={loading}
        >
          {loading ? 'Processing...' : dialogContent.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
