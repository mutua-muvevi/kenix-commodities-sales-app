'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  LinearProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getLoans, Loan } from '@/lib/api/loans';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function ActiveLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchLoans();
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await getLoans({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
      });

      setLoans(response.data?.items || []);
      setTotalCount(response.data?.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching loans:', handleApiError(error));
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (loan: Loan) => {
    if (loan.totalAmount === 0) return 0;
    return Math.round((loan.amountPaid / loan.totalAmount) * 100);
  };

  const isOverdue = (loan: Loan) => {
    if (!loan.nextPaymentDue) return false;
    return new Date(loan.nextPaymentDue) < new Date();
  };

  const defaultedLoans = loans.filter((loan) => loan.status === 'defaulted');
  const overdueLoans = loans.filter((loan) => isOverdue(loan) && loan.status === 'active');

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Active Loans
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor active loans and repayment progress
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Active Loans
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.lighter' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="warning" />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overdue Loans
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {overdueLoans.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'error.lighter' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="error" />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Defaulted Loans
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {defaultedLoans.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by shop name or loan code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="defaulted">Defaulted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('active');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan Code</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Principal</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Amount Paid</TableCell>
                <TableCell>Outstanding</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Next Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No loans found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  const progress = calculateProgress(loan);
                  const overdue = isOverdue(loan);

                  return (
                    <TableRow key={loan._id} sx={{ bgcolor: overdue ? 'warning.lighter' : 'inherit' }}>
                      <TableCell>
                        <Chip label={loan.loanCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loan.shop.firstName} {loan.shop.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loan.shop.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          KSh {loan.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          KSh {loan.totalAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                          KSh {loan.amountPaid.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                          KSh {loan.outstandingBalance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 120 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
                            color={progress >= 75 ? 'success' : progress >= 40 ? 'primary' : 'warning'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {loan.nextPaymentDue ? (
                          <Box>
                            <Typography
                              variant="caption"
                              color={overdue ? 'error' : 'text.secondary'}
                              fontWeight={overdue ? 'bold' : 'normal'}
                            >
                              {format(new Date(loan.nextPaymentDue), 'MMM dd, yyyy')}
                            </Typography>
                            {overdue && (
                              <Chip
                                label="OVERDUE"
                                size="small"
                                color="error"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={loan.status}
                          size="small"
                          color={
                            loan.status === 'active'
                              ? 'success'
                              : loan.status === 'completed'
                              ? 'primary'
                              : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => router.push(`/dashboard/loans/${loan._id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
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
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
