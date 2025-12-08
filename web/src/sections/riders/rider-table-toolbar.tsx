'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

interface RiderTableToolbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeFilter: boolean | undefined;
  onActiveFilterChange: (isActive: boolean | undefined) => void;
}

export default function RiderTableToolbar({
  searchQuery,
  onSearch,
  activeFilter,
  onActiveFilterChange,
}: RiderTableToolbarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Handle search input change with debouncing
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle active filter change
  const handleActiveFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'all' | 'active' | 'inactive' | null
  ) => {
    if (newValue === 'active') {
      onActiveFilterChange(true);
    } else if (newValue === 'inactive') {
      onActiveFilterChange(false);
    } else {
      onActiveFilterChange(undefined);
    }
  };

  // Get current active filter value
  const getActiveFilterValue = (): 'all' | 'active' | 'inactive' => {
    if (activeFilter === true) return 'active';
    if (activeFilter === false) return 'inactive';
    return 'all';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        {/* Search Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email, or phone..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 400 } }}
        />

        {/* Active Status Filter */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterList fontSize="small" color="action" />
          <ToggleButtonGroup
            value={getActiveFilterValue()}
            exclusive
            onChange={handleActiveFilterChange}
            size="small"
          >
            <ToggleButton value="all">
              All
            </ToggleButton>
            <ToggleButton value="active">
              Active
            </ToggleButton>
            <ToggleButton value="inactive">
              Inactive
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Box>
  );
}
