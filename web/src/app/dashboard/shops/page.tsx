'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { getUsers, approveUser, banUser } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.Node;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function ShopsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; shopId: string | null }>({
    open: false,
    shopId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchShops();
  }, [tabValue]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let approvalStatus: 'pending' | 'approved' | 'banned' | undefined;

      if (tabValue === 1) approvalStatus = 'pending';
      else if (tabValue === 2) approvalStatus = 'approved';
      else if (tabValue === 3) approvalStatus = 'banned';

      const response = await getUsers({
        role: 'shop',
        approvalStatus,
        search: searchQuery,
      });

      setShops(response.data?.items || []);
    } catch (error) {
      console.error('Error fetching shops:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId: string) => {
    try {
      await approveUser(shopId);
      fetchShops(); // Refresh list
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.shopId || !rejectReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await banUser(rejectDialog.shopId, rejectReason);
      setRejectDialog({ open: false, shopId: null });
      setRejectReason('');
      fetchShops(); // Refresh list
    } catch (error) {
      alert(handleApiError(error));
    }
  };

  const getStatusColor = (status?: string) => {
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
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Shop Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage shop registrations and approvals
        </Typography>
      </Box>

      {/* Tabs */}
      <Card elevation={2}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Shops" />
            <Tab label="Pending Approval" />
            <Tab label="Approved" />
            <Tab label="Banned" />
          </Tabs>

          {/* Search */}
          <Box mt={3} mb={2}>
            <TextField
              fullWidth
              placeholder="Search shops by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') fetchShops();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Table */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Shop Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No shops found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shops.map((shop) => (
                      <TableRow key={shop._id}>
                        <TableCell>
                          {shop.businessName || `${shop.firstName} ${shop.lastName}`}
                        </TableCell>
                        <TableCell>
                          {shop.firstName} {shop.lastName}
                        </TableCell>
                        <TableCell>{shop.email}</TableCell>
                        <TableCell>{shop.phone}</TableCell>
                        <TableCell>{shop.address || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={shop.approvalStatus || 'pending'}
                            size="small"
                            color={getStatusColor(shop.approvalStatus)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => router.push(`/dashboard/shops/${shop._id}`)}
                              title="View Details"
                            >
                              <Visibility />
                            </IconButton>

                            {shop.approvalStatus === 'pending' && (
                              <>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApprove(shop._id)}
                                  title="Approve Shop"
                                >
                                  <CheckCircle />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    setRejectDialog({ open: true, shopId: shop._id })
                                  }
                                  title="Reject Shop"
                                >
                                  <Cancel />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, shopId: null })}>
        <DialogTitle>Reject Shop Registration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this shop registration..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, shopId: null })}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject Shop
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
