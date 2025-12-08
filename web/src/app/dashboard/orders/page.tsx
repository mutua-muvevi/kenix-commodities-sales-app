'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { getOrders } from '@/lib/api/orders';
import { handleApiError } from '@/lib/api/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    approvalStatus: '',
    deliveryStatus: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({
        page,
        limit: 20,
        status: filters.status || undefined,
        approvalStatus: filters.approvalStatus || undefined,
        deliveryStatus: filters.deliveryStatus || undefined,
      });

      setOrders(response.data?.items || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: any = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      cancelled: 'error',
      approved: 'success',
      rejected: 'error',
      assigned: 'info',
      in_transit: 'primary',
      delivered: 'success',
      failed: 'error',
    };
    return statusMap[status] || 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all orders
        </Typography>
      </Box>

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Order Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Approval Status</InputLabel>
                <Select
                  value={filters.approvalStatus}
                  label="Approval Status"
                  onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Delivery Status</InputLabel>
                <Select
                  value={filters.deliveryStatus}
                  label="Delivery Status"
                  onChange={(e) => setFilters({ ...filters, deliveryStatus: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="in_transit">In Transit</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card elevation={2}>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Shop</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Order Status</TableCell>
                      <TableCell>Approval</TableCell>
                      <TableCell>Delivery</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            No orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.orderer?.firstName} {order.orderer?.lastName}
                          </TableCell>
                          <TableCell>
                            {order.products?.length || 0} item(s)
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              KSh {order.totalAmount?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.approvalStatus}
                              size="small"
                              color={getStatusColor(order.approvalStatus)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.deliveryStatus}
                              size="small"
                              color={getStatusColor(order.deliveryStatus)}
                            />
                          </TableCell>
                          <TableCell>
                            {order.createdAt
                              ? format(new Date(order.createdAt), 'MMM dd, yyyy')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
