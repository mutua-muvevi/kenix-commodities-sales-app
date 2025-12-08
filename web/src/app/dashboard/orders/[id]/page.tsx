'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Avatar,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getOrder,
  approveOrder,
  rejectOrder,
  assignOrderToRoute,
  removeProductFromOrder,
  cancelOrder,
  Order,
} from '@/lib/api/orders';
import { getRoutes, Route } from '@/lib/api/routes';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', handleApiError(error));
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveOrder(orderId);
      toast.success('Order approved successfully');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error approving order:', handleApiError(error));
      toast.error('Failed to approve order');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectOrder(orderId, rejectReason);
      toast.success('Order rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error rejecting order:', handleApiError(error));
      toast.error('Failed to reject order');
    }
  };

  const handleOpenAssignDialog = async () => {
    try {
      // Fetch available routes
      const routesResponse = await getRoutes({ status: 'active' });
      setRoutes(routesResponse.data?.items || []);

      // Fetch available riders
      const ridersResponse = await getUsers({ role: 'rider' });
      setRiders(ridersResponse.data?.items || []);

      setAssignDialogOpen(true);
    } catch (error) {
      console.error('Error fetching routes/riders:', handleApiError(error));
      toast.error('Failed to load routes and riders');
    }
  };

  const handleAssignToRoute = async () => {
    if (!selectedRoute || !selectedRider) {
      toast.error('Please select both route and rider');
      return;
    }

    try {
      await assignOrderToRoute(orderId, selectedRoute, selectedRider);
      toast.success('Order assigned to route successfully');
      setAssignDialogOpen(false);
      setSelectedRoute('');
      setSelectedRider('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error assigning order:', handleApiError(error));
      toast.error('Failed to assign order to route');
    }
  };

  const handleDeleteProductClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteProductDialogOpen(true);
  };

  const handleDeleteProductConfirm = async () => {
    if (!productToDelete) return;

    try {
      await removeProductFromOrder(orderId, productToDelete);
      toast.success('Product removed from order');
      setDeleteProductDialogOpen(false);
      setProductToDelete(null);
      fetchOrderDetails();
    } catch (error) {
      console.error('Error removing product:', handleApiError(error));
      toast.error('Failed to remove product');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await cancelOrder(orderId, cancelReason);
      toast.success('Order cancelled');
      setCancelDialogOpen(false);
      setCancelReason('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error cancelling order:', handleApiError(error));
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const shopLocation = (order.orderer as any)?.location;

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/dashboard/orders')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created on {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          {order.approvalStatus === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setRejectDialogOpen(true)}
              >
                Reject
              </Button>
            </>
          )}
          {order.approvalStatus === 'approved' && order.deliveryStatus === 'pending' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<LocalShippingIcon />}
              onClick={handleOpenAssignDialog}
            >
              Assign to Route
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Order
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={8}>
          {/* Status Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Order Status
                  </Typography>
                  <StatusBadge status={order.status} type="order" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Approval Status
                  </Typography>
                  <StatusBadge status={order.approvalStatus} type="approval" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Delivery Status
                  </Typography>
                  <StatusBadge status={order.deliveryStatus} type="delivery" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Products */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Order Products
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.products.map((item) => (
                      <TableRow key={item.product._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={item.product.images?.[0]}
                              alt={item.product.productName}
                              variant="rounded"
                            >
                              {item.product.productName[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {item.product.productName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>KSh {item.price.toLocaleString()}</TableCell>
                        <TableCell>
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {order.status === 'pending' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProductClick(item.product._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount: KSh {order.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Delivery Map */}
          {shopLocation?.coordinates && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Delivery Location
                </Typography>
                <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
                  <Map
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: shopLocation.coordinates[0],
                      latitude: shopLocation.coordinates[1],
                      zoom: 14,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                  >
                    {/* Marker would go here with react-map-gl Marker component */}
                  </Map>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Customer Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Name:</strong> {order.orderer.firstName} {order.orderer.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {order.orderer.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {(order.orderer as any)?.address || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Method:</strong> {order.paymentMethod.toUpperCase()}
                </Typography>
                {order.deliveryNotes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {order.deliveryNotes}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Please provide a reason for rejecting this order:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectSubmit} color="error" variant="contained">
            Reject Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign to Route Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign to Route</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Select Route</InputLabel>
              <Select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                label="Select Route"
              >
                {routes.map((route) => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.routeName} ({route.routeCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Select Rider</InputLabel>
              <Select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                label="Select Rider"
              >
                {riders.map((rider) => (
                  <MenuItem key={rider._id} value={rider._id}>
                    {rider.firstName} {rider.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignToRoute} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteProductDialogOpen} onClose={() => setDeleteProductDialogOpen(false)}>
        <DialogTitle>Remove Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this product from the order?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProductConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Please provide a reason for cancelling this order:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Close</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
