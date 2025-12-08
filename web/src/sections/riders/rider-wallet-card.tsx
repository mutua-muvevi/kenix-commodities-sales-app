'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Assignment,
  Payments,
  Settings,
  AttachMoney,
} from '@mui/icons-material';
import { toast } from 'sonner';
import type { RiderWallet, WalletTransactionType } from '@/types/rider';
import { adjustRiderWallet } from '@/lib/api/riders';

interface RiderWalletCardProps {
  wallet: RiderWallet;
  riderId: string;
}

export default function RiderWalletCard({ wallet, riderId }: RiderWalletCardProps) {
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Get transaction icon
  const getTransactionIcon = (type: WalletTransactionType) => {
    switch (type) {
      case 'assignment':
        return <Assignment fontSize="small" />;
      case 'collection':
        return <Payments fontSize="small" />;
      case 'adjustment':
        return <Settings fontSize="small" />;
      case 'settlement':
        return <AttachMoney fontSize="small" />;
      default:
        return <AccountBalanceWallet fontSize="small" />;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: WalletTransactionType, amount: number): string => {
    if (type === 'collection' || type === 'settlement') {
      return amount > 0 ? 'success.main' : 'error.main';
    }
    if (type === 'assignment') {
      return 'primary.main';
    }
    return 'text.secondary';
  };

  // Handle wallet adjustment
  const handleAdjustWallet = async () => {
    const amount = parseFloat(adjustAmount);

    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!adjustReason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    try {
      setAdjusting(true);
      const response = await adjustRiderWallet(riderId, amount, adjustReason);

      if (response.success) {
        toast.success(response.message);
        setAdjustDialogOpen(false);
        setAdjustAmount('');
        setAdjustReason('');
        // In a real app, you'd refresh the wallet data here
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      toast.error('Failed to adjust wallet');
    } finally {
      setAdjusting(false);
    }
  };

  // Balance color
  const balanceColor = wallet.balance >= 0 ? 'success.main' : 'error.main';

  return (
    <>
      <Card>
        <CardHeader
          title="Wallet"
          action={
            <Button
              size="small"
              startIcon={<Settings />}
              onClick={() => setAdjustDialogOpen(true)}
            >
              Adjust
            </Button>
          }
        />
        <CardContent>
          {/* Current Balance */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Balance
            </Typography>
            <Typography variant="h3" sx={{ color: balanceColor, fontWeight: 600 }}>
              KES {wallet.balance.toLocaleString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Summary Stats */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600} color="success.main">
                KES {wallet.totalEarnings.toLocaleString()}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingDown fontSize="small" color="error" />
                <Typography variant="body2" color="text.secondary">
                  Total Collections
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600} color="error.main">
                KES {wallet.totalCollections.toLocaleString()}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Recent Transactions */}
          <Typography variant="subtitle2" gutterBottom>
            Recent Transactions
          </Typography>

          {wallet.transactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No transactions yet
            </Typography>
          ) : (
            <List disablePadding>
              {wallet.transactions.slice(0, 5).map((transaction) => (
                <ListItem key={transaction._id} disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={{ color: getTransactionColor(transaction.type, transaction.amount) }}>
                      {getTransactionIcon(transaction.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {transaction.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={transaction.amount >= 0 ? 'success.main' : 'error.main'}
                        >
                          {transaction.amount >= 0 ? '+' : ''}
                          KES {transaction.amount.toLocaleString()}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Balance: KES {transaction.balanceAfter.toLocaleString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {wallet.transactions.length > 5 && (
            <Button size="small" fullWidth sx={{ mt: 2 }}>
              View All Transactions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Adjust Wallet Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Rider Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              helperText="Enter positive amount to add funds, negative to deduct"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>KES</Typography>,
              }}
            />
            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={3}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Explain why you're adjusting the wallet balance..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)} disabled={adjusting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdjustWallet}
            disabled={adjusting}
          >
            {adjusting ? 'Adjusting...' : 'Confirm Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
