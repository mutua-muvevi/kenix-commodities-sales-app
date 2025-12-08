'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import {
  TrendingUp,
  HourglassEmpty,
  ErrorOutline,
  CalendarToday
} from '@mui/icons-material';
import type { PaymentStats } from '../../types/payment';

interface PaymentSummaryCardsProps {
  stats: PaymentStats;
  loading?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export function PaymentSummaryCards({ stats, loading = false }: PaymentSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Collected',
      value: formatCurrency(stats.totalCollected),
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pending),
      icon: HourglassEmpty,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      title: 'Failed Transactions',
      value: stats.failed.toString(),
      icon: ErrorOutline,
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    {
      title: "Today's Collection",
      value: formatCurrency(stats.todayCollection),
      icon: CalendarToday,
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} sx={{ minHeight: 120 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 3,
        mb: 3
      }}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            sx={{
              minHeight: 120,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: card.bgColor
                    }}
                  >
                    <Icon sx={{ color: card.color, fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {card.value}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
