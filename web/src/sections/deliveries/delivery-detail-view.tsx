'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  CheckCircle,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Delivery, DeliveryStatus, PaymentStatus } from '../../types/delivery';
import { getDelivery, updateDeliveryStatus } from '../../lib/api/deliveries';
import DeliveryTimeline from './delivery-timeline';
import DeliveryMapCard from './delivery-map-card';

interface DeliveryDetailViewProps {
  deliveryId: string;
}

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

export default function DeliveryDetailView({ deliveryId }: DeliveryDetailViewProps) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDelivery(deliveryId);
      setDelivery(response.delivery);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delivery details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [deliveryId]);

  const handleBack = () => {
    router.push('/dashboard/deliveries');
  };

  const handleMarkCompleted = async () => {
    if (!delivery) return;
    try {
      setUpdating(true);
      await updateDeliveryStatus(delivery._id, 'completed');
      toast.success('Delivery marked as completed');
      fetchDelivery();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!delivery) return;
    try {
      setUpdating(true);
      await updateDeliveryStatus(delivery._id, 'failed', 'Manually marked as failed');
      toast.success('Delivery marked as failed');
      fetchDelivery();
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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !delivery) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Delivery not found'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={handleBack}>
            Back to Deliveries
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4">{delivery.deliveryCode}</Typography>
            <Typography variant="body2" color="text.secondary">
              {delivery.routeName}
            </Typography>
          </Box>
          <Chip
            label={delivery.status.replace('-', ' ').toUpperCase()}
            color={STATUS_COLORS[delivery.status]}
            size="medium"
          />
          <IconButton onClick={fetchDelivery}>
            <Refresh />
          </IconButton>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          {delivery.status !== 'completed' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleMarkCompleted}
              disabled={updating}
            >
              Mark as Completed
            </Button>
          )}
          {delivery.status !== 'failed' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleMarkFailed}
              disabled={updating}
            >
              Mark as Failed
            </Button>
          )}
        </Stack>

        {delivery.failureReason && (
          <Alert severity="error">
            <strong>Failure Reason:</strong> {delivery.failureReason}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Rider Information */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rider Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LocalShipping />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{delivery.riderName}</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {delivery.riderPhone}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Card>

            {/* Delivery Timeline */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Delivery Stops
              </Typography>
              <Divider sx={{ my: 2 }} />
              <DeliveryTimeline shops={delivery.shops} />
            </Card>

            {/* Map */}
            <DeliveryMapCard shops={delivery.shops} routeName={delivery.routeName} />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Payment Summary */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(delivery.totalAmount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Collected
                  </Typography>
                  <Typography variant="body1" color="success.main" fontWeight={600}>
                    {formatCurrency(delivery.collectedAmount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography variant="body1" color="error.main" fontWeight={600}>
                    {formatCurrency(delivery.remainingAmount)}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label={delivery.paymentStatus.toUpperCase()}
                    color={PAYMENT_STATUS_COLORS[delivery.paymentStatus]}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Card>

            {/* Delivery Details */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Delivery Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Route
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2">{delivery.routeName}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Shops
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2">{delivery.shops.length}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2">
                        {formatDateTime(delivery.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {delivery.startedAt && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Started At
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 1.5 }}>
                        <Typography variant="body2">
                          {formatDateTime(delivery.startedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {delivery.completedAt && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Completed At
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 1.5 }}>
                        <Typography variant="body2">
                          {formatDateTime(delivery.completedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Related Orders
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1.5 }}>
                      <Typography variant="body2">
                        {delivery.orderIds.length} orders
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
