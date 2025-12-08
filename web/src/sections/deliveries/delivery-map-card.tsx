'use client';

import {
  Card,
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Map as MapIcon,
  LocationOn,
  Route as RouteIcon,
  TripOrigin,
  FlagCircle
} from '@mui/icons-material';
import { DeliveryShop } from '../../types/delivery';

interface DeliveryMapCardProps {
  shops: DeliveryShop[];
  routeName: string;
}

export default function DeliveryMapCard({ shops, routeName }: DeliveryMapCardProps) {
  // Sort shops by sequence number
  const sortedShops = [...shops].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const firstShop = sortedShops[0];
  const lastShop = sortedShops[sortedShops.length - 1];

  // Calculate approximate route distance (simple Haversine distance)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Calculate total route distance
  let totalDistance = 0;
  for (let i = 0; i < sortedShops.length - 1; i++) {
    const current = sortedShops[i];
    const next = sortedShops[i + 1];
    totalDistance += calculateDistance(
      current.coordinates.lat,
      current.coordinates.lng,
      next.coordinates.lat,
      next.coordinates.lng
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <MapIcon color="primary" />
        <Typography variant="h6">Route Map</Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Map Placeholder */}
      <Paper
        sx={{
          height: 400,
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `
            linear-gradient(45deg, rgba(0,0,0,.03) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,.03) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0,0,0,.03) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.03) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {/* Visual Route Representation */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            p: 4
          }}
        >
          {/* Route Line */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              right: '10%',
              bottom: '20%',
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 4,
              opacity: 0.3
            }}
          />

          {/* Start Point */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  p: 1.5,
                  borderRadius: '50%',
                  boxShadow: 3
                }}
              >
                <TripOrigin />
              </Box>
              <Chip label="Start" size="small" color="success" />
            </Stack>
          </Box>

          {/* Middle Points */}
          {sortedShops.slice(1, -1).map((shop, index) => {
            const total = sortedShops.length;
            const position = ((index + 1) / (total - 1)) * 80 + 10; // Distribute along the route
            return (
              <Box
                key={shop.shopId}
                sx={{
                  position: 'absolute',
                  top: `${20 + (index % 2) * 10}%`,
                  left: `${position}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Box
                  sx={{
                    bgcolor: shop.status === 'completed' ? 'success.light' : 'warning.light',
                    color: 'white',
                    p: 1,
                    borderRadius: '50%',
                    boxShadow: 2
                  }}
                >
                  <LocationOn fontSize="small" />
                </Box>
              </Box>
            );
          })}

          {/* End Point */}
          {sortedShops.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                transform: 'translate(50%, 50%)'
              }}
            >
              <Stack alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    bgcolor: lastShop.status === 'completed' ? 'success.main' : 'error.main',
                    color: 'white',
                    p: 1.5,
                    borderRadius: '50%',
                    boxShadow: 3
                  }}
                >
                  <FlagCircle />
                </Box>
                <Chip
                  label="End"
                  size="small"
                  color={lastShop.status === 'completed' ? 'success' : 'error'}
                />
              </Stack>
            </Box>
          )}

          {/* Center Info */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Interactive Map View
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                {routeName}
              </Typography>
              <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 1 }}>
                {shops.length} stops
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* Route Information */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <RouteIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Estimated Distance
            </Typography>
          </Stack>
          <Typography variant="h6">
            {totalDistance.toFixed(1)} km
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn color="action" />
            <Typography variant="body2" color="text.secondary">
              Total Stops
            </Typography>
          </Stack>
          <Typography variant="h6">
            {shops.length}
          </Typography>
        </Stack>

        {/* Start and End Locations */}
        <Box>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  width: 8,
                  bgcolor: 'success.main',
                  borderRadius: 1
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Start Location
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {firstShop?.shopName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {firstShop?.address}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  width: 8,
                  bgcolor: lastShop?.status === 'completed' ? 'success.main' : 'error.main',
                  borderRadius: 1
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  End Location
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {lastShop?.shopName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lastShop?.address}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Integration Note */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'info.lighter',
            borderColor: 'info.main',
            borderStyle: 'dashed'
          }}
        >
          <Typography variant="caption" color="info.dark">
            Note: This is a visual representation of the delivery route. For a real implementation,
            integrate with Google Maps, Mapbox, or OpenStreetMap API for interactive maps with
            real-time tracking.
          </Typography>
        </Paper>
      </Stack>
    </Card>
  );
}
