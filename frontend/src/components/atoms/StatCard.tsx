import { Card } from '@heroui/react';

interface StatCardProps {
  title: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const colorConfig = {
  primary: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-700',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    value: 'text-green-700',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    value: 'text-amber-700',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'text-red-600',
    value: 'text-red-700',
  },
};

export const StatCard = ({
  title,
  value,
  color = 'primary',
  icon,
}: StatCardProps) => {
  const config = colorConfig[color];

  return (
    <Card className={`${config.bg} border-2 ${config.border} shadow-md hover:shadow-lg transition-shadow`}>
      <Card.Content className="gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className={`text-4xl font-bold ${config.value}`}>
              {value}
            </p>
          </div>
          {icon && (
            <div className={`text-4xl ${config.icon} bg-white rounded-lg p-3`}>
              {icon}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};