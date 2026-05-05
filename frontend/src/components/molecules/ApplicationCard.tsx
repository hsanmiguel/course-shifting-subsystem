import { Card, Button } from '@heroui/react';
import { CalendarDays, Eye, FileText } from 'lucide-react';
import { ShiftingApplication } from '@/types';
import { StatusBadge } from '@/components/atoms/StatusBadge';

interface ApplicationCardProps {
  application: ShiftingApplication;
  onView?: (app: ShiftingApplication) => void;
}

export const ApplicationCard = ({
  application,
  onView,
}: ApplicationCardProps) => {
  const submittedAt = new Date(application.submitted_at).toLocaleDateString();

  return (
    <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
      <Card.Content className="gap-5 p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-950">Course Shifting Request</p>
                <p className="text-sm text-slate-500">{application.application_id} - {application.student_id}</p>
              </div>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student</p>
            <p className="mt-2 font-semibold text-slate-950">{application.student_name}</p>
            <p className="text-sm text-slate-600">{application.student_id}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Program</p>
            <p className="mt-2 font-medium text-slate-950">{application.current_program}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target Program</p>
            <p className="mt-2 font-medium text-slate-950">{application.target_program}</p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{application.reason_for_shifting}</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Submitted {submittedAt}
            </span>
            {application.decision_at && <div>Decision {new Date(application.decision_at).toLocaleDateString()}</div>}
          </div>
          {onView && (
            <Button size="sm" variant="primary" onPress={() => onView(application)}>
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};
