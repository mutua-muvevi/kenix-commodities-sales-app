import type { Report, ReportTemplate } from './types/report';

// Mock report templates
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily-sales',
    name: 'Daily Sales Report',
    description: 'Comprehensive daily sales analytics including revenue, transactions, and trends',
    type: 'daily-sales',
    fields: ['date', 'revenue', 'transactions', 'averageOrderValue', 'topProducts'],
    icon: 'calendar',
    color: '#2196F3',
  },
  {
    id: 'rider-performance',
    name: 'Rider Performance Report',
    description: 'Detailed performance metrics for delivery riders including deliveries, ratings, and efficiency',
    type: 'rider-performance',
    fields: ['riderId', 'deliveries', 'rating', 'onTimeRate', 'earnings'],
    icon: 'motorcycle',
    color: '#4CAF50',
  },
  {
    id: 'agent-performance',
    name: 'Sales Agent Performance',
    description: 'Agent productivity report with sales figures, customer interactions, and conversion rates',
    type: 'agent-performance',
    fields: ['agentId', 'sales', 'customers', 'conversionRate', 'commission'],
    icon: 'people',
    color: '#FF9800',
  },
  {
    id: 'financial',
    name: 'Financial Report',
    description: 'Complete financial overview including income, expenses, profit margins, and cash flow',
    type: 'financial',
    fields: ['revenue', 'expenses', 'profit', 'cashFlow', 'payables', 'receivables'],
    icon: 'money',
    color: '#9C27B0',
  },
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Stock levels, inventory turnover, low stock alerts, and reorder recommendations',
    type: 'inventory',
    fields: ['productId', 'stockLevel', 'turnoverRate', 'reorderPoint', 'value'],
    icon: 'inventory',
    color: '#F44336',
  },
  {
    id: 'delivery',
    name: 'Delivery Report',
    description: 'Delivery performance metrics including delivery times, success rates, and geographic analysis',
    type: 'delivery',
    fields: ['deliveryId', 'status', 'duration', 'distance', 'zone', 'cost'],
    icon: 'localShipping',
    color: '#00BCD4',
  },
];

