'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { Search, Refresh, FilterList } from '@mui/icons-material';
import { DeliveryFilters, DeliveryStatus, PaymentStatus } from '../../types/delivery';
import { getDeliveryRiders, getDeliveryRoutes } from '../../lib/api/deliveries';

interface DeliveryTableToolbarProps {
  filters: DeliveryFilters;
  onFilterChange: (filters: DeliveryFilters) => void;
  onRefresh: () => void;
}

export default function DeliveryTableToolbar({
  filters,
  onFilterChange,
  onRefresh
}: DeliveryTableToolbarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [riders, setRiders] = useState<Array<{ id: string; name: string }>>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [ridersData, routesData] = await Promise.all([
          getDeliveryRiders(),
          getDeliveryRoutes()
        ]);
        setRiders(ridersData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as DeliveryStatus | 'all';
    onFilterChange({ ...filters, status: value });
  };

  const handlePaymentStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as PaymentStatus | 'all';
    onFilterChange({ ...filters, paymentStatus: value });
  };

  const handleRiderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ ...filters, riderId: value || undefined });
  };

  const handleRouteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({ ...filters, routeId: value || undefined });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by delivery code, route, rider..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: { sm: 400 } }}
          size="small"
        />

        {/* Status Filter */}
        <TextField
          select
          label="Status"
          value={filters.status || 'all'}
          onChange={handleStatusChange}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </TextField>

        {/* Payment Status Filter */}
        <TextField
          select
          label="Payment"
          value={filters.paymentStatus || 'all'}
          onChange={handlePaymentStatusChange}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="all">All Payment</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="partial">Partial</MenuItem>
          <MenuItem value="complete">Complete</MenuItem>
        </TextField>

        {/* Rider Filter */}
        <TextField
          select
          label="Rider"
          value={filters.riderId || ''}
          onChange={handleRiderChange}
          sx={{ minWidth: 180 }}
          size="small"
        >
          <MenuItem value="">All Riders</MenuItem>
          {riders.map((rider) => (
            <MenuItem key={rider.id} value={rider.id}>
              {rider.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Route Filter */}
        <TextField
          select
          label="Route"
          value={filters.routeId || ''}
          onChange={handleRouteChange}
          sx={{ minWidth: 200 }}
          size="small"
        >
          <MenuItem value="">All Routes</MenuItem>
          {routes.map((route) => (
            <MenuItem key={route.id} value={route.id}>
              {route.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Refresh Button */}
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
