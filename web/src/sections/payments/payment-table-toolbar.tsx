'use client';

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Button
} from '@mui/material';
import { Search, FileDownload } from '@mui/icons-material';
import type { PaymentStatus, PaymentMethod } from '../../types/payment';

interface PaymentTableToolbarProps {
  filters: {
    status: PaymentStatus | 'all';
    method: PaymentMethod | 'all';
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
  onExport: () => void;
  exportLoading?: boolean;
}

export function PaymentTableToolbar({
  filters,
  onFilterChange,
  onExport,
  exportLoading = false
}: PaymentTableToolbarProps) {
  const handleFilterChange = (field: string, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Search and Export Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by transaction ID, name, phone, or reference..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={onExport}
            disabled={exportLoading}
            sx={{ minWidth: 140 }}
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </Button>
        </Stack>

        {/* Filters Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Date From */}
          <TextField
            size="small"
            label="From Date"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            sx={{ flex: 1 }}
          />

          {/* Date To */}
          <TextField
            size="small"
            label="To Date"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            sx={{ flex: 1 }}
          />

          {/* Status Filter */}
          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ flex: 1, minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </TextField>

          {/* Payment Method Filter */}
          <TextField
            select
            size="small"
            label="Payment Method"
            value={filters.method}
            onChange={(e) => handleFilterChange('method', e.target.value)}
            sx={{ flex: 1, minWidth: 150 }}
          >
            <MenuItem value="all">All Methods</MenuItem>
            <MenuItem value="mpesa">M-Pesa</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank Transfer</MenuItem>
          </TextField>

          {/* Clear Filters Button */}
          <Button
            variant="outlined"
            onClick={() =>
              onFilterChange({
                status: 'all',
                method: 'all',
                dateFrom: '',
                dateTo: '',
                search: ''
              })
            }
            sx={{ minWidth: 100 }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
