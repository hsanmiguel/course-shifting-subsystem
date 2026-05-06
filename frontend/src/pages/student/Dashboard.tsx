'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, Button, Input, Label, TextArea, Spinner } from '@heroui/react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  FilePenLine,
  FileText,
  MoveRight,
  X,
} from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ApplicationCard } from '@/components/molecules/ApplicationCard';
import { ShiftingApplication, CourseEquivalency } from '@/types';
import { useApplications } from '@/hooks';
import { apiClient } from '@/services/api-client';
import { formatProgramName } from '@/constants/programs';

export default function StudentDashboard() {
  const [selectedApp, setSelectedApp] = useState<ShiftingApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    currentCourses: '',
    desiredCourses: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get student ID from auth token or localStorage (you'll need to implement proper auth)
  const studentId = localStorage.getItem('studentId') || '';
  const { applications, stats, loading, error, refetch } = useApplications(studentId);
  const application = applications[0] || null;

  const hasPendingRequest = application?.status === 'under_review' || application?.status === 'pending';

  const reviewProgress = useMemo(() => {
    if (!application) return 'Not started';
    if (application.status === 'approved') return 'Approved';
    if (application.status === 'rejected') return 'Rejected';
    return 'In review';
  }, [application]);

  const handleViewApplication = (app: ShiftingApplication) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleNewApplication = () => {
    if (hasPendingRequest) return;

    setSelectedApp(null);
    setFormData({ currentCourses: '', desiredCourses: '', reason: '' });
    setShowModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!formData.currentCourses || !formData.desiredCourses || !formData.reason || !studentId) {
      setSubmitError('Please fill in all fields and ensure you are logged in');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await apiClient.submitApplication({
        student_id: studentId,
        student_name: localStorage.getItem('studentName') || 'Student',
        current_program: formData.currentCourses,
        target_program: formData.desiredCourses,
        reason_for_shifting: formData.reason,
      });

      setShowModal(false);
      setFormData({ currentCourses: '', desiredCourses: '', reason: '' });
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentId) {
    return (
      <SidebarLayout title="Student Dashboard">
        <div className="py-12 text-center">
          <p className="text-lg text-slate-500">Please log in to access the student dashboard.</p>
        </div>
      </SidebarLayout>
    );
  }

  if (loading) {
    return (
      <SidebarLayout title="Student Dashboard">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout title="Student Dashboard">
        <Card className="bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout title="Student Dashboard">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Request" value={application ? '1' : '0'} description={application?.application_id ?? 'No request on file'} icon={<FileText className="h-6 w-6" />} />
          <StatCard title="Review Status" value={reviewProgress} description={application ? 'Current workflow stage' : 'Ready for submission'} icon={<CalendarClock className="h-6 w-6" />} />
          <StatCard title="Total Applications" value={String(stats.total)} description="All submissions" icon={<CheckCircle2 className="h-6 w-6" />} />
          <StatCard title="Pending Items" value={String(stats.pending)} description="Awaiting review" icon={<ClipboardCheck className="h-6 w-6" />} />
        </div>

        {hasPendingRequest && (
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">A course shifting request is already pending.</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Multiple submissions are locked while your current request is under review.
                  </p>
                </div>
                <StatusBadge status={application?.status ?? 'pending'} />
              </div>
            </Card.Content>
          </Card>
        )}

        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="gap-6 p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Current Request</h2>
                <p className="mt-1 text-sm text-slate-500">One request record is shown for the student account.</p>
              </div>
              <Button size="sm" variant="secondary" onPress={handleNewApplication} isDisabled={hasPendingRequest}>
                <FilePenLine className="h-4 w-4" />
                Start New
              </Button>
            </div>

            {application ? (
              <ApplicationCard application={application} onView={handleViewApplication} />
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 p-8 text-center">
                <p className="font-semibold text-slate-900">No course shifting request yet</p>
                <p className="mt-2 text-sm text-slate-500">Start one request when you are ready to change course.</p>
              </div>
            )}
          </Card.Content>
        </Card>

        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Course Equivalencies</h2>
                <p className="mt-1 text-sm text-slate-500">Subjects aligned to the requested destination course.</p>
              </div>
              {selectedApp && (
                <EquivalencyTable applicationId={selectedApp.application_id} />
              )}
              {!selectedApp && (
                <div className="text-center p-4 text-slate-500">
                  Select an application to view course equivalencies
                </div>
              )}
            </Card.Content>
          </Card>

          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Updates for your current request.</p>
              </div>
              <div className="space-y-3">
                {application ? (
                  <div className="rounded-md border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">Request Updated</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Your request is currently {application.status.replace('_', ' ')}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-500">{application.submitted_at}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-slate-500">No activity yet</div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-blue-50 p-3 text-blue-700">
                  {selectedApp ? <FileText className="h-5 w-5" /> : <FilePenLine className="h-5 w-5" />}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {selectedApp ? 'Request Details' : 'New Course Shifting Request'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedApp?.application_id ?? 'Complete the required details to submit a request'}
                  </p>
                </div>
              </div>
              <Button
                aria-label="Close request details"
                className="h-9 w-9 shrink-0 rounded-full p-0"
                size="sm"
                variant="secondary"
                onPress={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-6">
              {selectedApp ? (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <GraduationCap className="h-4 w-4" />
                        Current Course
                      </div>
                      <p className="mt-3 text-base font-semibold leading-7 text-slate-950">
                        {formatProgramName(selectedApp.current_program)}
                      </p>
                    </div>
                    <div className="hidden items-center text-slate-400 md:flex">
                      <MoveRight className="h-5 w-5" />
                    </div>
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        <GraduationCap className="h-4 w-4" />
                        Desired Course
                      </div>
                      <p className="mt-3 text-base font-semibold leading-7 text-slate-950">
                        {formatProgramName(selectedApp.target_program)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="rounded-md border border-slate-200 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{selectedApp.reason_for_shifting}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 p-5 md:min-w-44">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <StatusBadge status={selectedApp.status} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="current-courses" className="font-semibold text-slate-900">Current Course</Label>
                    <Input
                      id="current-courses"
                      placeholder="e.g., BS Computer Science"
                      value={formData.currentCourses}
                      onChange={(e) => setFormData({ ...formData, currentCourses: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="desired-courses" className="font-semibold text-slate-900">Desired Course</Label>
                    <Input
                      id="desired-courses"
                      placeholder="e.g., BS Information Technology"
                      value={formData.desiredCourses}
                      onChange={(e) => setFormData({ ...formData, desiredCourses: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reason" className="font-semibold text-slate-900">Reason for Transfer</Label>
                    <TextArea
                      id="reason"
                      placeholder="Explain your reasons for transferring..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={4}
                    />
                  </div>
                  {submitError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              {!selectedApp && (
                <Button
                  variant="primary"
                  onPress={handleSubmitApplication}
                  isPending={isSubmitting}
                  className="flex-1"
                >
                  Submit Application
                </Button>
              )}
              <Button
                variant="secondary"
                onPress={() => setShowModal(false)}
                className="flex-1"
              >
                {selectedApp ? 'Done' : 'Close'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <EquivalencyTable applicationId={application?.application_id} />
    </SidebarLayout>
  );
}

// Helper component to display equivalencies
function EquivalencyTable({ applicationId }: { applicationId?: string }) {
  const [equivalencies, setEquivalencies] = useState<CourseEquivalency[]>([]);
  const [loading, setLoading] = useState(!!applicationId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    
    const fetchEquivalencies = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getEquivalency(applicationId);
        setEquivalencies(Array.isArray(data) ? data : (data.credited_subjects || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load equivalencies');
      } finally {
        setLoading(false);
      }
    };

    fetchEquivalencies();
  }, [applicationId]);

  if (!applicationId) return null;
  if (loading) return <Spinner size="sm" />;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="w-[18%] px-3 py-3 text-left font-semibold">Current Subject</th>
            <th className="w-[16%] px-3 py-3 text-left font-semibold">Current Code</th>
            <th className="w-[34%] px-3 py-3 text-left font-semibold">Equivalent Subject</th>
            <th className="w-[12%] px-3 py-3 text-center font-semibold">Credits</th>
            <th className="w-[20%] px-3 py-3 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {equivalencies.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                No course equivalencies found
              </td>
            </tr>
          ) : (
            equivalencies.map((eq, idx) => (
              <tr key={`${eq.subject_code}-${idx}`} className="bg-white">
                <td className="px-3 py-4 font-medium text-slate-950">{eq.subject_code}</td>
                <td className="px-3 py-4 font-mono text-slate-600">{eq.subject_code}</td>
                <td className="px-3 py-4 text-slate-700">{eq.equivalent_to}</td>
                <td className="px-3 py-4 text-center font-semibold text-slate-950">{eq.units}</td>
                <td className="px-3 py-4">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">{eq.status}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
