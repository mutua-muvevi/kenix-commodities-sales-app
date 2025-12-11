'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { verifyEmail, resendOTP } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/client';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      setError('Email address is required for verification');
    } else {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && email) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (!email || otp.length !== 6) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyEmail({ email, otp });

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 2000);
      } else {
        setError(response.message || 'Invalid verification code');
        setOtp(''); // Clear OTP on error
        setLoading(false);
      }
    } catch (err: any) {
      setError(handleApiError(err));
      setOtp(''); // Clear OTP on error
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      const response = await resendOTP({ email });

      if (response.success) {
        setResendCooldown(60); // 60 seconds cooldown
        setError(null);
      }
      setResendLoading(false);
    } catch (err: any) {
      setError(handleApiError(err));
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
  };

  const validateChar = (value: string) => {
    return /^[0-9]$/.test(value);
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
                  bgcolor: success ? 'success.main' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {success ? (
                  <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
                ) : (
                  <Email sx={{ fontSize: 40, color: 'white' }} />
                )}
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {success ? 'Email Verified!' : 'Verify Your Email'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {success
                  ? 'Your email has been successfully verified'
                  : `We've sent a 6-digit code to ${email || 'your email'}`}
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
                  <Typography variant="body2">
                    Your email has been successfully verified! You can now log in to your account.
                  </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                  Redirecting to login page...
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/auth/login')}
                >
                  Go to Login
                </Button>
              </Box>
            ) : (
              <Box>
                <Box mb={4}>
                  <MuiOtpInput
                    value={otp}
                    onChange={handleOtpChange}
                    length={6}
                    validateChar={validateChar}
                    TextFieldsProps={{
                      disabled: loading || !email,
                      placeholder: '-',
                      type: 'tel',
                    }}
                    sx={{
                      gap: 1.5,
                      '& .MuiTextField-root': {
                        '& input': {
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                        },
                      },
                    }}
                  />
                </Box>

                {loading && (
                  <Box display="flex" justifyContent="center" mb={2}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                <Box textAlign="center" mt={3}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Didn't receive the code?
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleResendOTP}
                    disabled={resendLoading || resendCooldown > 0 || !email}
                  >
                    {resendLoading ? (
                      <CircularProgress size={20} />
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="caption">
                    The verification code will expire in 15 minutes. If you don't receive the code,
                    check your spam folder or click resend.
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
