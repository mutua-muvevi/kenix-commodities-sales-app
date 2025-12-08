'use client';

import { useState } from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import type { ReportTemplate } from '@/types/report';
import ReportTemplates from './report-templates';
import ReportGenerator from './report-generator';
import ReportHistory from './report-history';

export default function ReportsDashboard() {
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setGeneratorOpen(true);
  };

  const handleCloseGenerator = () => {
    setGeneratorOpen(false);
    setSelectedTemplate(null);
  };

  const handleReportGenerated = () => {
    // Trigger refresh of report history
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Reports Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate, manage, and download comprehensive business reports
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <ReportTemplates onGenerateReport={handleGenerateReport} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <ReportHistory onRefresh={refreshKey} />
          </Grid>
        </Grid>

        <ReportGenerator
          open={generatorOpen}
          template={selectedTemplate}
          onClose={handleCloseGenerator}
          onReportGenerated={handleReportGenerated}
        />
      </Container>
    </Box>
  );
}
