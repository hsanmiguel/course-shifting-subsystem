import { useEffect, useMemo, useState } from 'react';
import { Button, Card, TextArea } from '@heroui/react';
import { AlertTriangle, ArrowRight, Check, Clock3, ShieldCheck } from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AdminApplication } from '@/types';
import { authService } from '@/services/auth';
import { getAdminApplications, mockAdminApplications } from './api';

export default function AllApplications() {
  const [applications, setApplications] = useState<AdminApplication[]>(mockAdminApplications);
  const [selectedId, setSelectedId] = useState(mockAdminApplications[0]?.id);
  const currentUser = authService.getCurrentUser();
  const displayName = currentUser?.name || 'System Administrator';
  const displayId = currentUser?.id || 'ADM-2021-00001';
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedId) ?? applications[0],
    [applications, selectedId],
  );

  useEffect(() => {
    getAdminApplications().then((data) => {
      setApplications(data);
      setSelectedId((current) => current ?? data[0]?.id);
    });
  }, []);

  return (
    <SidebarLayout
      title="Pending Applications"
      subtitle={`${applications.length} awaiting review`}
      userRole="admin"
      userName={displayName}
      studentId={displayId}
    >
      <div className="grid min-h-[calc(100vh-12rem)] gap-6 xl:grid-cols-[20rem_1fr]">
        <Card className="h-fit overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="font-semibold text-slate-950">All Applications</p>
              <p className="mt-1 text-sm text-slate-500">{applications.length} records from admin endpoint</p>
            </div>
            <div className="divide-y divide-slate-200">
              {applications.map((application) => (
                <button
                  key={application.id}
                  className={`w-full border-l-2 px-5 py-4 text-left transition ${
                    application.id === selectedApplication?.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-transparent bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedId(application.id)}
                >
                  <p className="font-semibold text-slate-950">{application.studentName}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {application.currentProgram} &gt; {application.targetProgram}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{application.submittedAt}</p>
                </button>
              ))}
            </div>
          </Card.Content>
        </Card>

        {selectedApplication && (
          <div className="space-y-6">
            {selectedApplication.slaWarning && (
              <Card className="rounded-md border-l-4 border-l-amber-500 border-y-amber-100 border-r-amber-100 bg-amber-50 shadow-sm">
                <Card.Content className="gap-4 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-900">{selectedApplication.slaWarning.title}</p>
                        <div className="mt-3 grid gap-4 text-sm text-amber-800 md:grid-cols-2">
                          <p>Hours Pending<br /><span className="font-semibold">{selectedApplication.slaWarning.hoursPending} hours</span></p>
                          <p>Assigned To<br /><span className="font-semibold">{selectedApplication.slaWarning.assignedTo}</span></p>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status="warning" />
                  </div>
                  <div className="rounded-md bg-white/80 p-4 text-sm text-amber-900">
                    <p>{selectedApplication.slaWarning.message}</p>
                    <p className="mt-2">Escalation scheduled at 72 hours to registrar_admin</p>
                  </div>
                  <p className="text-xs text-amber-700">{selectedApplication.slaWarning.timestamp}</p>
                </Card.Content>
              </Card>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">{selectedApplication.studentName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Student ID: {selectedApplication.studentId} | Application ID: {selectedApplication.id}
                </p>
              </div>
              <StatusBadge status={selectedApplication.status} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-5">
                  <p className="text-sm font-medium text-slate-500">Program Transfer</p>
                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Current</p>
                      <p className="font-semibold text-slate-950">{selectedApplication.currentProgram}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="font-semibold text-slate-950">{selectedApplication.targetProgram}</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-5">
                  <p className="text-sm font-medium text-slate-500">Academic Standing</p>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">GWA</p>
                      <p className="font-semibold text-slate-950">{selectedApplication.gwa}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Units</p>
                      <p className="font-semibold text-slate-950">{selectedApplication.units}</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="gap-4 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                  <p className="font-semibold text-slate-950">Eligibility Check</p>
                </div>
                <div className="space-y-3">
                  {selectedApplication.eligibilityChecks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-4 text-sm text-slate-700">
                      <span>{check.label}</span>
                      <span className="rounded-full bg-emerald-100 p-1 text-emerald-700">
                        <Check className="h-4 w-4" />
                      </span>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="p-5">
                <p className="font-semibold text-slate-950">Reason for Shifting</p>
                <p className="mt-4 text-sm leading-6 text-slate-700">{selectedApplication.reason}</p>
              </Card.Content>
            </Card>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="gap-4 p-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-slate-600" />
                  <p className="font-semibold text-slate-950">Reviewer Remarks</p>
                </div>
                <TextArea
                  aria-label="Reviewer remarks"
                  placeholder="Add notes or conditions for this application..."
                  defaultValue={selectedApplication.reviewerRemarks ?? ''}
                />
                <div className="flex flex-wrap justify-end gap-3">
                  <Button variant="secondary">Escalate</Button>
                  <Button variant="secondary">Reject</Button>
                  <Button variant="primary">Approve</Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
