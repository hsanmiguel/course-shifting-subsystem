import { Card } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

interface SubmissionErrorProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
}

export const SubmissionError = ({
  message,
  details,
  onDismiss,
}: SubmissionErrorProps) => {
  return (
    <Card className="border-l-4 border-l-red-500 rounded-md bg-red-50 shadow-sm">
      <Card.Content className="gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Submission Failed</h3>
            <p className="mt-1 text-sm text-red-800">{message}</p>
            {details && (
              <p className="mt-2 text-xs text-red-700 bg-red-100/50 p-2 rounded">
                {details}
              </p>
            )}
            <p className="mt-3 text-xs text-red-700">
              Please check your information and try again. If the problem persists, contact support.
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};
