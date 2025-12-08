'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Download,
  Delete,
  MoreVert,
  PictureAsPdf,
  TableChart,
  Description,
  CheckCircle,
  Error,
  HourglassEmpty,
} from '@mui/icons-material';
import type { Report, ReportFormat, ReportStatus } from '@/types/report';
import { getReports, downloadReport, deleteReport } from '@/lib/api/reports';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ReportHistoryProps {
  onRefresh?: number;
}

const formatIcons: Record<ReportFormat, React.ReactNode> = {
  pdf: <PictureAsPdf sx={{ fontSize: 16 }} />,
  csv: <TableChart sx={{ fontSize: 16 }} />,
  excel: <Description sx={{ fontSize: 16 }} />,
};

const formatColors: Record<ReportFormat, string> = {
  pdf: '#F44336',
  csv: '#4CAF50',
  excel: '#2196F3',
};

const statusIcons: Record<ReportStatus, React.ReactNode> = {
  completed: <CheckCircle sx={{ fontSize: 16 }} />,
  failed: <Error sx={{ fontSize: 16 }} />,
  processing: <HourglassEmpty sx={{ fontSize: 16 }} />,
  pending: <HourglassEmpty sx={{ fontSize: 16 }} />,
};

const statusColors: Record<ReportStatus, 'success' | 'error' | 'warning' | 'info'> = {
  completed: 'success',
  failed: 'error',
  processing: 'warning',
  pending: 'info',
};

export default function ReportHistory({ onRefresh }: ReportHistoryProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [page, rowsPerPage, onRefresh]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReports({
        page: page + 1,
        limit: rowsPerPage,
      });
      setReports(response.reports);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: Report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleDownload = async (report: Report) => {
    handleMenuClose();
    try {
      toast.loading('Preparing download...', { id: 'download' });
      const { url, filename } = await downloadReport(report._id);

      // In a real app, this would trigger an actual download
      // For now, we'll just show a success message
      toast.success('Download started', {
        id: 'download',
        description: filename,
      });

      // Refresh to update download count
      loadReports();
    } catch (err) {
      toast.error('Failed to download report', { id: 'download' });
      console.error('Error downloading report:', err);
    }
  };

  const handleDelete = async (report: Report) => {
    handleMenuClose();
    try {
      toast.loading('Deleting report...', { id: 'delete' });
      await deleteReport(report._id);
      toast.success('Report deleted successfully', { id: 'delete' });
      loadReports();
    } catch (err) {
      toast.error('Failed to delete report', { id: 'delete' });
      console.error('Error deleting report:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const getReportTypeLabel = (type: string): string => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading && reports.length === 0) {
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
        Report History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Downloads</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No reports generated yet</Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {report.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {report.generatedBy.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getReportTypeLabel(report.type)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={new Date(report.generatedAt).toLocaleString()}>
                      <Typography variant="body2">
                        {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={formatIcons[report.format] as any}
                      label={report.format.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: `${formatColors[report.format]}15`,
                        color: formatColors[report.format],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={statusIcons[report.status] as any}
                      label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      size="small"
                      color={statusColors[report.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatFileSize(report.fileSize)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{report.downloadCount}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, report)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => selectedReport && handleDownload(selectedReport)}
          disabled={selectedReport?.status !== 'completed'}
        >
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedReport && handleDelete(selectedReport)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
