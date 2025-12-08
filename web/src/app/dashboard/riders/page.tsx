'use client';

import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { RidersListView } from '@/sections/riders';
import { useRouter } from 'next/navigation';

export default function RidersPage() {
  const router = useRouter();

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <MuiLink
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </MuiLink>
        <Typography color="text.primary">Riders</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Riders Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage delivery riders, monitor performance, and track wallet balances
        </Typography>
      </Box>

      {/* Riders List View */}
      <RidersListView />
    </Box>
  );
}
