'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { RiderDetailView } from '@/sections/riders';
import { getRiderDetail } from '@/lib/api/riders';
import type { RiderDetailResponse } from '@/types/rider';

export default function RiderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const riderId = params.id as string;

  const [riderDetail, setRiderDetail] = useState<RiderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (riderId) {
      fetchRiderDetail();
    }
  }, [riderId]);

  const fetchRiderDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRiderDetail(riderId);

      if (!data) {
        setError('Rider not found');
        setRiderDetail(null);
      } else {
        setRiderDetail(data);
      }
    } catch (err) {
      console.error('Error fetching rider detail:', err);
      setError('Failed to load rider details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get rider name for breadcrumb
  const riderName = riderDetail?.rider
    ? `${riderDetail.rider.firstName} ${riderDetail.rider.lastName}`
    : 'Rider Details';

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <MuiLink
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </MuiLink>
        <MuiLink
          underline="hover"
          color="inherit"
          href="/dashboard/riders"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard/riders');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Riders
        </MuiLink>
        <Typography color="text.primary">{riderName}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/riders')}
          variant="outlined"
          size="small"
        >
          Back to Riders
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchRiderDetail}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Rider Detail View */}
      {!loading && !error && riderDetail && (
        <>
          {/* Page Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {riderName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View rider details, performance metrics, and wallet transactions
            </Typography>
          </Box>

          {/* Rider Detail Component */}
          <RiderDetailView
            riderDetail={riderDetail}
            onUpdate={fetchRiderDetail}
          />
        </>
      )}
    </Box>
  );
}
