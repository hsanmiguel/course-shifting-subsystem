import { Card } from '@heroui/react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
}

export const StatCard = ({
  title,
  value,
  description,
  icon,
}: StatCardProps) => {
  return (
    <Card className="rounded-md border border-slate-200 bg-slate-900 text-white shadow-sm">
      <Card.Content className="gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              {title}
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {value}
            </p>
            {description && (
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            )}
          </div>
          {icon && (
            <div className="rounded-md border border-white/10 bg-white/10 p-3 text-slate-100">
              {icon}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};
