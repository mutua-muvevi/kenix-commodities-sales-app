'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Pending as PendingIcon,
  CheckCircle as ActiveIcon,
  Assignment as LoanIcon,
} from '@mui/icons-material';

interface LoanCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

function LoanCategoryCard({ title, description, icon, color, route }: LoanCategoryCardProps) {
  const router = useRouter();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => router.push(route)}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function LoansPage() {
  const router = useRouter();

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Loan Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage shop loans, applications, and repayments
        </Typography>
      </Box>

      {/* Category Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <LoanCategoryCard
            title="Pending Applications"
            description="Review and approve pending loan applications from shops"
            icon={<PendingIcon fontSize="large" />}
            color="#ed6c02"
            route="/dashboard/loans/pending"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LoanCategoryCard
            title="Active Loans"
            description="Monitor active loans, repayments, and outstanding balances"
            icon={<ActiveIcon fontSize="large" />}
            color="#2e7d32"
            route="/dashboard/loans/active"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LoanCategoryCard
            title="All Loans"
            description="View complete loan history and detailed reports"
            icon={<LoanIcon fontSize="large" />}
            color="#1976d2"
            route="/dashboard/loans/active"
          />
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Disbursed
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  KSh 0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Collected
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  KSh 0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Outstanding Balance
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  KSh 0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Collection Rate
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  0%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
