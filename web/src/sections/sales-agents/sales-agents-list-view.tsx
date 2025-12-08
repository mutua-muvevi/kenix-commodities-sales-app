'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
  Grid,
} from '@mui/material';
import { toast } from 'sonner';
import { getSalesAgents, getSalesAgentStatsApi } from '@/lib/api/sales-agents';
import type {
  SalesAgent,
  SalesAgentFilters,
  SalesAgentStats,
  SalesAgentApprovalStatus,
} from '@/types/sales-agent';
import { SalesAgentTableRow } from './sales-agent-table-row';
import { SalesAgentTableToolbar } from './sales-agent-table-toolbar';
import { TableHeadCustom, TableNoData } from '@/components/table';
import Scrollbar from '@/components/scrollbar';
import { Iconify } from '@/components/iconify';

const TABLE_HEAD = [
  { id: 'name', label: 'Agent Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'shops', label: 'Shops', align: 'center' as const },
  { id: 'orders', label: 'Orders', align: 'center' as const },
  { id: 'revenue', label: 'Total Revenue', align: 'right' as const },
  { id: 'commission', label: 'Commission', align: 'right' as const },
  { id: 'status', label: 'Status', align: 'center' as const },
  { id: 'actions', label: 'Actions', align: 'right' as const },
];

export function SalesAgentsListView() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [stats, setStats] = useState<SalesAgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<SalesAgentFilters>({
    approvalStatus: 'all',
    search: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [agentsResponse, statsResponse] = await Promise.all([
        getSalesAgents(filters),
        getSalesAgentStatsApi(),
      ]);

      if (agentsResponse.success) {
        setAgents(agentsResponse.data.agents);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load sales agents:', error);
      toast.error('Failed to load sales agents');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<SalesAgentFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPage(0);
    },
    []
  );

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  const handleActionComplete = useCallback(() => {
    loadData();
  }, [loadData]);

  const paginatedAgents = agents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const notFound = !loading && agents.length === 0;

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Sales Agents Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage sales agents, track performance, and monitor commissions
          </Typography>
        </Box>

        {/* Summary Cards */}
        {stats && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="mdi:account-group" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="h3">{stats.totalAgents}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Agents
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5 }}>
                      {stats.approvedAgents} approved
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'info.lighter',
                      color: 'info.main',
                    }}
                  >
                    <Iconify icon="mdi:store" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="h3">{stats.totalShopsRegistered}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Shops Registered
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'success.lighter',
                      color: 'success.main',
                    }}
                  >
                    <Iconify icon="mdi:currency-usd" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="h3">
                      UGX {(stats.totalRevenue / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      This month: UGX {(stats.monthlyRevenue / 1000000).toFixed(1)}M
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'warning.lighter',
                      color: 'warning.main',
                    }}
                  >
                    <Iconify icon="mdi:wallet" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="h3">
                      UGX {(stats.totalCommissionPaid / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Commission
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      This month: UGX {(stats.monthlyCommission / 1000000).toFixed(1)}M
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Table */}
        <Card>
          <SalesAgentTableToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {paginatedAgents.map((agent) => (
                    <SalesAgentTableRow
                      key={agent._id}
                      agent={agent}
                      onActionComplete={handleActionComplete}
                    />
                  ))}
                </TableBody>

                {notFound && <TableNoData notFound={notFound} />}
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePagination
            page={page}
            component="div"
            count={agents.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Stack>
    </Container>
  );
}
