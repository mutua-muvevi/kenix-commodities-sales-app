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
  List,
  ListItem,
  ListItemText,
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
  Chip,
  LinearProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getRoute, assignRider, overrideSequence, Route } from '@/lib/api/routes';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const NAIROBI_CENTER: [number, number] = [36.817223, -1.286389];

export default function RouteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params?.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState<any[]>([]);
  const [assignRiderDialogOpen, setAssignRiderDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState('');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [skipShopId, setSkipShopId] = useState('');
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    if (routeId) {
      fetchRouteDetails();
      fetchRiders();
    }
  }, [routeId]);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      const response = await getRoute(routeId);
      setRoute(response.data);
    } catch (error) {
      console.error('Error fetching route:', handleApiError(error));
      toast.error('Failed to fetch route details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await getUsers({ role: 'rider' });
      setRiders(response.data?.items || []);
    } catch (error) {
      console.error('Error fetching riders:', handleApiError(error));
    }
  };

  const handleAssignRider = async () => {
    if (!selectedRider) {
      toast.error('Please select a rider');
      return;
    }

    try {
      await assignRider(routeId, selectedRider);
      toast.success('Rider assigned successfully');
      setAssignRiderDialogOpen(false);
      setSelectedRider('');
      fetchRouteDetails();
    } catch (error) {
      console.error('Error assigning rider:', handleApiError(error));
      toast.error('Failed to assign rider');
    }
  };

  const handleOverrideSequence = async () => {
    if (!skipShopId || !skipReason.trim()) {
      toast.error('Please select a shop and provide a reason');
      return;
    }

    try {
      const currentShop = route?.shops[route.currentShopIndex];
      if (!currentShop) {
        toast.error('No current shop found');
        return;
      }

      const nextShop = route?.shops.find((s) => s.shop._id === skipShopId);
      if (!nextShop) {
        toast.error('Invalid shop selected');
        return;
      }

      await overrideSequence(routeId, currentShop.shop._id, skipShopId, skipReason);
      toast.success('Delivery sequence overridden');
      setOverrideDialogOpen(false);
      setSkipShopId('');
      setSkipReason('');
      fetchRouteDetails();
    } catch (error) {
      console.error('Error overriding sequence:', handleApiError(error));
      toast.error('Failed to override sequence');
    }
  };

  const calculateProgress = () => {
    if (!route || route.shops.length === 0) return 0;
    return Math.round((route.currentShopIndex / route.shops.length) * 100);
  };

  const getShopStatus = (index: number) => {
    if (!route) return 'pending';
    if (index < route.currentShopIndex) return 'delivered';
    if (index === route.currentShopIndex) return 'in-progress';
    return 'pending';
  };

  const getRoutePath = () => {
    if (!route || route.shops.length < 2) return null;

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.shops.map((shop) => shop.shop.location.coordinates),
      },
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!route) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Route not found
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard/routes')} sx={{ mt: 2 }}>
          Back to Routes
        </Button>
      </Box>
    );
  }

  const progress = calculateProgress();
  const routePath = getRoutePath();

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/dashboard/routes')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {route.routeName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Route Code: {route.routeCode}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setAssignRiderDialogOpen(true)}
          >
            {route.assignedRider ? 'Reassign Rider' : 'Assign Rider'}
          </Button>
          {route.status === 'in_progress' && (
            <Button variant="outlined" onClick={() => setOverrideDialogOpen(true)}>
              Override Sequence
            </Button>
          )}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRouteDetails}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Route Info Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <StatusBadge status={route.status} type="route" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assigned Rider
                  </Typography>
                  {route.assignedRider ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {route.assignedRider.firstName} {route.assignedRider.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {route.assignedRider.phone}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 8, borderRadius: 1, mb: 1 }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {route.currentShopIndex} / {route.shops.length} Shops
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Schedule
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {format(new Date(route.startTime), 'HH:mm')} -{' '}
                    {format(new Date(route.endTime), 'HH:mm')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {route.operatingDays.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600 }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              <Map
                initialViewState={{
                  longitude: route.shops[0]?.shop.location.coordinates[0] || NAIROBI_CENTER[0],
                  latitude: route.shops[0]?.shop.location.coordinates[1] || NAIROBI_CENTER[1],
                  zoom: 12,
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
              >
                {/* Shop Markers */}
                {route.shops.map((shopItem, index) => {
                  const status = getShopStatus(index);
                  const color =
                    status === 'delivered'
                      ? '#10b981'
                      : status === 'in-progress'
                      ? '#f59e0b'
                      : '#3b82f6';

                  return (
                    <Marker
                      key={shopItem.shop._id}
                      longitude={shopItem.shop.location.coordinates[0]}
                      latitude={shopItem.shop.location.coordinates[1]}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: '3px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: 'white',
                          fontSize: 14,
                          boxShadow: 2,
                        }}
                      >
                        {shopItem.sequenceNumber}
                      </Box>
                    </Marker>
                  );
                })}

                {/* Route Path */}
                {routePath && (
                  <Source id="route" type="geojson" data={routePath as any}>
                    <Layer
                      id="route-layer"
                      type="line"
                      paint={{
                        'line-color': '#1976d2',
                        'line-width': 3,
                      }}
                    />
                  </Source>
                )}
              </Map>
            </CardContent>
          </Card>
        </Grid>

        {/* Shop List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ maxHeight: 600, overflow: 'auto' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Shop Sequence ({route.shops.length})
              </Typography>
              <List dense>
                {route.shops.map((shopItem, index) => {
                  const status = getShopStatus(index);
                  const isCurrent = index === route.currentShopIndex;

                  return (
                    <Paper
                      key={shopItem.shop._id}
                      sx={{
                        mb: 1,
                        p: 2,
                        border: isCurrent ? '2px solid #1976d2' : 'none',
                        bgcolor: isCurrent ? '#f0f9ff' : 'background.paper',
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Chip
                          label={shopItem.sequenceNumber}
                          size="small"
                          color={
                            status === 'delivered'
                              ? 'success'
                              : status === 'in-progress'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ minWidth: 32 }}
                        />
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {shopItem.shop.firstName} {shopItem.shop.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {shopItem.shop.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shopItem.shop.phone}
                          </Typography>
                          {shopItem.estimatedArrivalTime && (
                            <Typography variant="caption" color="primary" display="block" mt={0.5}>
                              ETA: {format(new Date(shopItem.estimatedArrivalTime), 'HH:mm')}
                            </Typography>
                          )}
                          {shopItem.notes && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mt={0.5}
                            >
                              Note: {shopItem.notes}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={status.replace('-', ' ')}
                          size="small"
                          color={
                            status === 'delivered'
                              ? 'success'
                              : status === 'in-progress'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </Box>
                    </Paper>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Route Description */}
        {route.description && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {route.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Assign Rider Dialog */}
      <Dialog
        open={assignRiderDialogOpen}
        onClose={() => setAssignRiderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {route.assignedRider ? 'Reassign Rider' : 'Assign Rider to Route'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Rider</InputLabel>
            <Select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              label="Select Rider"
            >
              {riders.map((rider) => (
                <MenuItem key={rider._id} value={rider._id}>
                  {rider.firstName} {rider.lastName} - {rider.phone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {route.assignedRider && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Current rider: {route.assignedRider.firstName} {route.assignedRider.lastName}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignRiderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignRider} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Override Sequence Dialog */}
      <Dialog
        open={overrideDialogOpen}
        onClose={() => setOverrideDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Override Delivery Sequence</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select a shop to skip to and provide a reason for the override.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Skip to Shop</InputLabel>
            <Select
              value={skipShopId}
              onChange={(e) => setSkipShopId(e.target.value)}
              label="Skip to Shop"
            >
              {route.shops
                .filter((s, idx) => idx > route.currentShopIndex)
                .map((shopItem) => (
                  <MenuItem key={shopItem.shop._id} value={shopItem.shop._id}>
                    #{shopItem.sequenceNumber} - {shopItem.shop.firstName}{' '}
                    {shopItem.shop.lastName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder="Enter reason for skipping..."
            sx={{ mt: 2 }}
            label="Reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleOverrideSequence} variant="contained" color="warning">
            Override Sequence
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