// Mock generated reports
export const _reports: Report[] = [
  {
    _id: 'rep_001',
    name: 'Daily Sales Report - Dec 07, 2025',
    type: 'daily-sales',
    generatedAt: new Date('2025-12-07T23:45:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 12,
    fileSize: 2456789,
    filePath: '/reports/daily-sales-2025-12-07.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-12-07T00:00:00'),
        end: new Date('2025-12-07T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_002',
    name: 'Rider Performance Report - November 2025',
    type: 'rider-performance',
    generatedAt: new Date('2025-12-06T18:30:00'),
    generatedBy: {
      _id: 'admin_002',
      name: 'Sarah Manager',
      email: 'sarah@kenixcommodities.com',
    },
    format: 'excel',
    status: 'completed',
    downloadCount: 8,
    fileSize: 1876543,
    filePath: '/reports/rider-performance-nov-2025.xlsx',
    filters: {
      dateRange: {
        start: new Date('2025-11-01T00:00:00'),
        end: new Date('2025-11-30T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_003',
    name: 'Financial Report - Q4 2025',
    type: 'financial',
    generatedAt: new Date('2025-12-06T14:20:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 15,
    fileSize: 3245678,
    filePath: '/reports/financial-q4-2025.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-10-01T00:00:00'),
        end: new Date('2025-12-31T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_004',
    name: 'Inventory Report - Dec 06, 2025',
    type: 'inventory',
    generatedAt: new Date('2025-12-06T10:15:00'),
    generatedBy: {
      _id: 'admin_003',
      name: 'Mike Inventory',
      email: 'mike@kenixcommodities.com',
    },
    format: 'csv',
    status: 'completed',
    downloadCount: 5,
    fileSize: 987654,
    filePath: '/reports/inventory-2025-12-06.csv',
    filters: {
      dateRange: {
        start: new Date('2025-12-06T00:00:00'),
        end: new Date('2025-12-06T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_005',
    name: 'Sales Agent Performance - November 2025',
    type: 'agent-performance',
    generatedAt: new Date('2025-12-05T16:45:00'),
    generatedBy: {
      _id: 'admin_002',
      name: 'Sarah Manager',
      email: 'sarah@kenixcommodities.com',
    },
    format: 'excel',
    status: 'completed',
    downloadCount: 10,
    fileSize: 2134567,
    filePath: '/reports/agent-performance-nov-2025.xlsx',
    filters: {
      dateRange: {
        start: new Date('2025-11-01T00:00:00'),
        end: new Date('2025-11-30T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_006',
    name: 'Delivery Report - Week 48',
    type: 'delivery',
    generatedAt: new Date('2025-12-05T12:30:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 7,
    fileSize: 1654321,
    filePath: '/reports/delivery-week-48.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-11-25T00:00:00'),
        end: new Date('2025-12-01T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_007',
    name: 'Daily Sales Report - Dec 04, 2025',
    type: 'daily-sales',
    generatedAt: new Date('2025-12-04T23:50:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 6,
    fileSize: 2398765,
    filePath: '/reports/daily-sales-2025-12-04.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-12-04T00:00:00'),
        end: new Date('2025-12-04T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_008',
    name: 'Rider Performance Report - Week 48',
    type: 'rider-performance',
    generatedAt: new Date('2025-12-04T15:20:00'),
    generatedBy: {
      _id: 'admin_002',
      name: 'Sarah Manager',
      email: 'sarah@kenixcommodities.com',
    },
    format: 'csv',
    status: 'completed',
    downloadCount: 4,
    fileSize: 876543,
    filePath: '/reports/rider-performance-week-48.csv',
    filters: {
      dateRange: {
        start: new Date('2025-11-25T00:00:00'),
        end: new Date('2025-12-01T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_009',
    name: 'Financial Report - November 2025',
    type: 'financial',
    generatedAt: new Date('2025-12-03T11:10:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'excel',
    status: 'completed',
    downloadCount: 18,
    fileSize: 3456789,
    filePath: '/reports/financial-nov-2025.xlsx',
    filters: {
      dateRange: {
        start: new Date('2025-11-01T00:00:00'),
        end: new Date('2025-11-30T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_010',
    name: 'Inventory Report - Low Stock Alert',
    type: 'inventory',
    generatedAt: new Date('2025-12-02T09:30:00'),
    generatedBy: {
      _id: 'admin_003',
      name: 'Mike Inventory',
      email: 'mike@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 11,
    fileSize: 1234567,
    filePath: '/reports/inventory-low-stock.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-12-02T00:00:00'),
        end: new Date('2025-12-02T23:59:59'),
      },
      additionalFilters: {
        lowStock: true,
      },
    },
  },
  {
    _id: 'rep_011',
    name: 'Sales Agent Performance - October 2025',
    type: 'agent-performance',
    generatedAt: new Date('2025-12-01T14:45:00'),
    generatedBy: {
      _id: 'admin_002',
      name: 'Sarah Manager',
      email: 'sarah@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 9,
    fileSize: 2098765,
    filePath: '/reports/agent-performance-oct-2025.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-10-01T00:00:00'),
        end: new Date('2025-10-31T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_012',
    name: 'Delivery Report - November 2025',
    type: 'delivery',
    generatedAt: new Date('2025-11-30T17:20:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'excel',
    status: 'completed',
    downloadCount: 13,
    fileSize: 2765432,
    filePath: '/reports/delivery-nov-2025.xlsx',
    filters: {
      dateRange: {
        start: new Date('2025-11-01T00:00:00'),
        end: new Date('2025-11-30T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_013',
    name: 'Daily Sales Report - Nov 29, 2025',
    type: 'daily-sales',
    generatedAt: new Date('2025-11-29T23:55:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'csv',
    status: 'completed',
    downloadCount: 3,
    fileSize: 1876543,
    filePath: '/reports/daily-sales-2025-11-29.csv',
    filters: {
      dateRange: {
        start: new Date('2025-11-29T00:00:00'),
        end: new Date('2025-11-29T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_014',
    name: 'Rider Performance Report - October 2025',
    type: 'rider-performance',
    generatedAt: new Date('2025-11-28T13:15:00'),
    generatedBy: {
      _id: 'admin_002',
      name: 'Sarah Manager',
      email: 'sarah@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 14,
    fileSize: 2456789,
    filePath: '/reports/rider-performance-oct-2025.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-10-01T00:00:00'),
        end: new Date('2025-10-31T23:59:59'),
      },
    },
  },
  {
    _id: 'rep_015',
    name: 'Financial Report - Q3 2025',
    type: 'financial',
    generatedAt: new Date('2025-11-27T10:00:00'),
    generatedBy: {
      _id: 'admin_001',
      name: 'John Admin',
      email: 'john@kenixcommodities.com',
    },
    format: 'pdf',
    status: 'completed',
    downloadCount: 22,
    fileSize: 3987654,
    filePath: '/reports/financial-q3-2025.pdf',
    filters: {
      dateRange: {
        start: new Date('2025-07-01T00:00:00'),
        end: new Date('2025-09-30T23:59:59'),
      },
    },
  },
];

// Helper function to get report statistics
export function getReportStats() {
  const totalReports = _reports.length;
  const totalDownloads = _reports.reduce((sum, report) => sum + report.downloadCount, 0);
  const totalSize = _reports.reduce((sum, report) => sum + report.fileSize, 0);

  const reportsByType = _reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportsByFormat = _reports.reduce((acc, report) => {
    acc[report.format] = (acc[report.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportsByStatus = _reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentReports = [..._reports]
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, 5);

  const mostDownloaded = [..._reports]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  return {
    totalReports,
    totalDownloads,
    totalSize,
    reportsByType,
    reportsByFormat,
    reportsByStatus,
    recentReports,
    mostDownloaded,
    averageDownloads: totalDownloads / totalReports,
    averageSize: totalSize / totalReports,
  };
}
