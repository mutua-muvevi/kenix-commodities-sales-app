'use client';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Cancel,
  AccessTime,
  LocationOn
} from '@mui/icons-material';
import { DeliveryShop, ShopDeliveryStatus } from '../../types/delivery';

interface DeliveryTimelineProps {
  shops: DeliveryShop[];
}

const STATUS_CONFIG: Record<
  ShopDeliveryStatus,
  {
    color: 'inherit' | 'primary' | 'success' | 'error';
    icon: React.ReactNode;
    label: string;
  }
> = {
  pending: {
    color: 'inherit',
    icon: <RadioButtonUnchecked />,
    label: 'Pending'
  },
  'in-progress': {
    color: 'primary',
    icon: <AccessTime />,
    label: 'In Progress'
  },
  completed: {
    color: 'success',
    icon: <CheckCircle />,
    label: 'Completed'
  },
  failed: {
    color: 'error',
    icon: <Cancel />,
    label: 'Failed'
  }
};

export default function DeliveryTimeline({ shops }: DeliveryTimelineProps) {
  const formatTime = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort shops by sequence number
  const sortedShops = [...shops].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return (
    <Timeline position="right">
      {sortedShops.map((shop, index) => {
        const config = STATUS_CONFIG[shop.status];
        const isLast = index === sortedShops.length - 1;

        return (
          <TimelineItem key={shop.shopId}>
            <TimelineOppositeContent
              sx={{ flex: 0.2, py: 2 }}
              color="text.secondary"
            >
              <Typography variant="caption" display="block">
                Stop {shop.sequenceNumber}
              </Typography>
              {shop.arrivedAt && (
                <Typography variant="caption" display="block" fontWeight={600}>
                  {formatTime(shop.arrivedAt)}
                </Typography>
              )}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={config.color} variant={shop.status === 'completed' ? 'filled' : 'outlined'}>
                {config.icon}
              </TimelineDot>
              {!isLast && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Paper
                elevation={shop.status === 'in-progress' ? 3 : 1}
                sx={{
                  p: 2,
                  bgcolor: shop.status === 'in-progress' ? 'primary.lighter' : 'background.paper',
                  border: shop.status === 'in-progress' ? 2 : 0,
                  borderColor: 'primary.main'
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {shop.shopName}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {shop.address}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip
                      label={config.label}
                      color={config.color}
                      size="small"
                    />
                  </Stack>

                  {shop.completedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Completed at {formatTime(shop.completedAt)}
                    </Typography>
                  )}

                  {shop.deliveryNote && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        bgcolor: 'background.neutral',
                        borderStyle: 'dashed'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Note: {shop.deliveryNote}
                      </Typography>
                    </Paper>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Coordinates:
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace">
                      {shop.coordinates.lat.toFixed(4)}, {shop.coordinates.lng.toFixed(4)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
