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
  Alert,
  Stack,
} from '@mui/material';
import { Warning, CheckCircle, Block } from '@mui/icons-material';
import { toast } from 'sonner';
import { approveRider, banRider, unbanRider } from '@/lib/api/riders';
import type { RiderApprovalStatus } from '@/types/rider';

interface RiderQuickActionsProps {
  riderId: string;
  riderName: string;
  currentStatus: RiderApprovalStatus;
  approveDialogOpen: boolean;
  banDialogOpen: boolean;
  unbanDialogOpen: boolean;
  onApproveDialogClose: () => void;
  onBanDialogClose: () => void;
  onUnbanDialogClose: () => void;
  onActionComplete: () => void;
}

export default function RiderQuickActions({
  riderId,
  riderName,
  currentStatus,
  approveDialogOpen,
  banDialogOpen,
  unbanDialogOpen,
  onApproveDialogClose,
  onBanDialogClose,
  onUnbanDialogClose,
  onActionComplete,
}: RiderQuickActionsProps) {
  const [banReason, setBanReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Handle approve rider
  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await approveRider(riderId);

      if (response.success) {
        toast.success(response.message);
        onApproveDialogClose();
        onActionComplete();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error approving rider:', error);
      toast.error('Failed to approve rider');
    } finally {
      setProcessing(false);
    }
  };

  // Handle ban rider
  const handleBan = async () => {
    if (!banReason.trim()) {
      toast.error('Please provide a reason for banning this rider');
      return;
    }

    try {
      setProcessing(true);
      const response = await banRider(riderId, banReason);

      if (response.success) {
        toast.success(response.message);
        onBanDialogClose();
        setBanReason('');
        onActionComplete();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error banning rider:', error);
      toast.error('Failed to ban rider');
    } finally {
      setProcessing(false);
    }
  };

  // Handle unban rider
  const handleUnban = async () => {
    try {
      setProcessing(true);
      const response = await unbanRider(riderId);

      if (response.success) {
        toast.success(response.message);
        onUnbanDialogClose();
        onActionComplete();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error unbanning rider:', error);
      toast.error('Failed to unban rider');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={onApproveDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle color="success" />
            <span>Approve Rider</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Approving this rider will allow them to start accepting delivery assignments.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to approve <strong>{riderName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action will:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 24 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Change their status to "Approved"
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Enable them to receive delivery assignments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Send them a notification about their approval
              </Typography>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={onApproveDialogClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={processing}
          >
            {processing ? 'Approving...' : 'Approve Rider'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onClose={onBanDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning color="error" />
            <span>Ban Rider</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Banning this rider will immediately prevent them from accepting any new assignments.
          </Alert>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to ban <strong>{riderName}</strong>?
          </Typography>

          <TextField
            label="Reason for Ban"
            fullWidth
            multiline
            rows={4}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Please provide a detailed reason for banning this rider..."
            sx={{ mt: 2 }}
            required
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action will:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 24 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Change their status to "Banned"
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Prevent them from receiving new assignments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Suspend their account access
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Send them a notification with the ban reason
              </Typography>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={onBanDialogClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBan}
            disabled={processing || !banReason.trim()}
          >
            {processing ? 'Banning...' : 'Ban Rider'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unban Dialog */}
      <Dialog open={unbanDialogOpen} onClose={onUnbanDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle color="primary" />
            <span>Unban Rider</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Unbanning this rider will restore their ability to accept delivery assignments.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to unban <strong>{riderName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action will:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 24 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Change their status to "Approved"
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Restore their account access
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Allow them to receive delivery assignments again
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Send them a notification about the unban
              </Typography>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={onUnbanDialogClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUnban}
            disabled={processing}
          >
            {processing ? 'Unbanning...' : 'Unban Rider'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
