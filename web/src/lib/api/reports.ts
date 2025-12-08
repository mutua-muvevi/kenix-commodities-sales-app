import type {
  Report,
  ReportTemplate,
  GenerateReportRequest,
  ReportsResponse,
  GetReportsParams,
  ReportStats,
} from '@/types/report';
import { _reports, REPORT_TEMPLATES, getReportStats } from '@/_mock/_reports';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock storage for reports (in real app, this would be API calls)
let mockReports = [..._reports];
let nextReportId = 16;

/**
 * Get all reports with optional filtering and pagination
 */
export async function getReports(params?: GetReportsParams): Promise<ReportsResponse> {
  await delay(500);

  let filteredReports = [...mockReports];

  // Apply filters
  if (params?.type) {
    filteredReports = filteredReports.filter((r) => r.type === params.type);
  }

  if (params?.status) {
    filteredReports = filteredReports.filter((r) => r.status === params.status);
  }

  if (params?.format) {
    filteredReports = filteredReports.filter((r) => r.format === params.format);
  }

  if (params?.dateFrom) {
    filteredReports = filteredReports.filter(
      (r) => new Date(r.generatedAt) >= new Date(params.dateFrom!)
    );
  }

  if (params?.dateTo) {
    filteredReports = filteredReports.filter(
      (r) => new Date(r.generatedAt) <= new Date(params.dateTo!)
    );
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredReports = filteredReports.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.type.toLowerCase().includes(searchLower) ||
        r.generatedBy.name.toLowerCase().includes(searchLower)
    );
  }

  // Sort by generated date (newest first)
  filteredReports.sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  return {
    reports: paginatedReports,
    total: filteredReports.length,
    page,
    limit,
  };
}

/**
 * Get a single report by ID
 */
export async function getReport(id: string): Promise<Report | null> {
  await delay(300);

  const report = mockReports.find((r) => r._id === id);
  return report || null;
}

/**
 * Get all available report templates
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  await delay(200);
  return REPORT_TEMPLATES;
}

/**
 * Generate a new report
 */
export async function generateReport(request: GenerateReportRequest): Promise<Report> {
  // Simulate longer processing time for report generation
  await delay(2000);

  const template = REPORT_TEMPLATES.find((t) => t.id === request.templateId);
  if (!template) {
    throw new Error('Report template not found');
  }

  // Format date range for report name
  const startDate = new Date(request.dateRange.start);
  const endDate = new Date(request.dateRange.end);
  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const dateRangeStr =
    startDate.toDateString() === endDate.toDateString()
      ? formatDate(startDate)
      : `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Create new report
  const newReport: Report = {
    _id: `rep_${String(nextReportId).padStart(3, '0')}`,
    name: request.name || `${template.name} - ${dateRangeStr}`,
    type: template.type,
    generatedAt: new Date(),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: request.format,
    status: 'completed',
    downloadCount: 0,
    fileSize: Math.floor(Math.random() * 3000000) + 500000, // Random size between 500KB and 3.5MB
    filePath: `/reports/${template.type}-${Date.now()}.${request.format}`,
    filters: {
      dateRange: request.dateRange,
      additionalFilters: request.additionalFilters,
    },
  };

  nextReportId++;
  mockReports.unshift(newReport);

  return newReport;
}

/**
 * Download a report
 */
export async function downloadReport(id: string): Promise<{ url: string; filename: string }> {
  await delay(500);

  const report = mockReports.find((r) => r._id === id);
  if (!report) {
    throw new Error('Report not found');
  }

  // Increment download count
  report.downloadCount++;

  // In a real app, this would return a signed URL or trigger a download
  // For now, we'll return mock data
  return {
    url: report.filePath || `/reports/${report._id}.${report.format}`,
    filename: `${report.name}.${report.format}`,
  };
}

/**
 * Delete a report
 */
export async function deleteReport(id: string): Promise<void> {
  await delay(300);

  const index = mockReports.findIndex((r) => r._id === id);
  if (index === -1) {
    throw new Error('Report not found');
  }

  mockReports.splice(index, 1);
}

/**
 * Get report statistics
 */
export async function getReportStatistics(): Promise<ReportStats> {
  await delay(400);
  return getReportStats();
}

/**
 * Schedule a report for recurring generation
 * (Future feature - placeholder for now)
 */
export async function scheduleReport(
  templateId: string,
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    format: 'pdf' | 'csv' | 'excel';
  }
): Promise<{ success: boolean; scheduleId: string }> {
  await delay(500);

  // Mock implementation
  return {
    success: true,
    scheduleId: `schedule_${Date.now()}`,
  };
}

/**
 * Export multiple reports as a batch
 * (Future feature - placeholder for now)
 */
export async function batchExportReports(reportIds: string[]): Promise<{ batchId: string }> {
  await delay(1000);

  // Mock implementation
  return {
    batchId: `batch_${Date.now()}`,
  };
}
