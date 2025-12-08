'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Chip,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  DirectionsBike as BikeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import {
  getOverviewMetrics,
  getDailyOrders,
  getTopProducts,
  getOrdersByStatus,
  getRevenueByMonth,
  getSalesAgentPerformance,
  getRiderPerformance,
  OverviewMetrics,
  DailyOrdersData,
  TopProduct,
  OrdersByStatus,
  RevenueByMonth,
  SalesAgentPerformance,
  RiderPerformance,
} from '@/lib/api/analytics';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {isPositive && <TrendingUpIcon fontSize="small" color="success" />}
                {isNegative && <TrendingDownIcon fontSize="small" color="error" />}
                <Typography
                  variant="caption"
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
                  fontWeight="medium"
                >
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}% from last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [dailyOrders, setDailyOrders] = useState<DailyOrdersData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
  const [salesAgents, setSalesAgents] = useState<SalesAgentPerformance[]>([]);
  const [riders, setRiders] = useState<RiderPerformance[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = getDateParams();

      const [
        overviewRes,
        dailyOrdersRes,
        topProductsRes,
        ordersByStatusRes,
        revenueRes,
        salesAgentsRes,
        ridersRes,
      ] = await Promise.all([
        getOverviewMetrics(params),
        getDailyOrders(params),
        getTopProducts({ ...params, limit: 10 }),
        getOrdersByStatus(params),
        getRevenueByMonth({ months: 6 }),
        getSalesAgentPerformance(params),
        getRiderPerformance(params),
      ]);

      setOverview(overviewRes.data);
      setDailyOrders(dailyOrdersRes.data || []);
      setTopProducts(topProductsRes.data || []);
      setOrdersByStatus(ordersByStatusRes.data || []);
      setRevenueByMonth(revenueRes.data || []);
      setSalesAgents(salesAgentsRes.data?.items || []);
      setRiders(ridersRes.data?.items || []);
    } catch (error) {
      console.error('Error fetching analytics:', handleApiError(error));
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getDateParams = () => {
    if (dateRange === 'custom' && startDate && endDate) {
      return {
        startDate,
        endDate,
      };
    }

    const days = parseInt(dateRange);
    const start = format(startOfDay(subDays(new Date(), days)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const end = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    return {
      startDate: start,
      endDate: end,
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Performance Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor key metrics and track business performance
          </Typography>
        </Box>

        {/* Date Range Selector */}
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 3 Months</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {dateRange === 'custom' && (
            <>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={overview?.totalOrders.toLocaleString() || '0'}
            change={overview?.ordersChange}
            icon={<ShoppingCartIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`KSh ${overview?.totalRevenue.toLocaleString() || '0'}`}
            change={overview?.revenueChange}
            icon={<MoneyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Riders"
            value={overview?.activeRiders || 0}
            icon={<BikeIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Shops"
            value={overview?.activeShops || 0}
            icon={<StoreIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} mb={3}>
        {/* Daily Orders */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Daily Orders & Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    name="Revenue (KSh)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders by Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Orders by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.status} (${entry.percentage.toFixed(0)}%)`}
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} mb={3}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top 10 Products by Sales
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalQuantity" fill="#1976d2" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Month */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue Trend (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#2e7d32" name="Revenue (KSh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Tables */}
      <Grid container spacing={3}>
        {/* Sales Agent Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales Agent Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Agent</TableCell>
                      <TableCell align="right">Shops</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesAgents.map((agent) => (
                      <TableRow key={agent._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {agent.firstName[0]}
                              {agent.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {agent.firstName} {agent.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {agent.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={agent.shopsRegistered}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{agent.ordersPlaced}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            KSh {agent.totalCommission.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Rider Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Rider Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rider</TableCell>
                      <TableCell align="right">Deliveries</TableCell>
                      <TableCell align="right">Collection Rate</TableCell>
                      <TableCell align="right">Avg Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riders.map((rider) => (
                      <TableRow key={rider._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {rider.firstName[0]}
                              {rider.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {rider.firstName} {rider.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rider.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={rider.deliveriesCompleted}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${rider.collectionRate.toFixed(1)}%`}
                            size="small"
                            color={rider.collectionRate >= 80 ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption">
                            {Math.round(rider.averageDeliveryTime)} min
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
