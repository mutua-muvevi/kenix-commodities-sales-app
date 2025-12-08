import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'approval' | 'delivery' | 'route' | 'stock' | 'loan';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';

    switch (type) {
      case 'order':
        switch (normalizedStatus) {
          case 'completed':
            return { color: 'success' as const, label: 'Completed' };
          case 'processing':
            return { color: 'info' as const, label: 'Processing' };
          case 'pending':
            return { color: 'warning' as const, label: 'Pending' };
          case 'cancelled':
            return { color: 'error' as const, label: 'Cancelled' };
          default:
            return { color: 'default' as const, label: status };
        }

      case 'approval':
        switch (normalizedStatus) {
          case 'approved':
            return { color: 'success' as const, label: 'Approved' };
          case 'pending':
            return { color: 'warning' as const, label: 'Pending' };
          case 'rejected':
            return { color: 'error' as const, label: 'Rejected' };
          default:
            return { color: 'default' as const, label: status };
        }

      case 'delivery':
        switch (normalizedStatus) {
          case 'delivered':
            return { color: 'success' as const, label: 'Delivered' };
          case 'in_transit':
          case 'in transit':
            return { color: 'info' as const, label: 'In Transit' };
          case 'assigned':
            return { color: 'primary' as const, label: 'Assigned' };
          case 'pending':
            return { color: 'warning' as const, label: 'Pending' };
          case 'failed':
            return { color: 'error' as const, label: 'Failed' };
          default:
            return { color: 'default' as const, label: status };
        }

      case 'route':
        switch (normalizedStatus) {
          case 'completed':
            return { color: 'success' as const, label: 'Completed' };
          case 'in_progress':
          case 'in progress':
            return { color: 'info' as const, label: 'In Progress' };
          case 'active':
            return { color: 'primary' as const, label: 'Active' };
          case 'pending':
            return { color: 'warning' as const, label: 'Pending' };
          case 'cancelled':
            return { color: 'error' as const, label: 'Cancelled' };
          default:
            return { color: 'default' as const, label: status };
        }

      case 'stock':
        switch (normalizedStatus) {
          case 'in-stock':
          case 'in stock':
            return { color: 'success' as const, label: 'In Stock' };
          case 'low-stock':
          case 'low stock':
            return { color: 'warning' as const, label: 'Low Stock' };
          case 'out-of-stock':
          case 'out of stock':
            return { color: 'error' as const, label: 'Out of Stock' };
          default:
            return { color: 'default' as const, label: status };
        }

      case 'loan':
        switch (normalizedStatus) {
          case 'approved':
            return { color: 'success' as const, label: 'Approved' };
          case 'active':
            return { color: 'primary' as const, label: 'Active' };
          case 'completed':
            return { color: 'success' as const, label: 'Completed' };
          case 'pending':
            return { color: 'warning' as const, label: 'Pending' };
          case 'rejected':
            return { color: 'error' as const, label: 'Rejected' };
          case 'defaulted':
            return { color: 'error' as const, label: 'Defaulted' };
          default:
            return { color: 'default' as const, label: status };
        }

      default:
        return { color: 'default' as const, label: status };
    }
  };

  const config = getStatusConfig();

  return <Chip label={config.label} color={config.color} size="small" />;
}
