// src/components/auth/SessionTimeoutWarning.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useAuthStore, SESSION_TIMEOUT } from '@/store/authStore';

// Warning appears 5 minutes before session expires
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const COUNTDOWN_TIME = 60 * 1000; // 60 seconds countdown

export default function SessionTimeoutWarning() {
  const { isAuthenticated, lastActivity, logout, updateLastActivity } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isAuthenticated || !lastActivity) {
      return;
    }

    const checkSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeUntilExpiry = SESSION_TIMEOUT - timeSinceLastActivity;

      // Show warning if within WARNING_TIME of expiry
      if (timeUntilExpiry <= WARNING_TIME && timeUntilExpiry > 0) {
        setShowWarning(true);
        const secondsRemaining = Math.floor(timeUntilExpiry / 1000);
        setCountdown(secondsRemaining);
      } else if (timeUntilExpiry <= 0) {
        // Session expired, logout
        handleLogout();
      } else {
        setShowWarning(false);
      }
    };

    // Check session every second
    const interval = setInterval(checkSession, 1000);

    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity]);

  // Update countdown every second
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showWarning && countdown <= 0) {
      handleLogout();
    }
  }, [showWarning, countdown]);

  const handleStayLoggedIn = () => {
    updateLastActivity();
    setShowWarning(false);
    setCountdown(60);
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = (countdown / (WARNING_TIME / 1000)) * 100;

  return (
    <Dialog
      open={showWarning}
      onClose={(event, reason) => {
        // Prevent closing by clicking outside or pressing escape
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
      }}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Warning sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          Session Timeout Warning
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Your session is about to expire due to inactivity. You will be automatically logged out
          in:
        </Typography>

        <Typography variant="h3" fontWeight="bold" color="error.main" mb={2}>
          {formatTime(countdown)}
        </Typography>

        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color="error"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Click "Stay Logged In" to continue your session, or "Logout" to end your session now.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button variant="outlined" onClick={handleLogout} size="large">
          Logout
        </Button>
        <Button variant="contained" onClick={handleStayLoggedIn} size="large" autoFocus>
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
}
