// Report types
export type ReportType =
  | 'daily-sales'
  | 'rider-performance'
  | 'agent-performance'
  | 'financial'
  | 'inventory'
  | 'delivery'
  | 'loan';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ReportFormat = 'pdf' | 'csv' | 'excel';

// User information
export interface ReportUser {
  _id: string;
  name: string;
  email: string;
}

// Date range for filtering
export interface DateRange {
  start: Date;
  end: Date;
}

// Report filters
export interface ReportFilters {
  dateRange?: DateRange;
  additionalFilters?: Record<string, any>;
}

// Main report interface
export interface Report {
  _id: string;
  name: string;
  type: ReportType;
  generatedAt: Date;
  generatedBy: ReportUser;
  format: ReportFormat;
  status: ReportStatus;
  downloadCount: number;
  fileSize: number;
  filePath?: string;
  filters?: ReportFilters;
  error?: string;
}

// Report template interface
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  fields: string[];
  icon: string;
  color: string;
}

// Request to generate a report
export interface GenerateReportRequest {
  templateId: string;
  name?: string;
  format: ReportFormat;
  dateRange: DateRange;
  additionalFilters?: Record<string, any>;
}

// Response from get reports endpoint
export interface ReportsResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
}

// Report statistics
export interface ReportStats {
  totalReports: number;
  totalDownloads: number;
  totalSize: number;
  reportsByType: Record<string, number>;
  reportsByFormat: Record<string, number>;
  reportsByStatus: Record<string, number>;
  recentReports: Report[];
  mostDownloaded: Report[];
  averageDownloads: number;
  averageSize: number;
}

// Query parameters for getting reports
export interface GetReportsParams {
  page?: number;
  limit?: number;
  type?: ReportType;
  status?: ReportStatus;
  format?: ReportFormat;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
