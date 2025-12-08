'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { SalesAgent } from '@/types/sales-agent';
import { getSalesAgentDetail } from '@/lib/api/sales-agents';
import { Iconify } from '@/components/iconify';
import { AgentPerformanceCard } from './agent-performance-card';
import { AgentCommissionCard } from './agent-commission-card';
import { SalesAgentQuickActions } from './sales-agent-quick-actions';
import { format } from 'date-fns';

interface SalesAgentDetailViewProps {
  agentId: string;
}

export function SalesAgentDetailView({ agentId }: SalesAgentDetailViewProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<SalesAgent | null>(null);
  const [recentShops, setRecentShops] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'ban' | 'unban'>('approve');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getSalesAgentDetail(agentId);

      if (response.success) {
        setAgent(response.data.agent);
        setRecentShops(response.data.recentShops || []);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (error) {
      console.error('Failed to load agent details:', error);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agentId]);

  const handleActionComplete = () => {
    setActionDialogOpen(false);
    loadData();
  };

  const handleApprove = () => {
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleBan = () => {
    setActionType('ban');
    setActionDialogOpen(true);
  };

  const handleUnban = () => {
    setActionType('unban');
    setActionDialogOpen(true);
  };

  if (loading || !agent) {
    return (
      <Container maxWidth="xl">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const fullName = `${agent.firstName} ${agent.lastName}`;
  const initials = `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push('/dashboard/sales-agents')}
            >
              Back
            </Button>
            <Typography variant="h4">Sales Agent Details</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            {agent.approvalStatus === 'pending' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Iconify icon="mdi:check-circle" />}
                onClick={handleApprove}
              >
                Approve Agent
              </Button>
            )}
            {agent.approvalStatus === 'approved' && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="mdi:cancel" />}
                onClick={handleBan}
              >
                Ban Agent
              </Button>
            )}
            {agent.approvalStatus === 'banned' && (
              <Button
                variant="contained"
                color="info"
                startIcon={<Iconify icon="mdi:restore" />}
                onClick={handleUnban}
              >
                Unban Agent
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Agent Profile Card */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="h4">{fullName}</Typography>
                <Chip
                  label={agent.approvalStatus.toUpperCase()}
                  color={getStatusColor(agent.approvalStatus)}
                  size="medium"
                />
              </Stack>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">{agent.email}</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2">{agent.phone}</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Commission Rate
                    </Typography>
                    <Typography variant="body2">{agent.commissionRate}%</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Joined Date
                    </Typography>
                    <Typography variant="body2">
                      {format(agent.createdAt, 'MMM dd, yyyy')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {agent.approvalStatus === 'banned' && agent.banReason && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Ban Reason
                  </Typography>
                  <Typography variant="body2" color="error.dark">
                    {agent.banReason}
                  </Typography>
                  {agent.bannedAt && (
                    <Typography variant="caption" color="error.dark" sx={{ mt: 1, display: 'block' }}>
                      Banned on {format(agent.bannedAt, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Stack>
        </Card>

        {/* Performance Overview */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Shops Registered
                </Typography>
                <Typography variant="h3">{agent.shopsRegistered}</Typography>
                <Typography variant="caption" color="success.main">
                  +{agent.monthlyMetrics.shopRegistrations} this month
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h3">{agent.ordersPlaced}</Typography>
                <Typography variant="caption" color="success.main">
                  +{agent.monthlyMetrics.orders} this month
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h3">
                  UGX {(agent.totalRevenue / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="caption" color="success.main">
                  +UGX {(agent.monthlyMetrics.revenue / 1000000).toFixed(1)}M this month
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Commission
                </Typography>
                <Typography variant="h3" color="warning.main">
                  UGX {(agent.totalCommission / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +UGX {(agent.monthlyMetrics.commission / 1000000).toFixed(1)}M this month
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Performance and Commission Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AgentPerformanceCard agent={agent} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AgentCommissionCard agent={agent} />
          </Grid>
        </Grid>

        {/* Recent Shops */}
        <Card>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Shops Registered
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>Registration Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentShops.map((shop) => (
                  <TableRow key={shop._id}>
                    <TableCell>{shop.name}</TableCell>
                    <TableCell>{format(shop.registeredAt, 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Recent Orders */}
        <Card>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Shop Name</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {order._id}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.shopName}</TableCell>
                    <TableCell align="right">UGX {order.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(order.createdAt, 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      <SalesAgentQuickActions
        agent={agent}
        actionType={actionType}
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        onSuccess={handleActionComplete}
      />
    </Container>
  );
}
