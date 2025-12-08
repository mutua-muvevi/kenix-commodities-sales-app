'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Edit, CheckCircle, Block, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getRiderDetail } from '@/lib/api/riders';
import type { RiderDetailResponse } from '@/types/rider';
import RiderPerformanceCard from './rider-performance-card';
import RiderWalletCard from './rider-wallet-card';
import RiderQuickActions from './rider-quick-actions';

interface RiderDetailViewProps {
  riderId: string;
}

export default function RiderDetailView({ riderId }: RiderDetailViewProps) {
  const router = useRouter();
  const [data, setData] = useState<RiderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);

  // Fetch rider details
  useEffect(() => {
    const fetchRiderDetail = async () => {
      try {
        setLoading(true);
        const response = await getRiderDetail(riderId);

        if (!response) {
          toast.error('Rider not found');
          router.push('/dashboard/riders');
          return;
        }

        setData(response);
      } catch (error) {
        console.error('Error fetching rider details:', error);
        toast.error('Failed to load rider details');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderDetail();
  }, [riderId, router]);

  // Handle action complete
  const handleActionComplete = async () => {
    // Refresh data
    const response = await getRiderDetail(riderId);
    if (response) {
      setData(response);
    }
  };

  // Handle edit
  const handleEdit = () => {
    router.push(`/dashboard/riders/${riderId}/edit`);
  };

  // Handle back
  const handleBack = () => {
    router.push('/dashboard/riders');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Rider not found
        </Typography>
      </Box>
    );
  }

  const { rider, wallet, performance } = data;

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

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Riders
      </Button>

      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                {/* Avatar */}
                <Avatar
                  src={rider.avatar}
                  alt={`${rider.firstName} ${rider.lastName}`}
                  sx={{ width: 120, height: 120 }}
                >
                  <Typography variant="h3">
                    {rider.firstName.charAt(0)}{rider.lastName.charAt(0)}
                  </Typography>
                </Avatar>

                {/* Info */}
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h5">
                      {rider.firstName} {rider.lastName}
                    </Typography>
                    <Chip
                      label={rider.approvalStatus.charAt(0).toUpperCase() + rider.approvalStatus.slice(1)}
                      color={getStatusColor(rider.approvalStatus)}
                      size="small"
                    />
                    {!rider.isActive && (
                      <Chip label="Inactive" color="default" size="small" variant="outlined" />
                    )}
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Email: {rider.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {rider.phone}
                    </Typography>
                    {rider.currentRouteName && (
                      <Typography variant="body2" color="text.secondary">
                        Current Route: {rider.currentRouteName}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Member since: {new Date(rider.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Stack>
                </Box>

                {/* Actions */}
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    fullWidth
                  >
                    Edit Profile
                  </Button>

                  {rider.approvalStatus === 'pending' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => setApproveDialogOpen(true)}
                      fullWidth
                    >
                      Approve Rider
                    </Button>
                  )}

                  {rider.approvalStatus !== 'banned' ? (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Block />}
                      onClick={() => setBanDialogOpen(true)}
                      fullWidth
                    >
                      Ban Rider
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircle />}
                      onClick={() => setUnbanDialogOpen(true)}
                      fullWidth
                    >
                      Unban Rider
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Card */}
        <Grid item xs={12} md={6}>
          <RiderPerformanceCard performance={performance} />
        </Grid>

        {/* Wallet Card */}
        <Grid item xs={12} md={6}>
          <RiderWalletCard wallet={wallet} riderId={rider._id} />
        </Grid>
      </Grid>

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
        onActionComplete={handleActionComplete}
      />
    </Box>
  );
}
