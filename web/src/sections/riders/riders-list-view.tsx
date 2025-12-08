'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { toast } from 'sonner';
import { getRiders, getRiderStatsApi } from '@/lib/api/riders';
import type { Rider, RiderStats, RiderApprovalStatus } from '@/types/rider';
import RiderTableRow from './rider-table-row';
import RiderTableToolbar from './rider-table-toolbar';

// Summary card component
interface SummaryCardProps {
  title: string;
  value: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

function SummaryCard({ title, value, color = 'primary' }: SummaryCardProps) {
  const colorMap = {
    primary: '#1976d2',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: colorMap[color], fontWeight: 600 }}>
        {value.toLocaleString()}
      </Typography>
    </Card>
  );
}

export default function RidersListView() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RiderApprovalStatus | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch riders and stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [ridersResponse, statsData] = await Promise.all([
        getRiders({
          status: statusFilter,
          isActive: activeFilter,
          search: searchQuery || undefined,
        }),
        getRiderStatsApi(),
      ]);

      setRiders(ridersResponse.riders);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching riders:', error);
      toast.error('Failed to load riders');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, activeFilter]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: React.SyntheticEvent, newValue: RiderApprovalStatus | 'all') => {
    setStatusFilter(newValue);
    setPage(0);
  };

  // Handle active filter toggle
  const handleActiveFilterChange = (isActive: boolean | undefined) => {
    setActiveFilter(isActive);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle rider action (approve, ban)
  const handleRiderAction = () => {
    fetchData();
  };

  // Get paginated riders
  const paginatedRiders = riders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Summary Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Total Riders" value={stats.total} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Active Riders" value={stats.active} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Pending Approval" value={stats.pending} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Banned Riders" value={stats.banned} color="error" />
          </Grid>
        </Grid>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Toolbar */}
        <RiderTableToolbar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          activeFilter={activeFilter}
          onActiveFilterChange={handleActiveFilterChange}
        />

        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={statusFilter} onChange={handleStatusFilterChange}>
            <Tab label="All" value="all" />
            <Tab label="Approved" value="approved" />
            <Tab label="Pending" value="pending" />
            <Tab label="Banned" value="banned" />
          </Tabs>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rider</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Deliveries</TableCell>
                <TableCell align="center">Collection Rate</TableCell>
                <TableCell align="right">Wallet Balance</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedRiders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <Typography variant="body1" color="text.secondary">
                      No riders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your search or filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRiders.map((rider) => (
                  <RiderTableRow
                    key={rider._id}
                    rider={rider}
                    onActionComplete={handleRiderAction}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && riders.length > 0 && (
          <TablePagination
            component="div"
            count={riders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Card>
    </Box>
  );
}
