import { Card } from '@heroui/react';
import { CheckCircle2 } from 'lucide-react';

interface SubmissionSuccessProps {
  applicationId?: string;
  studentName?: string;
  onDismiss?: () => void;
}

export const SubmissionSuccess = ({
  applicationId,
  studentName,
  onDismiss,
}: SubmissionSuccessProps) => {
  return (
    <Card className="border-l-4 border-l-green-500 rounded-md bg-green-50 shadow-sm">
      <Card.Content className="gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Application Submitted Successfully!</h3>
            <p className="mt-1 text-sm text-green-800">
              Your course shifting application has been submitted and is now under review.
            </p>
            {applicationId && (
              <p className="mt-3 text-xs font-mono text-green-700">
                Reference ID: <span className="font-semibold">{applicationId}</span>
              </p>
            )}
            {studentName && (
              <p className="mt-2 text-sm text-green-800">
                Submitted for: <span className="font-semibold">{studentName}</span>
              </p>
            )}
            <p className="mt-4 text-xs text-green-700">
              You can track the status of your application on your dashboard.
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-green-600 hover:text-green-700"
            >
              ✕
            </button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};
