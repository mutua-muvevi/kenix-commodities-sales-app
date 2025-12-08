'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getLoan,
  getLoanSchedule,
  getLoanRepayments,
  Loan,
  LoanSchedule,
  LoanRepayment,
} from '@/lib/api/loans';
import { handleApiError } from '@/lib/api/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

export default function LoanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<LoanSchedule[]>([]);
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);

      const [loanRes, scheduleRes, repaymentsRes] = await Promise.all([
        getLoan(loanId),
        getLoanSchedule(loanId),
        getLoanRepayments(loanId),
      ]);

      setLoan(loanRes.data);
      setSchedule(scheduleRes.data || []);
      setRepayments(repaymentsRes.data || []);
    } catch (error) {
      console.error('Error fetching loan details:', handleApiError(error));
      toast.error('Failed to fetch loan details');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!loan || loan.totalAmount === 0) return 0;
    return Math.round((loan.amountPaid / loan.totalAmount) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'partial':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!loan) {
    return (
      <Box>
        <Typography variant="h6" color="text.secondary">
          Loan not found
        </Typography>
      </Box>
    );
  }

  const progress = calculateProgress();

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.push('/dashboard/loans/active')}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" fontWeight="bold">
              Loan Details
            </Typography>
            <Chip label={loan.loanCode} variant="outlined" />
            <StatusBadge status={loan.status} type="loan" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {loan.shop.firstName} {loan.shop.lastName} - {loan.shop.phone}
          </Typography>
        </Box>
      </Box>

      {/* Loan Information */}
      <Grid container spacing={3} mb={3}>
        {/* Loan Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Loan Amount (Principal)
              </Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                KSh {loan.amount.toLocaleString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Interest Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {loan.interestRate}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {loan.duration} months
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Payment
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    KSh {loan.monthlyPayment.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Repayment
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    KSh {loan.totalAmount.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Repayment Progress */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Repayment Progress
              </Typography>
              <Box my={2}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 12, borderRadius: 1 }}
                  color={progress >= 75 ? 'success' : progress >= 40 ? 'primary' : 'warning'}
                />
                <Typography variant="h6" fontWeight="bold" align="center" mt={1}>
                  {progress}%
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    KSh {loan.amountPaid.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Outstanding
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="error.main">
                    KSh {loan.outstandingBalance.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Loan Information
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Purpose
                  </Typography>
                  <Typography variant="body2">{loan.purpose}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Applied Date
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(loan.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Disbursed Date
                  </Typography>
                  <Typography variant="body2">
                    {loan.disbursedAt
                      ? format(new Date(loan.disbursedAt), 'MMM dd, yyyy')
                      : 'Not disbursed'}
                  </Typography>
                </Grid>
                {loan.approvedBy && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Approved By
                    </Typography>
                    <Typography variant="body2">
                      {loan.approvedBy.firstName} {loan.approvedBy.lastName}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Repayment Schedule */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Repayment Schedule
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Installment</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Interest</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.installmentNumber}>
                    <TableCell>
                      <Chip label={`#${item.installmentNumber}`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>KSh {item.principalAmount.toLocaleString()}</TableCell>
                    <TableCell>KSh {item.interestAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        KSh {item.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.paidAmount ? (
                        <Typography color="success.main" fontWeight="medium">
                          KSh {item.paidAmount.toLocaleString()}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                    </TableCell>
                    <TableCell>
                      {item.paidDate ? (
                        <Typography variant="caption">
                          {format(new Date(item.paidDate), 'MMM dd, yyyy')}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Payment History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Interest</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Transaction Ref</TableCell>
                  <TableCell>Balance After</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        No payment history available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  repayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium" color="success.main">
                          KSh {payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>KSh {payment.principal.toLocaleString()}</TableCell>
                      <TableCell>KSh {payment.interest.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={payment.paymentMethod} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{payment.transactionRef}</Typography>
                      </TableCell>
                      <TableCell>KSh {payment.balanceAfterPayment.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={payment.status === 'completed' ? 'success' : 'warning'}
                        />
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
