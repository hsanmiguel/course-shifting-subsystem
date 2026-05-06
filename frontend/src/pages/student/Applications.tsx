import { Card, Button, Spinner } from '@heroui/react';
import { ArrowRight, CalendarDays, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { useApplications } from '@/hooks';
import { authService } from '@/services/auth';
import { formatProgramName } from '@/constants/programs';

function formatDate(date?: string | null) {
  if (!date) return 'Not available';
  return new Date(date).toLocaleDateString();
}

export default function Applications() {
  const navigate = useNavigate();
  const studentId = authService.getCurrentUser()?.id || localStorage.getItem('studentId') || '';
  const { applications, loading, error } = useApplications(studentId);
  const activeRequest = applications[0] || null;
  const hasLockedRequest = activeRequest?.status === 'under_review' || activeRequest?.status === 'pending';

  return (
    <SidebarLayout title="My Request" userRole="student">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Course shifting</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Active Request</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Students can only keep one course shifting request in process. New submissions are locked while a request is pending.
          </p>
        </div>

        {!studentId && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">Please log in to view your request.</p>
          </Card>
        )}

        {loading && studentId && (
          <Card className="rounded-md border border-slate-200 bg-white p-8">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Spinner size="sm" />
              <span>Loading your request...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">Unable to load request</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </Card>
        )}

        {!loading && !error && studentId && !activeRequest && (
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">No course shifting request yet</p>
              <p className="mt-2 text-sm text-slate-500">Start a request when you are ready to change course.</p>
              <Button className="mt-5" variant="primary" onPress={() => navigate('/student/application-form')}>
                Start Request
              </Button>
            </Card.Content>
          </Card>
        )}

        {activeRequest && (
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-6 p-6">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-slate-100 p-3 text-slate-700">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xl font-semibold text-slate-950">Course Shifting Request</p>
                    <p className="mt-1 text-sm text-slate-500">{activeRequest.application_id}</p>
                  </div>
                </div>
                <StatusBadge status={activeRequest.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Course</p>
                  <p className="mt-2 font-semibold leading-6 text-slate-950">
                    {formatProgramName(activeRequest.current_program)}
                  </p>
                </div>
                <div className="hidden text-slate-400 md:block">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desired Course</p>
                  <p className="mt-2 font-semibold leading-6 text-slate-950">
                    {formatProgramName(activeRequest.target_program)}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeRequest.reason_for_shifting}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</p>
                  <p className="mt-2 flex items-center gap-2 font-medium text-slate-900">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {formatDate(activeRequest.submitted_at)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatDate(activeRequest.decision_at || activeRequest.submitted_at)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviewer</p>
                  <p className="mt-2 font-medium text-slate-900">{activeRequest.reviewed_by || 'Not assigned'}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {activeRequest && (
          <Card className="rounded-md border border-slate-200 bg-slate-900 text-white shadow-sm">
            <Card.Content className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 text-slate-300" />
                  <div>
                    <p className="font-semibold">{hasLockedRequest ? 'New request locked' : 'New request available'}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {hasLockedRequest
                        ? 'You can submit another request after this one is approved, rejected, or withdrawn.'
                        : 'Your current request is no longer pending.'}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" isDisabled={hasLockedRequest} onPress={() => navigate('/student/application-form')}>
                  Start New Request
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
