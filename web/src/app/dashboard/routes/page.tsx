'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getRoutes, Route } from '@/lib/api/routes';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [riderFilter, setRiderFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRoutes();
    fetchRiders();
  }, [page, rowsPerPage, statusFilter, riderFilter, dateFilter]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await getRoutes({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        riderId: riderFilter || undefined,
        startDate: dateFilter || undefined,
      });

      setRoutes(response.data?.items || []);
      setTotalCount(response.data?.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching routes:', handleApiError(error));
      toast.error('Failed to fetch routes');
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateProgress = (route: Route) => {
    if (route.shops.length === 0) return 0;
    return Math.round((route.currentShopIndex / route.shops.length) * 100);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Route Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage delivery routes for optimal efficiency
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push('/dashboard/routes/create')}
        >
          Create Route
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Rider</InputLabel>
                <Select
                  value={riderFilter}
                  onChange={(e) => setRiderFilter(e.target.value)}
                  label="Rider"
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route Name</TableCell>
                <TableCell>Route Code</TableCell>
                <TableCell>Assigned Rider</TableCell>
                <TableCell>Shops</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No routes found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => {
                  const progress = calculateProgress(route);
                  return (
                    <TableRow key={route._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {route.routeName}
                        </Typography>
                        {route.description && (
                          <Typography variant="caption" color="text.secondary">
                            {route.description.length > 50
                              ? route.description.substring(0, 50) + '...'
                              : route.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={route.routeCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {route.assignedRider ? (
                          <Box>
                            <Typography variant="body2">
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
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {route.shops.length} shops
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current: {route.currentShopIndex + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={route.status} type="route" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(route.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(route.startTime), 'HH:mm')} -{' '}
                          {format(new Date(route.endTime), 'HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => router.push(`/dashboard/routes/${route._id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {route.status === 'pending' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => router.push(`/dashboard/routes/${route._id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
