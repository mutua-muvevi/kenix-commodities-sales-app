'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Route as RouteIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoute, RouteShop, optimizeRoute } from '@/lib/api/routes';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import FormProvider from '@/components/hook-form/form-provider';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const NAIROBI_CENTER: [number, number] = [36.817223, -1.286389];

const routeSchema = z.object({
  routeName: z.string().min(1, 'Route name is required'),
  description: z.string().optional(),
  assignedRider: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  operatingDays: z.array(z.string()).min(1, 'Select at least one operating day'),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface Shop {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function CreateRoutePage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const [shops, setShops] = useState<Shop[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedShops, setSelectedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [viewport, setViewport] = useState({
    longitude: NAIROBI_CENTER[0],
    latitude: NAIROBI_CENTER[1],
    zoom: 12,
  });

  const methods = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeName: '',
      description: '',
      assignedRider: '',
      startTime: '08:00',
      endTime: '17:00',
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  });

  const { control, handleSubmit } = methods;

  useEffect(() => {
    fetchShops();
    fetchRiders();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await getUsers({ role: 'shop' });
      const shopsData = response.data?.items || [];
      setShops(shopsData.filter((shop: Shop) => shop.location?.coordinates));
    } catch (error) {
      console.error('Error fetching shops:', handleApiError(error));
      toast.error('Failed to fetch shops');
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await getUsers({ role: 'rider' });
      setRiders(response.data?.items || []);
    } catch (error) {
      console.error('Error fetching riders:', handleApiError(error));
      toast.error('Failed to fetch riders');
    }
  };

  const handleShopToggle = (shop: Shop) => {
    const isSelected = selectedShops.some((s) => s._id === shop._id);

    if (isSelected) {
      setSelectedShops(selectedShops.filter((s) => s._id !== shop._id));
    } else {
      setSelectedShops([...selectedShops, shop]);
    }
  };

  const handleRemoveShop = (shopId: string) => {
    setSelectedShops(selectedShops.filter((s) => s._id !== shopId));
  };

  const handleMoveShop = (index: number, direction: 'up' | 'down') => {
    const newShops = [...selectedShops];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newShops.length) {
      [newShops[index], newShops[newIndex]] = [newShops[newIndex], newShops[index]];
      setSelectedShops(newShops);
    }
  };

  const handleMarkerClick = (shop: Shop) => {
    handleShopToggle(shop);
  };

  const handleOptimizeRoute = async () => {
    if (selectedShops.length < 2) {
      toast.error('Add at least 2 shops to optimize route');
      return;
    }

    setOptimizing(true);
    // Simple optimization: sort by latitude then longitude
    // In production, use a proper routing API
    const optimized = [...selectedShops].sort((a, b) => {
      const latDiff = a.location.coordinates[1] - b.location.coordinates[1];
      if (Math.abs(latDiff) > 0.01) return latDiff;
      return a.location.coordinates[0] - b.location.coordinates[0];
    });

    setSelectedShops(optimized);
    setOptimizing(false);
    toast.success('Route optimized!');
  };

  const onSubmit = async (data: RouteFormData) => {
    if (selectedShops.length === 0) {
      toast.error('Please select at least one shop');
      return;
    }

    try {
      setLoading(true);

      const routeShops: RouteShop[] = selectedShops.map((shop, index) => ({
        shopId: shop._id,
        sequenceNumber: index + 1,
      }));

      const routeData = {
        routeName: data.routeName,
        description: data.description,
        shops: routeShops,
        assignedRider: data.assignedRider || undefined,
        startTime: new Date().toISOString().split('T')[0] + 'T' + data.startTime + ':00.000Z',
        endTime: new Date().toISOString().split('T')[0] + 'T' + data.endTime + ':00.000Z',
        operatingDays: data.operatingDays,
      };

      await createRoute(routeData);
      toast.success('Route created successfully');
      router.push('/dashboard/routes');
    } catch (error) {
      console.error('Error creating route:', handleApiError(error));
      toast.error('Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  // Generate route path line
  const getRoutePath = () => {
    if (selectedShops.length < 2) return null;

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: selectedShops.map((shop) => shop.location.coordinates),
      },
    };
  };

  const routePath = getRoutePath();

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.push('/dashboard/routes')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Create New Route
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Design an optimal delivery route by selecting shops and assigning a rider
          </Typography>
        </Box>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Left Panel - Shop Selection */}
          <Grid item xs={12} md={3}>
            <Card sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Available Shops ({shops.length})
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Click shops on the map or select from the list
                </Typography>
                <List dense sx={{ mt: 2 }}>
                  {shops.map((shop) => {
                    const isSelected = selectedShops.some((s) => s._id === shop._id);
                    return (
                      <ListItem
                        key={shop._id}
                        disablePadding
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={isSelected}
                            onChange={() => handleShopToggle(shop)}
                          />
                        }
                      >
                        <ListItemButton onClick={() => handleShopToggle(shop)}>
                          <ListItemText
                            primary={`${shop.firstName} ${shop.lastName}`}
                            secondary={shop.address}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Center - Map */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 'calc(100vh - 200px)' }}>
              <Box sx={{ height: '100%', position: 'relative' }}>
                <Map
                  ref={mapRef}
                  {...viewport}
                  onMove={(evt) => setViewport(evt.viewState)}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                >
                  {/* Shop Markers */}
                  {shops.map((shop) => {
                    const isSelected = selectedShops.some((s) => s._id === shop._id);
                    const sequenceNumber = selectedShops.findIndex((s) => s._id === shop._id) + 1;

                    return (
                      <Marker
                        key={shop._id}
                        longitude={shop.location.coordinates[0]}
                        latitude={shop.location.coordinates[1]}
                        onClick={() => handleMarkerClick(shop)}
                      >
                        <Box
                          sx={{
                            width: isSelected ? 40 : 30,
                            height: isSelected ? 40 : 30,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#1976d2' : '#90caf9',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: isSelected ? 16 : 12,
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          {isSelected ? sequenceNumber : ''}
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
                          'line-dasharray': [2, 2],
                        }}
                      />
                    </Source>
                  )}
                </Map>

                {/* Map Legend */}
                <Paper
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    p: 2,
                    minWidth: 200,
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" gutterBottom>
                    Legend
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Box
                      sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#1976d2' }}
                    />
                    <Typography variant="caption">Selected Shop</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Box
                      sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#90caf9' }}
                    />
                    <Typography variant="caption">Available Shop</Typography>
                  </Box>
                </Paper>

                {/* Shop Count Badge */}
                <Paper
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    p: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {selectedShops.length} Shops Selected
                  </Typography>
                </Paper>
              </Box>
            </Card>
          </Grid>

          {/* Right Panel - Route Details & Selected Shops */}
          <Grid item xs={12} md={3}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Route Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="routeName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Route Name"
                          fullWidth
                          size="small"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="assignedRider"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Assign Rider</InputLabel>
                          <Select {...field} label="Assign Rider">
                            <MenuItem value="">None</MenuItem>
                            {riders.map((rider) => (
                              <MenuItem key={rider._id} value={rider._id}>
                                {rider.firstName} {rider.lastName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Start Time"
                          type="time"
                          fullWidth
                          size="small"
                          error={!!error}
                          helperText={error?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="endTime"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="End Time"
                          type="time"
                          fullWidth
                          size="small"
                          error={!!error}
                          helperText={error?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="operatingDays"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Operating Days</InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Operating Days"
                            renderValue={(selected) =>
                              (selected as string[]).map((day) => day.slice(0, 3)).join(', ')
                            }
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <MenuItem key={day} value={day}>
                                <Checkbox checked={field.value.includes(day)} />
                                <ListItemText primary={day} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>

                <Box mt={2} display="flex" gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RouteIcon />}
                    onClick={handleOptimizeRoute}
                    disabled={selectedShops.length < 2 || optimizing}
                  >
                    {optimizing ? 'Optimizing...' : 'Optimize'}
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    type="submit"
                    disabled={loading || selectedShops.length === 0}
                  >
                    {loading ? 'Saving...' : 'Save Route'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Selected Shops List */}
            <Card sx={{ maxHeight: 'calc(100vh - 550px)', overflow: 'auto' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Shop Sequence ({selectedShops.length})
                </Typography>
                <List dense>
                  {selectedShops.map((shop, index) => (
                    <Paper key={shop._id} sx={{ mb: 1, p: 1 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={index + 1}
                          size="small"
                          color="primary"
                          sx={{ minWidth: 32 }}
                        />
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {shop.firstName} {shop.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shop.address}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column">
                          <IconButton
                            size="small"
                            onClick={() => handleMoveShop(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveShop(index, 'down')}
                            disabled={index === selectedShops.length - 1}
                          >
                            ↓
                          </IconButton>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveShop(shop._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </Box>
  );
}
