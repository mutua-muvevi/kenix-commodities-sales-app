'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSettings, updateSettings, SystemSettings } from '@/lib/api/settings';
import { getUsers } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import FormProvider from '@/components/hook-form/form-provider';

const settingsSchema = z.object({
  minimumOrderAmount: z.number().min(0, 'Minimum order amount must be positive'),
  deliveryFee: z.number().min(0, 'Delivery fee must be positive'),
  loanInterestRate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  salesAgentCommissionRate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      minimumOrderAmount: 0,
      deliveryFee: 0,
      loanInterestRate: 0,
      salesAgentCommissionRate: 0,
    },
  });

  const { control, handleSubmit, reset } = methods;

  useEffect(() => {
    fetchSettings();
    fetchAdminUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      const settingsData = response.data;
      setSettings(settingsData);

      reset({
        minimumOrderAmount: settingsData.minimumOrderAmount,
        deliveryFee: settingsData.deliveryFee,
        loanInterestRate: settingsData.loanInterestRate,
        salesAgentCommissionRate: settingsData.salesAgentCommissionRate,
      });
    } catch (error) {
      console.error('Error fetching settings:', handleApiError(error));
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await getUsers({ role: 'admin' });
      setAdminUsers(response.data?.items || []);
    } catch (error) {
      console.error('Error fetching admin users:', handleApiError(error));
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      await updateSettings(data);
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', handleApiError(error));
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
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
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings & Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system settings, integrations, and user permissions
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="System Settings" />
          <Tab label="Payment Integration" />
          <Tab label="SMS Configuration" />
          <Tab label="Admin Users" />
        </Tabs>

        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  These settings affect the entire system. Changes will be applied immediately.
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Order Settings
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Controller
                          name="minimumOrderAmount"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Minimum Order Amount (KSh)"
                              type="number"
                              fullWidth
                              error={!!error}
                              helperText={error?.message || 'Minimum amount required to place an order'}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="deliveryFee"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Delivery Fee (KSh)"
                              type="number"
                              fullWidth
                              error={!!error}
                              helperText={error?.message || 'Standard delivery fee per order'}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Financial Settings
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Controller
                          name="loanInterestRate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Loan Interest Rate (%)"
                              type="number"
                              fullWidth
                              error={!!error}
                              helperText={error?.message || 'Annual interest rate for shop loans'}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="salesAgentCommissionRate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Sales Agent Commission (%)"
                              type="number"
                              fullWidth
                              error={!!error}
                              helperText={error?.message || 'Commission rate for sales agents'}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </FormProvider>
        </TabPanel>

        {/* M-Pesa Configuration Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning">
                M-Pesa configuration is sensitive. Changes should only be made by authorized personnel.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      M-Pesa Configuration
                    </Typography>
                    <Chip
                      label={settings?.mpesa?.environment || 'Not Configured'}
                      color={settings?.mpesa?.environment === 'production' ? 'success' : 'warning'}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Consumer Key"
                        fullWidth
                        value="••••••••••••••••"
                        disabled
                        InputProps={{
                          endAdornment: <LockIcon color="disabled" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Consumer Secret"
                        fullWidth
                        value="••••••••••••••••"
                        disabled
                        InputProps={{
                          endAdornment: <LockIcon color="disabled" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Short Code"
                        fullWidth
                        value={settings?.mpesa?.shortCode || 'Not Set'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Pass Key"
                        fullWidth
                        value="••••••••••••••••"
                        disabled
                        InputProps={{
                          endAdornment: <LockIcon color="disabled" />,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Contact your system administrator to update M-Pesa credentials
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* SMS Configuration Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                SMS integration powered by Africa's Talking for order notifications and alerts
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Africa's Talking Configuration
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="API Username"
                        fullWidth
                        value={settings?.sms?.username || 'Not Set'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="API Key"
                        fullWidth
                        value="••••••••••••••••"
                        disabled
                        InputProps={{
                          endAdornment: <LockIcon color="disabled" />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Sender ID"
                        fullWidth
                        value={settings?.sms?.senderId || 'Not Set'}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Contact your system administrator to update SMS credentials
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Admin Users Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Administrator Users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => toast.info('Feature coming soon')}
                >
                  Add Admin
                </Button>
              </Box>

              <Card variant="outlined">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {admin.firstName} {admin.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>{admin.phone}</TableCell>
                          <TableCell>
                            <Chip label={admin.role} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={admin.status}
                              size="small"
                              color={admin.status === 'active' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => toast.info('Feature coming soon')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
}
