import { Chip } from '@heroui/react';

interface StatusBadgeProps {
  status: string;
}

const getColorByStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'success':
      return 'success';
    case 'rejected':
    case 'failed':
    case 'error':
      return 'danger';
    case 'pending':
    case 'under_review':
    case 'submitted':
    case 'warning':
      return 'warning';
    case 'draft':
    case 'info':
      return 'default';
    default:
      return 'default';
  }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Chip color={getColorByStatus(status)} variant="soft" className="capitalize">
      {status?.replace(/_/g, ' ')}
    </Chip>
  );
};