'use client';

import { useCallback } from 'react';
import {
  Stack,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { SalesAgentFilters, SalesAgentApprovalStatus } from '@/types/sales-agent';
import { Iconify } from '@/components/iconify';

interface SalesAgentTableToolbarProps {
  filters: SalesAgentFilters;
  onFilterChange: (filters: Partial<SalesAgentFilters>) => void;
}

export function SalesAgentTableToolbar({
  filters,
  onFilterChange,
}: SalesAgentTableToolbarProps) {
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ search: event.target.value });
    },
    [onFilterChange]
  );

  const handleStatusChange = useCallback(
    (event: any) => {
      onFilterChange({ approvalStatus: event.target.value as SalesAgentApprovalStatus | 'all' });
    },
    [onFilterChange]
  );

  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ p: 2.5 }}
    >
      <TextField
        fullWidth
        value={filters.search || ''}
        onChange={handleSearchChange}
        placeholder="Search by name, email, or phone..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.approvalStatus || 'all'}
          onChange={handleStatusChange}
          label="Status"
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="banned">Banned</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
