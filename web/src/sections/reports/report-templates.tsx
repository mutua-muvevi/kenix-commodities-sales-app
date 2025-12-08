'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarMonth,
  TwoWheeler,
  People,
  AttachMoney,
  Inventory,
  LocalShipping,
  Description,
} from '@mui/icons-material';
import type { ReportTemplate } from '@/types/report';
import { getReportTemplates } from '@/lib/api/reports';

interface ReportTemplatesProps {
  onGenerateReport: (template: ReportTemplate) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  calendar: <CalendarMonth sx={{ fontSize: 48 }} />,
  motorcycle: <TwoWheeler sx={{ fontSize: 48 }} />,
  people: <People sx={{ fontSize: 48 }} />,
  money: <AttachMoney sx={{ fontSize: 48 }} />,
  inventory: <Inventory sx={{ fontSize: 48 }} />,
  localShipping: <LocalShipping sx={{ fontSize: 48 }} />,
  description: <Description sx={{ fontSize: 48 }} />,
};

export default function ReportTemplates({ onGenerateReport }: ReportTemplatesProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load report templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Report Templates
      </Typography>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: 20,
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  bgcolor: template.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: (theme) => theme.shadows[4],
                }}
              >
                {iconMap[template.icon] || iconMap.description}
              </Box>

              <CardContent sx={{ flex: 1, pt: 8, pb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {template.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {template.fields.slice(0, 3).map((field) => (
                    <Box
                      key={field}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {field}
                    </Box>
                  ))}
                  {template.fields.length > 3 && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      +{template.fields.length - 3} more
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onGenerateReport(template)}
                  sx={{
                    bgcolor: template.color,
                    '&:hover': {
                      bgcolor: template.color,
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
