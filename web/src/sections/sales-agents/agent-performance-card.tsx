'use client';

import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Box,
  Typography,
  LinearProgress,
  Divider,
} from '@mui/material';
import type { SalesAgent } from '@/types/sales-agent';
import { Iconify } from '@/components/iconify';

interface AgentPerformanceCardProps {
  agent: SalesAgent;
}

export function AgentPerformanceCard({ agent }: AgentPerformanceCardProps) {
  const weeklyProgress = agent.weeklyMetrics.orders > 0
    ? (agent.weeklyMetrics.orders / agent.monthlyMetrics.orders) * 100
    : 0;

  const shopProgress = agent.monthlyMetrics.shopRegistrations > 0
    ? (agent.monthlyMetrics.shopRegistrations / agent.shopsRegistered) * 100
    : 0;

  return (
    <Card>
      <CardHeader title="Performance Metrics" />
      <CardContent>
        <Stack spacing={3}>
          {/* Weekly Performance */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="mdi:calendar-week" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2">Weekly Performance</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {weeklyProgress.toFixed(0)}% of monthly
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {agent.weeklyMetrics.orders}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(weeklyProgress, 100)}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    UGX {agent.weeklyMetrics.revenue.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Commission
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="warning.main">
                    UGX {agent.weeklyMetrics.commission.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Shop Registrations
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {agent.weeklyMetrics.shopRegistrations}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Monthly Performance */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="mdi:calendar-month" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="subtitle2">Monthly Performance</Typography>
              </Stack>
            </Stack>

            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {agent.monthlyMetrics.orders}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(agent.monthlyMetrics.orders / agent.ordersPlaced) * 100}
                  color="success"
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    UGX {agent.monthlyMetrics.revenue.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Commission
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="warning.main">
                    UGX {agent.monthlyMetrics.commission.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Shop Registrations
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {agent.monthlyMetrics.shopRegistrations}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(shopProgress, 100)}
                  color="info"
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Averages */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Performance Averages
            </Typography>
            <Stack spacing={1.5} mt={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Avg. Order Value
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  UGX {(agent.totalRevenue / agent.ordersPlaced).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Avg. Commission per Order
                </Typography>
                <Typography variant="body2" fontWeight="600" color="warning.main">
                  UGX {(agent.totalCommission / agent.ordersPlaced).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Avg. Orders per Shop
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {(agent.ordersPlaced / agent.shopsRegistered).toFixed(1)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
