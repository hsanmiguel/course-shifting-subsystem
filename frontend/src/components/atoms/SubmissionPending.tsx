import { Card } from '@heroui/react';
import { Clock } from 'lucide-react';

interface SubmissionPendingProps {
  message?: string;
}

export const SubmissionPending = ({
  message = 'Your application is being processed...',
}: SubmissionPendingProps) => {
  return (
    <Card className="border-l-4 border-l-amber-500 rounded-md bg-amber-50 shadow-sm">
      <Card.Content className="gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-100 p-3 text-amber-600 animate-pulse">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Submission in Progress</h3>
            <p className="mt-1 text-sm text-amber-800">{message}</p>
            <p className="mt-3 text-xs text-amber-700">
              Please wait while we process your application. Do not refresh the page.
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
