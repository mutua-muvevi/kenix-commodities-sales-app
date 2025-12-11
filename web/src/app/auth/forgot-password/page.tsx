'use client';

import { useState } from 'react';
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
  Link as MuiLink,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/client';

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await forgotPassword({ email: data.email });

      if (response.success) {
        setSuccess(true);
      } else {
        // Show success message even if email doesn't exist (security best practice)
        setSuccess(true);
      }
      setLoading(false);
    } catch (err: any) {
      // Show success message even on error to prevent email enumeration
      setSuccess(true);
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
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Email sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Forgot Password?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No worries, we'll send you reset instructions
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    If an account exists with that email address, we've sent password reset
                    instructions to your inbox.
                  </Typography>
                  <Typography variant="body2" mt={2}>
                    Please check your email and follow the instructions to reset your password.
                  </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSuccess(false)}
                  sx={{ mb: 2 }}
                >
                  Send Again
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  autoFocus
                />

                <Typography variant="caption" color="text.secondary" display="block" mt={1} mb={3}>
                  Enter the email address associated with your account and we'll send you a link to
                  reset your password.
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <Box textAlign="center" mt={3}>
              <Link href="/auth/login" passHref legacyBehavior>
                <MuiLink
                  underline="none"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    gap: 1,
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Back to Login
                </MuiLink>
              </Link>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="caption">
                For security reasons, password reset links expire after 1 hour. If you don't receive
                an email within 5 minutes, please try again or contact support.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
