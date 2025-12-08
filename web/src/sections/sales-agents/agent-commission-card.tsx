'use client';

import { Card, CardHeader, CardContent, Stack, Box, Typography, Chip } from '@mui/material';
import type { SalesAgent } from '@/types/sales-agent';
import { Iconify } from '@/components/iconify';
import Chart, { useChart } from '@/components/chart';

interface AgentCommissionCardProps {
  agent: SalesAgent;
}

export function AgentCommissionCard({ agent }: AgentCommissionCardProps) {
  // Generate mock data for commission trend (last 6 months)
  const monthlyCommissions = [
    { month: 'Jul', commission: agent.monthlyMetrics.commission * 0.7 },
    { month: 'Aug', commission: agent.monthlyMetrics.commission * 0.85 },
    { month: 'Sep', commission: agent.monthlyMetrics.commission * 0.95 },
    { month: 'Oct', commission: agent.monthlyMetrics.commission * 1.1 },
    { month: 'Nov', commission: agent.monthlyMetrics.commission * 0.9 },
    { month: 'Dec', commission: agent.monthlyMetrics.commission },
  ];

  const chartOptions = useChart({
    chart: {
      sparkline: { enabled: true },
    },
    xaxis: {
      categories: monthlyCommissions.map((m) => m.month),
    },
    tooltip: {
      y: {
        formatter: (value: number) => `UGX ${value.toLocaleString()}`,
      },
    },
    colors: ['#FFA726'],
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: '#FFA726', opacity: 0.8 },
          { offset: 100, color: '#FFA726', opacity: 0.2 },
        ],
      },
    },
  });

  const chartSeries = [
    {
      name: 'Commission',
      data: monthlyCommissions.map((m) => Math.round(m.commission)),
    },
  ];

  const totalEarned = agent.totalCommission;
  const monthlyEarned = agent.monthlyMetrics.commission;
  const weeklyEarned = agent.weeklyMetrics.commission;
  const avgPerOrder = agent.totalCommission / agent.ordersPlaced;

  return (
    <Card>
      <CardHeader
        title="Commission Overview"
        action={
          <Chip
            label={`${agent.commissionRate}% Rate`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />
      <CardContent>
        <Stack spacing={3}>
          {/* Commission Chart */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              6-Month Commission Trend
            </Typography>
            <Chart
              type="area"
              series={chartSeries}
              options={chartOptions}
              height={200}
            />
          </Box>

          {/* Commission Stats */}
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.light',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Iconify icon="mdi:wallet" width={20} sx={{ color: 'warning.main' }} />
                <Typography variant="subtitle2" color="warning.dark">
                  Total Commission Earned
                </Typography>
              </Stack>
              <Typography variant="h4" color="warning.dark">
                UGX {totalEarned.toLocaleString()}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: 'background.neutral',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  This Month
                </Typography>
                <Typography variant="h6" color="warning.main">
                  UGX {monthlyEarned.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: 'background.neutral',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  This Week
                </Typography>
                <Typography variant="h6" color="warning.main">
                  UGX {weeklyEarned.toLocaleString()}
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Avg. Commission per Order
                  </Typography>
                  <Typography variant="subtitle2" color="warning.main">
                    UGX {avgPerOrder.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Orders Processed
                  </Typography>
                  <Typography variant="subtitle2">{agent.ordersPlaced}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Revenue Generated
                  </Typography>
                  <Typography variant="subtitle2">
                    UGX {agent.totalRevenue.toLocaleString()}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Commission Rate
                  </Typography>
                  <Chip
                    label={`${agent.commissionRate}%`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {/* Payment Status */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Iconify icon="mdi:information" width={20} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle2" color="info.dark">
                Commission Payment Info
              </Typography>
            </Stack>
            <Typography variant="body2" color="info.dark">
              Commissions are calculated at {agent.commissionRate}% of order value and paid
              monthly. Next payment date: 1st of next month.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
