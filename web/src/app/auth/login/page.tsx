'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { login, LoginCredentials } from '@/lib/api/auth';
import { useAuthStore, MAX_LOGIN_ATTEMPTS } from '@/store/authStore';
import { handleApiError } from '@/lib/api/client';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, incrementLoginAttempts, resetLoginAttempts, loginAttempts } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Check for success messages from URL params
    const verified = searchParams.get('verified');
    const redirect = searchParams.get('redirect');
    const errorParam = searchParams.get('error');

    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }

    if (errorParam === 'unauthorized') {
      setError('You do not have permission to access the admin dashboard.');
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    // Check if login attempts exceeded
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      setError(
        `Too many failed login attempts. Please try again later or reset your password.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await login(data);

      if (response.success && response.data) {
        const { user } = response.data;

        // Store user in zustand
        setUser(user);
        resetLoginAttempts();

        // Check user role and redirect accordingly
        const userRole = user.role;

        if (userRole === 'admin') {
          // Check for redirect parameter
          const redirect = searchParams.get('redirect');
          router.push(redirect || '/dashboard');
        } else if (userRole === 'shop') {
          setError('Please use the mobile app to access your shop account');
          setLoading(false);
        } else if (userRole === 'rider') {
          setError('Please use the rider mobile app to access your account');
          setLoading(false);
        } else if (userRole === 'sales_agent') {
          setError('Please use the sales agent mobile app to access your account');
          setLoading(false);
        } else {
          setError('Invalid user role. Please contact support.');
          setLoading(false);
        }
      } else {
        incrementLoginAttempts();
        setError(response.message || 'Login failed');
        setLoading(false);
      }
    } catch (err: any) {
      incrementLoginAttempts();
      setError(handleApiError(err));
      setLoading(false);
    }
  };

  const remainingAttempts = MAX_LOGIN_ATTEMPTS - loginAttempts;

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

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                  before account is temporarily locked.
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading || loginAttempts >= MAX_LOGIN_ATTEMPTS}
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading || loginAttempts >= MAX_LOGIN_ATTEMPTS}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading || loginAttempts >= MAX_LOGIN_ATTEMPTS}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box textAlign="right" mt={1} mb={2}>
                <Link href="/auth/forgot-password" passHref legacyBehavior>
                  <MuiLink variant="body2" underline="hover">
                    Forgot password?
                  </MuiLink>
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 1, mb: 2 }}
                disabled={loading || loginAttempts >= MAX_LOGIN_ATTEMPTS}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/auth/register" passHref legacyBehavior>
                  <MuiLink underline="hover" sx={{ fontWeight: 600 }}>
                    Create one
                  </MuiLink>
                </Link>
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
              Admin access only. For shop, rider, or sales agent access, please use the mobile
              application.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
