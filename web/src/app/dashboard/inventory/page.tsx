'use client';

import { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Avatar,
  Chip,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  getInventory,
  adjustStock,
  getInventoryHistory,
  setMinStockLevel,
  exportInventory,
  InventoryItem,
  InventoryHistory,
  AdjustStockData,
} from '@/lib/api/inventory';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';
import FormProvider from '@/components/hook-form/form-provider';

const adjustmentSchema = z.object({
  adjustmentType: z.enum(['add', 'remove', 'set']),
  quantity: z.number().min(0, 'Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

const minStockSchema = z.object({
  minStockLevel: z.number().min(0, 'Minimum stock level must be positive'),
});

type MinStockFormData = z.infer<typeof minStockSchema>;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [minStockDialogOpen, setMinStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const adjustMethods = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: 'add',
      quantity: 0,
      reason: '',
    },
  });

  const minStockMethods = useForm<MinStockFormData>({
    resolver: zodResolver(minStockSchema),
    defaultValues: {
      minStockLevel: 0,
    },
  });

  useEffect(() => {
    fetchInventory();
  }, [page, rowsPerPage, searchQuery, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getInventory({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        stockStatus: stockFilter || undefined,
      });

      setInventory(response.data?.items || []);
      setTotalCount(response.data?.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching inventory:', handleApiError(error));
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (productId?: string) => {
    try {
      const response = await getInventoryHistory(productId, { page: 1, limit: 50 });
      setHistory(response.data?.items || []);
    } catch (error) {
      console.error('Error fetching history:', handleApiError(error));
      toast.error('Failed to fetch inventory history');
    }
  };

  const handleOpenAdjustDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    adjustMethods.reset({
      adjustmentType: 'add',
      quantity: 0,
      reason: '',
    });
    setAdjustDialogOpen(true);
  };

  const handleOpenMinStockDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    minStockMethods.reset({
      minStockLevel: item.minStockLevel || 0,
    });
    setMinStockDialogOpen(true);
  };

  const handleOpenHistoryDialog = async (item: InventoryItem) => {
    setSelectedItem(item);
    setHistoryDialogOpen(true);
    await fetchHistory(item.product._id);
  };

  const onAdjustSubmit = async (data: AdjustmentFormData) => {
    if (!selectedItem) return;

    try {
      await adjustStock(selectedItem.product._id, data);
      toast.success('Stock adjusted successfully');
      setAdjustDialogOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error adjusting stock:', handleApiError(error));
      toast.error('Failed to adjust stock');
    }
  };

  const onMinStockSubmit = async (data: MinStockFormData) => {
    if (!selectedItem) return;

    try {
      await setMinStockLevel(selectedItem.product._id, data.minStockLevel);
      toast.success('Minimum stock level updated');
      setMinStockDialogOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error updating min stock:', handleApiError(error));
      toast.error('Failed to update minimum stock level');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportInventory();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Inventory exported successfully');
    } catch (error) {
      console.error('Error exporting inventory:', handleApiError(error));
      toast.error('Failed to export inventory');
    }
  };

  const lowStockItems = inventory.filter((item) => item.stockStatus === 'low-stock');
  const outOfStockItems = inventory.filter((item) => item.stockStatus === 'out-of-stock');

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage stock levels across all products
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      {/* Alert Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setStockFilter('low-stock')}
              >
                View All
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="medium">
              {lowStockItems.length} products are running low on stock
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert
            severity="error"
            icon={<WarningIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setStockFilter('out-of-stock')}
              >
                View All
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="medium">
              {outOfStockItems.length} products are out of stock
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Stock Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStockFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Current Stock" />
          <Tab label="Stock History" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Reserved</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Min Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Restock</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : inventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No inventory items found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={item.product.images?.[0]}
                              alt={item.product.productName}
                              variant="rounded"
                            >
                              {item.product.productName[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {item.product.productName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.product.sku} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {item.available.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.reserved.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.quantity.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {item.minStockLevel.toLocaleString()}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMinStockDialog(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.stockStatus} type="stock" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.lastRestockDate
                              ? format(new Date(item.lastRestockDate), 'MMM dd, yyyy')
                              : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenAdjustDialog(item)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenHistoryDialog(item)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity Change</TableCell>
                  <TableCell>Before</TableCell>
                  <TableCell>After</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No history available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product.productName}</TableCell>
                      <TableCell>
                        <Chip label={item.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {item.quantityChange > 0 ? (
                            <TrendingUpIcon fontSize="small" color="success" />
                          ) : (
                            <TrendingDownIcon fontSize="small" color="error" />
                          )}
                          <Typography
                            variant="body2"
                            color={item.quantityChange > 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {item.quantityChange > 0 ? '+' : ''}
                            {item.quantityChange.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.quantityBefore.toLocaleString()}</TableCell>
                      <TableCell>{item.quantityAfter.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{item.reason}</Typography>
                      </TableCell>
                      <TableCell>
                        {item.performedBy.firstName} {item.performedBy.lastName}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock - {selectedItem?.product.productName}</DialogTitle>
        <FormProvider methods={adjustMethods} onSubmit={adjustMethods.handleSubmit(onAdjustSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Current Stock: <strong>{selectedItem?.quantity.toLocaleString()}</strong>
                  <br />
                  Available: <strong>{selectedItem?.available.toLocaleString()}</strong>
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="adjustmentType"
                  control={adjustMethods.control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Adjustment Type</InputLabel>
                      <Select {...field} label="Adjustment Type">
                        <MenuItem value="add">Add Stock</MenuItem>
                        <MenuItem value="remove">Remove Stock</MenuItem>
                        <MenuItem value="set">Set Stock Level</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="quantity"
                  control={adjustMethods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="reason"
                  control={adjustMethods.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Reason"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Adjust Stock
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>

      {/* Min Stock Level Dialog */}
      <Dialog open={minStockDialogOpen} onClose={() => setMinStockDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set Minimum Stock Level</DialogTitle>
        <FormProvider methods={minStockMethods} onSubmit={minStockMethods.handleSubmit(onMinStockSubmit)}>
          <DialogContent dividers>
            <Controller
              name="minStockLevel"
              control={minStockMethods.control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Minimum Stock Level"
                  type="number"
                  fullWidth
                  error={!!error}
                  helperText={error?.message || 'Alert will trigger when stock falls below this level'}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMinStockDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Stock History - {selectedItem?.product.productName}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Change</TableCell>
                <TableCell>Before</TableCell>
                <TableCell>After</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Chip label={item.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={item.quantityChange > 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {item.quantityChange > 0 ? '+' : ''}
                      {item.quantityChange}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.quantityBefore}</TableCell>
                  <TableCell>{item.quantityAfter}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{item.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
