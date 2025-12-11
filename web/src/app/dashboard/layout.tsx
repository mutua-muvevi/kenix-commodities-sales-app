'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopBar from '@/components/dashboard/DashboardTopBar';
import SessionTimeoutWarning from '@/components/auth/SessionTimeoutWarning';
import ActivityTracker from '@/components/auth/ActivityTracker';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, checkSession } = useAuthStore();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      router.push('/auth/login?error=unauthorized');
      return;
    }

    // Check if user is banned
    if (user.isBanned) {
      router.push('/auth/login?error=banned');
      return;
    }

    // Check session validity
    const sessionValid = checkSession();
    if (!sessionValid) {
      router.push('/auth/login?error=session_expired');
      return;
    }
  }, [isAuthenticated, user, router, checkSession]);

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Activity Tracker - monitors user activity */}
      <ActivityTracker />

      {/* Session Timeout Warning - shows warning before session expires */}
      <SessionTimeoutWarning />

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar */}
          <DashboardTopBar />

          {/* Page Content */}
          <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
