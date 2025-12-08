'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Store,
  LocalShipping,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { getOrders } from '@/lib/api/orders';
import { getUsers } from '@/lib/api/users';
import { getRoutes } from '@/lib/api/routes';
import { getProducts } from '@/lib/api/products';
import { handleApiError } from '@/lib/api/client';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import StatusBadge from '@/components/dashboard/StatusBadge';

interface DashboardStats {
  totalOrders: number;
  pendingApprovals: number;
  activeRoutes: number;
  totalShops: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  ordersTrend: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingApprovals: 0,
    activeRoutes: 0,
    totalShops: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    ordersTrend: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent orders
      const ordersResponse = await getOrders({ limit: 10, page: 1 });
      const orders = ordersResponse.data?.items || [];
      setRecentOrders(orders);

      // Fetch pending approvals
      const pendingResponse = await getOrders({ approvalStatus: 'pending', limit: 1 });
      const pendingCount = pendingResponse.data?.pagination?.totalCount || 0;

      // Fetch total orders
      const totalOrdersResponse = await getOrders({ limit: 1 });
      const totalOrders = totalOrdersResponse.data?.pagination?.totalCount || 0;

      // Fetch today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrdersResponse = await getOrders({ startDate: today });
      const todayOrders = todayOrdersResponse.data?.pagination?.totalCount || 0;
      const todayOrdersList = todayOrdersResponse.data?.items || [];
      const todayRevenue = todayOrdersList.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      // Fetch shops
      const shopsResponse = await getUsers({ role: 'shop', limit: 1 });
      const totalShops = shopsResponse.data?.pagination?.totalCount || 0;

      // Fetch pending shops
      const pendingShopsResponse = await getUsers({ role: 'shop', limit: 5 });
      const pendingShopsList = (pendingShopsResponse.data?.items || []).filter(
        (shop: any) => shop.approvalStatus === 'pending'
      );
      setPendingShops(pendingShopsList);

      // Fetch active routes
      const routesResponse = await getRoutes({ status: 'active', limit: 1 });
      const activeRoutes = routesResponse.data?.pagination?.totalCount || 0;

      // Calculate total revenue
      const completedOrders = await getOrders({ status: 'completed' });
      const revenue = (completedOrders.data?.items || []).reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      // Calculate orders trend (compare to yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayOrdersResponse = await getOrders({
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
      });
      const yesterdayOrders = yesterdayOrdersResponse.data?.pagination?.totalCount || 0;
      const trend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

      setStats({
        totalOrders,
        pendingApprovals: pendingCount,
        activeRoutes,
        totalShops,
        totalRevenue: revenue,
        todayOrders,
        todayRevenue,
        ordersTrend: trend,
      });

      // Fetch orders over time (last 30 days)
      await fetchOrdersOverTime();

      // Fetch orders by status
      await fetchOrdersByStatus();

      // Fetch top products
      await fetchTopProducts();

      // Fetch revenue data
      await fetchRevenueData();
    } catch (error) {
      console.error('Error fetching dashboard data:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersOverTime = async () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];

      const response = await getOrders({
        startDate: dateStr,
        endDate: dateStr,
      });

      data.push({
        date: format(date, 'MMM dd'),
        orders: response.data?.pagination?.totalCount || 0,
      });
    }
    setOrdersOverTime(data);
  };

  const fetchOrdersByStatus = async () => {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const data = [];

    for (const status of statuses) {
      const response = await getOrders({ status, limit: 1 });
      const count = response.data?.pagination?.totalCount || 0;

      if (count > 0) {
        data.push({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        });
      }
    }

    setOrdersByStatus(data);
  };

  const fetchTopProducts = async () => {
    // This is a simplified version - in production, you'd have an analytics endpoint
    const response = await getProducts({ limit: 5 });
    const products = response.data?.items || [];

    const data = products.map((product: any) => ({
      name: product.productName.length > 20
        ? product.productName.substring(0, 20) + '...'
        : product.productName,
      sales: product.quantity - product.reserved, // Approximation
    }));

    setTopProducts(data);
  };

  const fetchRevenueData = async () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];

      const response = await getOrders({
        startDate: dateStr,
        endDate: dateStr,
        status: 'completed',
      });

      const orders = response.data?.items || [];
      const revenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      data.push({
        date: format(date, 'EEE'),
        revenue: revenue / 1000, // Convert to thousands for better display
      });
    }
    setRevenueData(data);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      trend: `${stats.ordersTrend > 0 ? '+' : ''}${stats.ordersTrend.toFixed(1)}%`,
      trendPositive: stats.ordersTrend >= 0,
      icon: <ShoppingCart />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      alert: stats.pendingApprovals > 10,
      icon: <Warning />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    {
      title: 'Active Routes',
      value: stats.activeRoutes,
      subtitle: 'In progress today',
      icon: <LocalShipping />,
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      title: 'Total Shops',
      value: stats.totalShops,
      subtitle: `${pendingShops.length} pending approval`,
      icon: <Store />,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Alert for pending approvals */}
      {stats.pendingApprovals > 10 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{stats.pendingApprovals}</strong> orders are pending approval. Please review them soon.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    {stat.trend && (
                      <Typography
                        variant="caption"
                        color={stat.trendPositive ? 'success.main' : 'error.main'}
                        sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                      >
                        {stat.trendPositive ? '↑' : '↓'} {stat.trend} from yesterday
                      </Typography>
                    )}
                    {stat.subtitle && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: stat.bgColor,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Revenue Card */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'primary.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoney sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    KSh {stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Today: KSh {stats.todayRevenue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'success.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Today's Orders
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.todayOrders}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Average: KSh {stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders).toLocaleString() : 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href="/dashboard/shops"
                  disabled={pendingShops.length === 0}
                >
                  Approve {pendingShops.length} Pending Shops
                </Button>
                <Button variant="outlined" size="small" component={Link} href="/dashboard/routes/create">
                  Create New Route
                </Button>
                <Button variant="outlined" size="small" component={Link} href="/dashboard/tracking">
                  View Live Tracking
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        {/* Orders Over Time */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Orders Over Time (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders by Status */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Orders by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
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

        {/* Revenue Trend */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'KSh (Thousands)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `KSh ${Number(value).toFixed(2)}K`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Products (By Sales)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Recent Orders
            </Typography>
            <Button component={Link} href="/dashboard/orders" variant="text" color="primary">
              View All
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Shop</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approval</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.orderer?.firstName} {order.orderer?.lastName}
                      </TableCell>
                      <TableCell>KSh {order.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} type="order" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.approvalStatus} type="approval" />
                      </TableCell>
                      <TableCell>
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          href={`/dashboard/orders/${order._id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
