'use client';

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Rating,
  Grid,
  Divider,
} from '@mui/material';
import {
  LocalShipping,
  CalendarMonth,
  DateRange,
  Timer,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import type { RiderPerformance } from '@/types/rider';

interface RiderPerformanceCardProps {
  performance: RiderPerformance;
}

export default function RiderPerformanceCard({ performance }: RiderPerformanceCardProps) {
  // Format average delivery time (assuming it's in minutes)
  const formatDeliveryTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Get collection rate color
  const getCollectionRateColor = (rate: number): string => {
    if (rate >= 80) return 'success.main';
    if (rate >= 50) return 'warning.main';
    return 'error.main';
  };

  return (
    <Card>
      <CardHeader
        title="Performance Metrics"
        avatar={<TrendingUp color="primary" />}
      />
      <CardContent>
        {/* Delivery Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={600}>
                {performance.deliveriesCompleted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Deliveries
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <CalendarMonth sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={600}>
                {performance.deliveriesThisMonth}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This Month
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <DateRange sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={600}>
                {performance.deliveriesThisWeek}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This Week
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Collection Rate */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Collection Rate
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: getCollectionRateColor(performance.collectionRate) }}
            >
              {performance.collectionRate.toFixed(1)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={performance.collectionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getCollectionRateColor(performance.collectionRate),
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Percentage of assigned orders with successful payment collection
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Average Delivery Time */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Timer color="action" />
            <Typography variant="body2" color="text.secondary">
              Average Delivery Time
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={600}>
            {formatDeliveryTime(performance.averageDeliveryTime)}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Star color="action" />
            <Typography variant="body2" color="text.secondary">
              Customer Rating
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={performance.rating} precision={0.1} size="small" readOnly />
            <Typography variant="h6" fontWeight={600}>
              {performance.rating.toFixed(1)}
            </Typography>
          </Stack>
        </Stack>

        {/* Performance Indicator */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            backgroundColor: performance.collectionRate >= 80 ? 'success.lighter' : performance.collectionRate >= 50 ? 'warning.lighter' : 'error.lighter',
          }}
        >
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {performance.collectionRate >= 80
              ? 'Excellent Performance'
              : performance.collectionRate >= 50
              ? 'Good Performance'
              : 'Needs Improvement'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {performance.collectionRate >= 80
              ? 'This rider consistently meets performance targets'
              : performance.collectionRate >= 50
              ? 'This rider meets most performance targets'
              : 'Consider providing additional training or support'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
