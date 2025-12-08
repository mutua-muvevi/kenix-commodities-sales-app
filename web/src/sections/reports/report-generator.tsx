'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  PictureAsPdf,
  TableChart,
  Description,
  CalendarMonth,
  Settings,
} from '@mui/icons-material';
import type { ReportTemplate, ReportFormat, GenerateReportRequest } from '@/types/report';
import { generateReport } from '@/lib/api/reports';
import { toast } from 'sonner';

interface ReportGeneratorProps {
  open: boolean;
  template: ReportTemplate | null;
  onClose: () => void;
  onReportGenerated: () => void;
}

const formatIcons: Record<ReportFormat, React.ReactNode> = {
  pdf: <PictureAsPdf sx={{ fontSize: 20 }} />,
  csv: <TableChart sx={{ fontSize: 20 }} />,
  excel: <Description sx={{ fontSize: 20 }} />,
};

const formatColors: Record<ReportFormat, string> = {
  pdf: '#F44336',
  csv: '#4CAF50',
  excel: '#2196F3',
};

export default function ReportGenerator({
  open,
  template,
  onClose,
  onReportGenerated,
}: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportName, setReportName] = useState('');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleClose = () => {
    if (!loading) {
      setReportName('');
      setFormat('pdf');
      setStartDate(new Date());
      setEndDate(new Date());
      setError(null);
      onClose();
    }
  };

  const handleGenerate = async () => {
    if (!template) return;

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: GenerateReportRequest = {
        templateId: template.id,
        name: reportName || undefined,
        format,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };

      const report = await generateReport(request);

      toast.success('Report generated successfully!', {
        description: `${report.name} is ready for download`,
      });

      onReportGenerated();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast.error('Failed to generate report', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuickDateRanges = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return [
      { label: 'Today', start: today, end: today },
      { label: 'Yesterday', start: yesterday, end: yesterday },
      { label: 'Last 7 Days', start: lastWeekStart, end: today },
      { label: 'Last 30 Days', start: lastMonthStart, end: today },
      { label: 'This Month', start: thisMonthStart, end: today },
    ];
  };

  const applyQuickRange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: template.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Description />
          </Box>
          <Box>
            <Typography variant="h6">Generate Report</Typography>
            <Typography variant="body2" color="text.secondary">
              {template.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Report Name (Optional)"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder={`${template.name} - Custom Name`}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonth fontSize="small" />
                Date Range
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getQuickDateRanges().map((range) => (
                  <Chip
                    key={range.label}
                    label={range.label}
                    size="small"
                    onClick={() => applyQuickRange(range.start, range.end)}
                    disabled={loading}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mb: 3 }} disabled={loading}>
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings fontSize="small" />
                Export Format
              </Box>
            </InputLabel>
            <Select value={format} onChange={(e) => setFormat(e.target.value as ReportFormat)} label="Export Format">
              <MenuItem value="pdf">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: formatColors.pdf }}>{formatIcons.pdf}</Box>
                  <Box>
                    <Typography variant="body2">PDF Document</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for viewing and printing
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="csv">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: formatColors.csv }}>{formatIcons.csv}</Box>
                  <Box>
                    <Typography variant="body2">CSV File</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for data analysis
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="excel">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: formatColors.excel }}>{formatIcons.excel}</Box>
                  <Box>
                    <Typography variant="body2">Excel Spreadsheet</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best for detailed analysis
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" icon={<Description />}>
            <Typography variant="body2">
              <strong>Report includes:</strong>
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              {template.fields.join(', ')}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !startDate || !endDate}
          startIcon={loading ? <CircularProgress size={20} /> : formatIcons[format]}
          sx={{
            bgcolor: template.color,
            '&:hover': {
              bgcolor: template.color,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
