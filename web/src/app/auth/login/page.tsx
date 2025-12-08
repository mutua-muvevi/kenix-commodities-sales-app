'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { login, LoginCredentials } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(data);

      if (response.success) {
        // Store user and token in zustand
        setUser(response.data.user);
        setToken(response.data.token);

        // Check user role and redirect accordingly
        const userRole = response.data.user.role;

        if (userRole === 'admin') {
          router.push('/dashboard');
        } else if (userRole === 'shop') {
          // Shops should use mobile app
          setError('Please use the mobile app to access your shop account');
          setLoading(false);
          return;
        } else if (userRole === 'rider') {
          // Riders should use mobile app
          setError('Please use the rider mobile app to access your account');
          setLoading(false);
          return;
        } else if (userRole === 'sales_agent') {
          // Sales agents should use mobile app
          setError('Please use the sales agent mobile app to access your account');
          setLoading(false);
          return;
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
      }
    } catch (err: any) {
      setError(handleApiError(err));
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Kenix Commodities
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Admin Dashboard Login
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </form>

            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              Admin access only. For shop, rider, or sales agent access, please use the mobile
              application.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
