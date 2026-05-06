import { Card } from '@heroui/react';
import { CheckCircle2, X } from 'lucide-react';
import { ShiftingApplication } from '@/types';
import { formatProgramName } from '@/constants/programs';

interface SubmissionConfirmationDialogProps {
  isOpen: boolean;
  application?: ShiftingApplication;
  applicationId?: string;
  onClose: () => void;
  onGoToDashboard?: () => void;
}

export const SubmissionConfirmationDialog = ({
  isOpen,
  application,
  applicationId,
  onClose,

  onGoToDashboard,
}: SubmissionConfirmationDialogProps) => {
  if (!isOpen) return null;

  const refId = applicationId || application?.application_id || 'CSR-XXXX-XXXX';
  const studentName = application?.student_name || 'N/A';
  const currentProgram = application?.current_program ? formatProgramName(application.current_program) : 'N/A';
  const targetProgram = application?.target_program ? formatProgramName(application.target_program) : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl rounded-lg border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 border-b border-green-200 px-6 py-6 flex items-start gap-4">
          <div className="rounded-full bg-green-100 p-3 text-green-600 flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-green-900">
              Application Submitted Successfully!
            </h2>
            <p className="text-sm text-green-800 mt-1">
              Your course shifting request has been submitted and is now under review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-700 flex-shrink-0 mt-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 max-h-96 overflow-y-auto">
          {/* Reference ID */}
          <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Reference ID
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-slate-900">
              {refId}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Keep this ID for your records. You can use it to track your application.
            </p>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Student Name
              </p>
              <p className="mt-2 font-medium text-slate-900">{studentName}</p>
            </div>
            <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                From Program
              </p>
              <p className="mt-2 font-medium text-slate-900">{currentProgram}</p>
            </div>
            <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                To Program
              </p>
              <p className="mt-2 font-medium text-slate-900">{targetProgram}</p>
            </div>
          </div>

          {/* Information Box */}
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">What's next?</span>
              {' '}
              Your application will be reviewed by the department. You can track the status from your dashboard.
              We'll notify you when there's an update.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition"
          >
            Close
          </button>
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="flex-1 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
