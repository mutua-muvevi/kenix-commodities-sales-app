'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  LinearProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'date-fns';
import { getRoutes, Route } from '@/lib/api/routes';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import {
  connectWebSocket,
  disconnectWebSocket,
  onRiderLocationUpdate,
  onDeliveryStatusChange,
  RiderLocationUpdate,
  DeliveryStatusUpdate,
} from '@/lib/websocket/client';
import { toast } from 'sonner';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const NAIROBI_CENTER: [number, number] = [36.817223, -1.286389];

interface RiderLocation {
  riderId: string;
  riderName: string;
  location: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  timestamp: string;
  currentRoute?: string;
}

interface ShopMarkerData {
  shopId: string;
  name: string;
  address: string;
  coordinates: [number, number];
  status: 'pending' | 'in-progress' | 'delivered' | 'failed';
  routeId: string;
  routeName: string;
  sequenceNumber: number;
}

export default function LiveTrackingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mapRef = useRef<any>(null);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [riderLocations, setRiderLocations] = useState<Map<string, RiderLocation>>(new Map());
  const [shopMarkers, setShopMarkers] = useState<ShopMarkerData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedRider, setSelectedRider] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<ShopMarkerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const [viewport, setViewport] = useState({
    longitude: NAIROBI_CENTER[0],
    latitude: NAIROBI_CENTER[1],
    zoom: 12,
  });

  useEffect(() => {
    fetchData();
    setupWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    // Filter data based on selections
    filterMapData();
  }, [routes, selectedRoute, selectedRider]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch active routes
      const routesResponse = await getRoutes({ status: 'active' });
      const activeRoutes = routesResponse.data?.items || [];
      setRoutes(activeRoutes);

      // Fetch riders
      const ridersResponse = await getUsers({ role: 'rider' });
      setRiders(ridersResponse.data?.items || []);

      // Build shop markers from routes
      buildShopMarkers(activeRoutes);
    } catch (error) {
      console.error('Error fetching data:', handleApiError(error));
      toast.error('Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  };

  const buildShopMarkers = (activeRoutes: Route[]) => {
    const markers: ShopMarkerData[] = [];

    activeRoutes.forEach((route) => {
      route.shops.forEach((shopItem, index) => {
        let status: ShopMarkerData['status'] = 'pending';

        if (index < route.currentShopIndex) {
          status = 'delivered';
        } else if (index === route.currentShopIndex) {
          status = 'in-progress';
        }

        markers.push({
          shopId: shopItem.shop._id,
          name: `${shopItem.shop.firstName} ${shopItem.shop.lastName}`,
          address: shopItem.shop.address,
          coordinates: shopItem.shop.location.coordinates,
          status,
          routeId: route._id,
          routeName: route.routeName,
          sequenceNumber: shopItem.sequenceNumber,
        });
      });
    });

    setShopMarkers(markers);
  };

  const filterMapData = () => {
    // This would filter markers based on selections
    // Already handled in render logic
  };

  const setupWebSocket = () => {
    try {
      const socket = connectWebSocket();

      socket.on('connect', () => {
        setWsConnected(true);
        toast.success('Live tracking connected');
      });

      socket.on('disconnect', () => {
        setWsConnected(false);
        toast.error('Live tracking disconnected');
      });

      // Listen for rider location updates
      onRiderLocationUpdate((data: RiderLocationUpdate) => {
        console.log('Rider location update:', data);

        setRiderLocations((prev) => {
          const newMap = new Map(prev);
          const rider = riders.find((r) => r._id === data.riderId);

          newMap.set(data.riderId, {
            riderId: data.riderId,
            riderName: rider ? `${rider.firstName} ${rider.lastName}` : 'Unknown Rider',
            location: data.location,
            accuracy: data.accuracy,
            timestamp: data.timestamp,
          });

          return newMap;
        });
      });

      // Listen for delivery status changes
      onDeliveryStatusChange((data: DeliveryStatusUpdate) => {
        console.log('Delivery status change:', data);

        setShopMarkers((prev) =>
          prev.map((marker) => {
            if (marker.shopId === data.shopId) {
              return {
                ...marker,
                status: data.status as any,
              };
            }
            return marker;
          })
        );

        toast.info(`Delivery status updated: ${data.status}`);
      });
    } catch (error) {
      console.error('WebSocket setup error:', error);
      toast.error('Failed to connect to live tracking');
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = routes.find((r) => r._id === routeId);

    if (route && route.shops.length > 0) {
      // Center map on route
      const coords = route.shops[0].shop.location.coordinates;
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 13,
          duration: 1000,
        });
      }
    }
  };

  const handleShopClick = (shop: ShopMarkerData) => {
    setSelectedShop(shop);
  };

  const getShopMarkerColor = (status: ShopMarkerData['status']) => {
    switch (status) {
      case 'delivered':
        return '#10b981'; // Green
      case 'in-progress':
        return '#f59e0b'; // Yellow
      case 'failed':
        return '#ef4444'; // Red
      default:
        return '#3b82f6'; // Blue
    }
  };

  const getRouteColor = (index: number) => {
    const colors = ['#1976d2', '#9c27b0', '#f57c00', '#388e3c', '#d32f2f', '#0097a7'];
    return colors[index % colors.length];
  };

  const getRoutePath = (route: Route) => {
    if (route.shops.length < 2) return null;

    return {
      type: 'Feature',
      properties: {
        routeId: route._id,
      },
      geometry: {
        type: 'LineString',
        coordinates: route.shops.map((shop) => shop.shop.location.coordinates),
      },
    };
  };

  const filteredShops = shopMarkers.filter((shop) => {
    if (selectedRoute && shop.routeId !== selectedRoute) return false;
    return true;
  });

  const filteredRiderLocations = Array.from(riderLocations.values()).filter((rider) => {
    if (selectedRider && rider.riderId !== selectedRider) return false;
    return true;
  });

  const filteredRoutes = routes.filter((route) => {
    if (selectedRoute && route._id !== selectedRoute) return false;
    if (selectedRider && route.assignedRider?._id !== selectedRider) return false;
    return true;
  });

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Live Tracking
          </Typography>
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Connection Status */}
        <Chip
          label={wsConnected ? 'Connected' : 'Disconnected'}
          color={wsConnected ? 'success' : 'error'}
          size="small"
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Route</InputLabel>
              <Select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                label="Filter by Route"
              >
                <MenuItem value="">All Routes</MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.routeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Rider</InputLabel>
              <Select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                label="Filter by Rider"
              >
                <MenuItem value="">All Riders</MenuItem>
                {riders.map((rider) => (
                  <MenuItem key={rider._id} value={rider._id}>
                    {rider.firstName} {rider.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Active Routes List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Active Routes ({filteredRoutes.length})
        </Typography>
        <List dense>
          {filteredRoutes.map((route, index) => {
            const progress = Math.round((route.currentShopIndex / route.shops.length) * 100);
            const isSelected = selectedRoute === route._id;

            return (
              <Paper
                key={route._id}
                sx={{
                  mb: 1,
                  border: isSelected ? 2 : 0,
                  borderColor: 'primary.main',
                }}
              >
                <ListItemButton onClick={() => handleRouteSelect(route._id)}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getRouteColor(index),
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {route.routeName}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {route.assignedRider
                            ? `${route.assignedRider.firstName} ${route.assignedRider.lastName}`
                            : 'No rider assigned'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                          />
                          <Typography variant="caption">{progress}%</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {route.currentShopIndex} / {route.shops.length} shops
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </Paper>
            );
          })}
        </List>

        {/* Active Riders */}
        {filteredRiderLocations.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Active Riders ({filteredRiderLocations.length})
            </Typography>
            <List dense>
              {filteredRiderLocations.map((rider) => (
                <Paper key={rider.riderId} sx={{ mb: 1, p: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {rider.riderName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last update: {format(new Date(rider.timestamp), 'HH:mm:ss')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Accuracy: {rider.accuracy.toFixed(0)}m
                  </Typography>
                </Paper>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', position: 'relative' }}>
      {/* Mobile Menu Button */}
      {isMobile && !drawerOpen && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            bgcolor: 'background.paper',
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
        sx={{
          width: isMobile ? 300 : 360,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? 300 : 360,
            position: isMobile ? 'fixed' : 'relative',
            height: isMobile ? '100%' : 'calc(100vh - 100px)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Map
          ref={mapRef}
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {/* Shop Markers */}
          {filteredShops.map((shop) => (
            <Marker
              key={`shop-${shop.shopId}`}
              longitude={shop.coordinates[0]}
              latitude={shop.coordinates[1]}
              onClick={() => handleShopClick(shop)}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: getShopMarkerColor(shop.status),
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: 12,
                  boxShadow: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.15)',
                  },
                }}
              >
                {shop.sequenceNumber}
              </Box>
            </Marker>
          ))}

          {/* Rider Markers */}
          {filteredRiderLocations.map((rider) => (
            <Marker
              key={`rider-${rider.riderId}`}
              longitude={rider.location.lng}
              latitude={rider.location.lat}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#1976d2',
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 4,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                    },
                    '50%': {
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                    },
                  },
                }}
              >
                <MyLocationIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
            </Marker>
          ))}

          {/* Route Polylines */}
          {filteredRoutes.map((route, index) => {
            const path = getRoutePath(route);
            if (!path) return null;

            return (
              <Source key={`route-${route._id}`} id={`route-${route._id}`} type="geojson" data={path as any}>
                <Layer
                  id={`route-layer-${route._id}`}
                  type="line"
                  paint={{
                    'line-color': getRouteColor(index),
                    'line-width': 4,
                    'line-opacity': selectedRoute === route._id ? 1 : 0.5,
                  }}
                />
              </Source>
            );
          })}

          {/* Shop Popup */}
          {selectedShop && (
            <Popup
              longitude={selectedShop.coordinates[0]}
              latitude={selectedShop.coordinates[1]}
              onClose={() => setSelectedShop(null)}
              closeOnClick={false}
            >
              <Box sx={{ p: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  #{selectedShop.sequenceNumber} {selectedShop.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {selectedShop.address}
                </Typography>
                <Box mt={1}>
                  <StatusBadge status={selectedShop.status} type="delivery" />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Route: {selectedShop.routeName}
                </Typography>
              </Box>
            </Popup>
          )}
        </Map>

        {/* Map Legend */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            minWidth: 180,
          }}
        >
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            Status Legend
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption">Delivered</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f59e0b' }} />
              <Typography variant="caption">In Progress</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#3b82f6' }} />
              <Typography variant="caption">Pending</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography variant="caption">Failed</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <MyLocationIcon sx={{ color: '#1976d2', fontSize: 16 }} />
              <Typography variant="caption">Rider Location</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
