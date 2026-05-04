import { Card, Button } from '@heroui/react';
import { ArrowRight, CalendarDays, FileText, Lock } from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';

const activeRequest = {
  id: 'CSR-2024-001',
  currentCourse: 'BS Computer Science',
  desiredCourse: 'BS Information Technology',
  status: 'under_review',
  submittedDate: '2024-02-01',
  lastUpdated: '2024-02-05',
  reviewer: 'College Registrar',
  reason:
    'I want to align my program with software implementation, networking, and systems administration career goals.',
};

export default function Applications() {
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

        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="gap-6 p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-slate-100 p-3 text-slate-700">
                  <FileText className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xl font-semibold text-slate-950">Course Shifting Request</p>
                  <p className="mt-1 text-sm text-slate-500">{activeRequest.id}</p>
                </div>
              </div>
              <StatusBadge status={activeRequest.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Course</p>
                <p className="mt-2 font-semibold text-slate-950">{activeRequest.currentCourse}</p>
              </div>
              <div className="hidden text-slate-400 md:block">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desired Course</p>
                <p className="mt-2 font-semibold text-slate-950">{activeRequest.desiredCourse}</p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{activeRequest.reason}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</p>
                <p className="mt-2 flex items-center gap-2 font-medium text-slate-900">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {activeRequest.submittedDate}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-2 font-medium text-slate-900">{activeRequest.lastUpdated}</p>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviewer</p>
                <p className="mt-2 font-medium text-slate-900">{activeRequest.reviewer}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="rounded-md border border-slate-200 bg-slate-900 text-white shadow-sm">
          <Card.Content className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-slate-300" />
                <div>
                  <p className="font-semibold">New request locked</p>
                  <p className="mt-1 text-sm text-slate-300">
                    You can submit another request after this one is approved, rejected, or withdrawn.
                  </p>
                </div>
              </div>
              <Button variant="secondary" isDisabled>
                Start New Request
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </SidebarLayout>
  );
}
