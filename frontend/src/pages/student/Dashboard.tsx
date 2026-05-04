'use client';

import { useMemo, useState } from 'react';
import { Card, Button, Input, Label, TextArea } from '@heroui/react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FilePenLine,
  FileText,
  Send,
  X,
} from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ApplicationCard } from '@/components/molecules/ApplicationCard';
import { ShiftingApplication, CourseEquivalency, Notification } from '@/types';

const activeApplication: ShiftingApplication = {
  id: 'CSR-2024-001',
  studentId: 'STU-2021-0001',
  studentName: 'John Doe',
  studentEmail: 'john@example.com',
  currentCourses: 'BS Computer Science',
  desiredCourses: 'BS Information Technology',
  reason: 'I want to align my program with software implementation, networking, and systems administration career goals.',
  status: 'under_review',
  createdAt: '2024-02-01',
  updatedAt: '2024-02-05',
  submittedAt: '2024-02-01',
};

const mockEquivalencies: CourseEquivalency[] = [
  {
    id: '1',
    currentSubject: 'CS101',
    currentSubjectCode: 'CS101',
    equivalentSubject: 'IT101',
    equivalentSubjectCode: 'IT101',
    credits: 3,
    status: 'approved',
  },
  {
    id: '2',
    currentSubject: 'MATH101',
    currentSubjectCode: 'MATH101',
    equivalentSubject: 'MATH101',
    equivalentSubjectCode: 'MATH101',
    credits: 4,
    status: 'pending',
  },
  {
    id: '3',
    currentSubject: 'CS102',
    currentSubjectCode: 'CS102',
    equivalentSubject: 'IT102',
    equivalentSubjectCode: 'IT102',
    credits: 3,
    status: 'approved',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Request Under Review',
    message: 'Your course shifting request is being reviewed by the department.',
    date: '2024-02-05',
  },
  {
    id: '2',
    type: 'success',
    title: 'Course Equivalency Updated',
    message: 'Two course equivalencies have been marked as approved.',
    date: '2024-02-04',
  },
];

export default function StudentDashboard() {
  const [isStudentLoggedIn] = useState(true);
  const [application, setApplication] = useState<ShiftingApplication | null>(activeApplication);
  const [selectedApp, setSelectedApp] = useState<ShiftingApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    currentCourses: '',
    desiredCourses: '',
    reason: '',
  });

  const hasPendingRequest = application?.status === 'submitted' || application?.status === 'under_review';

  const reviewProgress = useMemo(() => {
    if (!application) return 'Not started';
    if (application.status === 'approved' || application.status === 'completed') return 'Approved';
    if (application.status === 'rejected') return 'Closed';
    if (application.status === 'draft') return 'Draft';
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

  const handleSubmitApplication = () => {
    if (formData.currentCourses && formData.desiredCourses && formData.reason) {
      const submittedDate = new Date().toISOString().split('T')[0];
      const newApp: ShiftingApplication = {
        id: `CSR-${Date.now()}`,
        studentId: 'STU-2021-0001',
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        status: 'submitted',
        createdAt: submittedDate,
        updatedAt: submittedDate,
        submittedAt: submittedDate,
        ...formData,
      };

      setApplication(newApp);
      setShowModal(false);
    }
  };

  if (!isStudentLoggedIn) {
    return (
      <SidebarLayout title="Student Dashboard">
        <div className="py-12 text-center">
          <p className="text-lg text-slate-500">Please log in to access the student dashboard.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout title="Student Dashboard">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Request" value={application ? '1' : '0'} description={application?.id ?? 'No request on file'} icon={<FileText className="h-6 w-6" />} />
          <StatCard title="Review Status" value={reviewProgress} description={application ? 'Current workflow stage' : 'Ready for submission'} icon={<CalendarClock className="h-6 w-6" />} />
          <StatCard title="Approved Matches" value={mockEquivalencies.filter((item) => item.status === 'approved').length} description="Course equivalencies" icon={<CheckCircle2 className="h-6 w-6" />} />
          <StatCard title="Pending Items" value={mockEquivalencies.filter((item) => item.status === 'pending').length} description="Awaiting validation" icon={<ClipboardCheck className="h-6 w-6" />} />
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
                    {mockEquivalencies.map((eq) => (
                      <tr key={eq.id} className="bg-white">
                        <td className="px-3 py-4 font-medium text-slate-950">{eq.currentSubject}</td>
                        <td className="px-3 py-4 font-mono text-slate-600">{eq.currentSubjectCode}</td>
                        <td className="px-3 py-4 text-slate-700">{eq.equivalentSubjectCode} - {eq.equivalentSubject}</td>
                        <td className="px-3 py-4 text-center font-semibold text-slate-950">{eq.credits}</td>
                        <td className="px-3 py-4">
                          <StatusBadge status={eq.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Content>
          </Card>

          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Updates for your current request.</p>
              </div>
              <div className="space-y-3">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="rounded-md border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{notif.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{notif.message}</p>
                        <p className="mt-3 text-xs font-medium text-slate-500">{notif.date}</p>
                      </div>
                      <StatusBadge status={notif.type} />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl overflow-hidden rounded-md border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-lg font-semibold">
                {selectedApp ? 'Request Details' : 'New Course Shifting Request'}
              </h2>
              <Button size="sm" variant="tertiary" onPress={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-6">
              {selectedApp ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Course</p>
                      <p className="mt-2 font-semibold text-slate-950">{selectedApp.currentCourses}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desired Course</p>
                      <p className="mt-2 font-semibold text-slate-950">{selectedApp.desiredCourses}</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{selectedApp.reason}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                    <StatusBadge status={selectedApp.status} />
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
                    <Label htmlFor="reason" className="font-semibold text-slate-900">Reason for Shifting</Label>
                    <TextArea
                      id="reason"
                      placeholder="Explain why you want to shift courses"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button variant="secondary" onPress={() => setShowModal(false)}>
                Cancel
              </Button>
              {!selectedApp && (
                <Button variant="primary" onPress={handleSubmitApplication}>
                  <Send className="h-4 w-4" />
                  Submit Request
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </SidebarLayout>
  );
}
