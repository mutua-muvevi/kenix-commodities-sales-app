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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Paper,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getLoans, approveLoan, rejectLoan, Loan } from '@/lib/api/loans';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function PendingLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [page, rowsPerPage]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await getLoans({
        page: page + 1,
        limit: rowsPerPage,
        status: 'pending',
      });

      setLoans(response.data?.items || []);
      setTotalCount(response.data?.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching loans:', handleApiError(error));
      toast.error('Failed to fetch pending loans');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedLoan) return;

    try {
      setActionLoading(true);
      await approveLoan(selectedLoan._id);
      toast.success('Loan approved successfully');
      setApproveDialogOpen(false);
      fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', handleApiError(error));
      toast.error('Failed to approve loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoan || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await rejectLoan(selectedLoan._id, { reason: rejectionReason });
      toast.success('Loan rejected');
      setRejectDialogOpen(false);
      fetchLoans();
    } catch (error) {
      console.error('Error rejecting loan:', handleApiError(error));
      toast.error('Failed to reject loan');
    } finally {
      setActionLoading(false);
    }
  };

  const getEligibilityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Pending Loan Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve or reject loan applications from shops
        </Typography>
      </Box>

      {/* Alert */}
      {totalCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You have <strong>{totalCount}</strong> pending loan applications awaiting review
          </Typography>
        </Alert>
      )}

      {/* Loans Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan Code</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Interest Rate</TableCell>
                <TableCell>Total Repayment</TableCell>
                <TableCell>Eligibility Score</TableCell>
                <TableCell>Applied Date</TableCell>
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
                      No pending loan applications
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan._id}>
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
                      <Typography variant="body2" fontWeight="bold">
                        KSh {loan.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${loan.duration} months`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ maxWidth: 200, display: 'block' }}>
                        {loan.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{loan.interestRate}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        KSh {loan.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Monthly: KSh {loan.monthlyPayment.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${loan.eligibilityScore}%`}
                        size="small"
                        color={getEligibilityColor(loan.eligibilityScore)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {format(new Date(loan.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => router.push(`/dashboard/loans/${loan._id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApproveClick(loan)}
                      >
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRejectClick(loan)}
                      >
                        <RejectIcon fontSize="small" />
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
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Loan Application</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Are you sure you want to approve this loan application?
          </Alert>

          <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Shop
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedLoan?.shop.firstName} {selectedLoan?.shop.lastName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KSh {selectedLoan?.amount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedLoan?.duration} months
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Repayment
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KSh {selectedLoan?.totalAmount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Monthly Payment
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KSh {selectedLoan?.monthlyPayment.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Once approved, the loan will be activated and disbursement can proceed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApproveConfirm}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <ApproveIcon />}
          >
            Approve Loan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Loan Application</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please provide a clear reason for rejecting this loan application.
          </Alert>

          <Paper sx={{ p: 2, bgcolor: 'background.neutral', mb: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              {selectedLoan?.shop.firstName} {selectedLoan?.shop.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Loan Amount: KSh {selectedLoan?.amount.toLocaleString()}
            </Typography>
          </Paper>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejecting this loan application..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={actionLoading || !rejectionReason}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <RejectIcon />}
          >
            Reject Loan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
