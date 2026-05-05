import { Card, Chip } from '@heroui/react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface SubmissionStatusProps {
  status: 'success' | 'pending' | 'error';
  title: string;
  message: string;
  applicationId?: string;
  timestamp?: string;
  details?: React.ReactNode;
}

export const SubmissionStatus = ({
  status,
  title,
  message,
  applicationId,
  timestamp,
  details,
}: SubmissionStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500',
          textColor: 'text-green-900',
          accentBg: 'bg-green-100',
          accentText: 'text-green-600',
          chipColor: 'success' as const,
        };
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-amber-50',
          borderColor: 'border-l-amber-500',
          textColor: 'text-amber-900',
          accentBg: 'bg-amber-100',
          accentText: 'text-amber-600',
          chipColor: 'warning' as const,
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500',
          textColor: 'text-red-900',
          accentBg: 'bg-red-100',
          accentText: 'text-red-600',
          chipColor: 'danger' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.borderColor} rounded-md ${config.bgColor} shadow-sm`}>
      <Card.Content className="gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className={`rounded-full ${config.accentBg} p-3 ${config.accentText}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${config.textColor}`}>{title}</h3>
              <Chip color={config.chipColor} variant="soft" size="sm" className="capitalize">
                {status}
              </Chip>
            </div>
            <p className={`mt-1 text-sm ${config.textColor.replace('900', '800')}`}>
              {message}
            </p>

            {applicationId && (
              <p className="mt-3 text-xs font-mono text-slate-600">
                ID: <span className="font-semibold">{applicationId}</span>
              </p>
            )}

            {timestamp && (
              <p className="mt-2 text-xs text-slate-600">
                {timestamp}
              </p>
            )}

            {details && (
              <div className="mt-3 text-sm">
                {details}
              </div>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
