'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Container,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { toast } from 'sonner';
import { Delivery, DeliveryStats, DeliveryFilters } from '../../types/delivery';
import { getDeliveries, getDeliveryStatistics } from '../../lib/api/deliveries';
import DeliveryTableRow from './delivery-table-row';
import DeliveryTableToolbar from './delivery-table-toolbar';
import { TableHead, TableRow, TableCell } from '@mui/material';

// Summary card component
interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: `${color}.lighter`,
            color: `${color}.main`
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

export default function DeliveriesListView() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<DeliveryFilters>({
    status: 'all',
    paymentStatus: 'all'
  });

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [deliveriesResponse, statsResponse] = await Promise.all([
        getDeliveries(filters, page + 1, rowsPerPage),
        getDeliveryStatistics()
      ]);

      setDeliveries(deliveriesResponse.deliveries);
      setTotal(deliveriesResponse.total);
      setStats(statsResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliveries';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleFilterChange = (newFilters: DeliveryFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchDeliveries();
    toast.success('Deliveries refreshed');
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Deliveries Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all delivery operations
          </Typography>
        </Box>

        {/* Summary Cards */}
        {stats && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Active Deliveries"
                value={stats.activeDeliveries}
                icon={<LocalShipping sx={{ fontSize: 32 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Completed Today"
                value={stats.todayDeliveries}
                icon={<CheckCircle sx={{ fontSize: 32 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Failed Deliveries"
                value={stats.failedDeliveries}
                icon={<Cancel sx={{ fontSize: 32 }} />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Deliveries"
                value={stats.totalDeliveries}
                icon={<Schedule sx={{ fontSize: 32 }} />}
                color="warning"
              />
            </Grid>
          </Grid>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Deliveries Table */}
        <Card>
          <DeliveryTableToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />

          <TableContainer component={Paper} sx={{ position: 'relative', minHeight: 400 }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}
              >
                <CircularProgress />
              </Box>
            )}

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Delivery Code</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Rider</TableCell>
                  <TableCell>Shops</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No deliveries found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                    <DeliveryTableRow
                      key={delivery._id}
                      delivery={delivery}
                      onUpdate={fetchDeliveries}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Card>
      </Stack>
    </Container>
  );
}
