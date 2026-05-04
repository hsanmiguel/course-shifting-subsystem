'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  TextArea,
  Label,
} from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ApplicationCard } from '@/components/molecules/ApplicationCard';
import { ShiftingApplication, CourseEquivalency, Notification, DashboardStats } from '@/types';

// Mock data
const mockApplications: ShiftingApplication[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    currentCourses: 'CS101, CS102',
    desiredCourses: 'CS201, CS202',
    reason: 'Need advanced courses for specialization',
    status: 'approved',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    submittedAt: '2024-01-15',
    approvedAt: '2024-01-20',
    approverName: 'Dr. Smith',
  },
  {
    id: '2',
    studentId: 'STU001',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    currentCourses: 'PHYS101',
    desiredCourses: 'PHYS201',
    reason: 'Continue with advanced physics track',
    status: 'under_review',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05',
    submittedAt: '2024-02-01',
  },
  {
    id: '3',
    studentId: 'STU001',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    currentCourses: 'ENG101, ENG102',
    desiredCourses: 'LIT201, LIT202',
    reason: 'Switch to literature focus',
    status: 'draft',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
  },
];

const mockEquivalencies: CourseEquivalency[] = [
  {
    id: '1',
    currentSubject: 'CS101',
    currentSubjectCode: 'CS101',
    equivalentSubject: 'CS201',
    equivalentSubjectCode: 'CS201',
    credits: 3,
    status: 'approved',
  },
  {
    id: '2',
    currentSubject: 'MATH101',
    currentSubjectCode: 'MATH101',
    equivalentSubject: 'MATH201',
    equivalentSubjectCode: 'MATH201',
    credits: 4,
    status: 'pending',
  },
  {
    id: '3',
    currentSubject: 'PHYS101',
    currentSubjectCode: 'PHYS101',
    equivalentSubject: 'PHYS201',
    equivalentSubjectCode: 'PHYS201',
    credits: 3,
    status: 'approved',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Application Approved',
    message: 'Your course shift application has been approved.',
    date: '2024-01-20',
  },
  {
    id: '2',
    type: 'info',
    title: 'Application Under Review',
    message: 'Your new application has been submitted for review.',
    date: '2024-02-05',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Pending Action Required',
    message: 'Some information is missing from your application.',
    date: '2024-02-10',
  },
];

export default function StudentDashboard() {
  // Student login check
  const [isStudentLoggedIn] = useState(true);
  
  const [applications, setApplications] = useState<ShiftingApplication[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<ShiftingApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    currentCourses: '',
    desiredCourses: '',
    reason: '',
  });

  const stats: DashboardStats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const handleViewApplication = (app: ShiftingApplication) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleNewApplication = () => {
    setSelectedApp(null);
    setFormData({ currentCourses: '', desiredCourses: '', reason: '' });
    setShowModal(true);
  };

  const handleSubmitApplication = () => {
    if (formData.currentCourses && formData.desiredCourses && formData.reason) {
      const newApp: ShiftingApplication = {
        id: Date.now().toString(),
        studentId: 'STU001',
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        ...formData,
      };
      setApplications([...applications, newApp]);
      setShowModal(false);
    }
  };

  // Render student content if logged in
  if (!isStudentLoggedIn) {
    return (
      <SidebarLayout title="Student Dashboard">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Please log in to access the student dashboard.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout title="Student Dashboard">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your course shift applications and track their status</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Applications" value={stats.total} color="primary" icon="📋" />
        <StatCard title="Pending" value={stats.pending} color="warning" icon="⏳" />
        <StatCard title="Approved" value={stats.approved} color="success" icon="✓" />
        <StatCard title="Rejected" value={stats.rejected} color="danger" icon="✗" />
      </div>

      {/* Recent Applications Section */}
      <Card className="bg-white shadow-lg border border-gray-200 mb-8 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <Button size="md" variant="primary" onPress={handleNewApplication}>
            + New Application
          </Button>
        </div>
        <div className="space-y-3">
          {applications.length > 0 ? (
            applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onView={handleViewApplication}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No applications yet. Create your first one!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Course Equivalencies Section */}
      <Card className="bg-white shadow-lg border border-gray-200 mb-8 p-6">
        <h2 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200">Course Equivalencies</h2>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Current Course</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Code</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Equivalent Course</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Code</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Credits</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockEquivalencies.map((eq, idx) => (
                <tr key={eq.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="py-4 px-6 text-gray-900 font-medium">{eq.currentSubject}</td>
                  <td className="py-4 px-6 text-gray-600 font-mono">{eq.currentSubjectCode}</td>
                  <td className="py-4 px-6 text-gray-900 font-medium">{eq.equivalentSubject}</td>
                  <td className="py-4 px-6 text-gray-600 font-mono">{eq.equivalentSubjectCode}</td>
                  <td className="py-4 px-6 text-center text-gray-900 font-semibold">{eq.credits}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={eq.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-white shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200">Recent Notifications</h2>
        <div className="space-y-3 mt-4">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <StatusBadge status={notif.type} />
                  </div>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">📅 {notif.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal for Application Details or New Application */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">
                {selectedApp ? 'Application Details' : 'New Application'}
              </h2>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedApp ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">CURRENT COURSES</p>
                    <p className="font-semibold text-gray-900">{selectedApp.currentCourses}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">DESIRED COURSES</p>
                    <p className="font-semibold text-gray-900">{selectedApp.desiredCourses}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">REASON</p>
                    <p className="text-gray-700">{selectedApp.reason}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-2">STATUS</p>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                  {selectedApp.approverNotes && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-semibold mb-1">APPROVER NOTES</p>
                      <p className="text-yellow-900">{selectedApp.approverNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="current-courses" className="font-semibold text-gray-900">Current Courses</Label>
                    <Input
                      id="current-courses"
                      placeholder="e.g., CS101, MATH101"
                      value={formData.currentCourses}
                      onChange={(e) =>
                        setFormData({ ...formData, currentCourses: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="desired-courses" className="font-semibold text-gray-900">Desired Courses</Label>
                    <Input
                      id="desired-courses"
                      placeholder="e.g., CS201, MATH201"
                      value={formData.desiredCourses}
                      onChange={(e) =>
                        setFormData({ ...formData, desiredCourses: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reason" className="font-semibold text-gray-900">Reason for Shifting</Label>
                    <TextArea
                      id="reason"
                      placeholder="Explain why you want to shift these courses"
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-2 justify-end bg-gray-50">
              <Button variant="secondary" onPress={() => setShowModal(false)}>
                Cancel
              </Button>
              {!selectedApp && (
                <Button variant="primary" onPress={handleSubmitApplication}>
                  Save as Draft
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </SidebarLayout>
  );
}
