import { Card, Button, Chip } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { BookOpenCheck, CheckCircle2, Clock3, Info, XCircle } from 'lucide-react';

interface CourseEquivalency {
  id: string;
  yourCourse: string;
  equivalentCourse: string;
  credits: number;
  status: 'verified' | 'pending' | 'rejected';
  matchPercentage: number;
}

export default function CourseEquivalencies() {
  const mockEquivalencies: CourseEquivalency[] = [
    {
      id: 'EQUIV-001',
      yourCourse: 'CS101 - Introduction to Programming',
      equivalentCourse: 'COMP150 - Programming Fundamentals',
      credits: 3,
      status: 'verified',
      matchPercentage: 95,
    },
    {
      id: 'EQUIV-002',
      yourCourse: 'MATH201 - Calculus II',
      equivalentCourse: 'MATH202 - Advanced Calculus',
      credits: 4,
      status: 'verified',
      matchPercentage: 90,
    },
    {
      id: 'EQUIV-003',
      yourCourse: 'ENG102 - English Composition',
      equivalentCourse: 'ENGL101 - Written Communication',
      credits: 3,
      status: 'pending',
      matchPercentage: 85,
    },
    {
      id: 'EQUIV-004',
      yourCourse: 'PHYS201 - Physics II',
      equivalentCourse: 'Not Found',
      credits: 4,
      status: 'rejected',
      matchPercentage: 0,
    },
  ];

  const getStatusColor = (status: CourseEquivalency['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <SidebarLayout title="Course Equivalencies" userRole="student">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Courses" value={mockEquivalencies.length} icon={<BookOpenCheck className="h-6 w-6" />} />
          <StatCard title="Verified" value={mockEquivalencies.filter(e => e.status === 'verified').length} icon={<CheckCircle2 className="h-6 w-6" />} />
          <StatCard title="Pending" value={mockEquivalencies.filter(e => e.status === 'pending').length} icon={<Clock3 className="h-6 w-6" />} />
          <StatCard title="Rejected" value={mockEquivalencies.filter(e => e.status === 'rejected').length} icon={<XCircle className="h-6 w-6" />} />
        </div>

        {/* Equivalencies Table */}
        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-6">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Your Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Equivalent Course</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Credits</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Match %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockEquivalencies.map((equiv, idx) => (
                  <tr key={equiv.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{equiv.yourCourse}</p>
                    </td>
                    <td className="py-3 px-4">
                      {equiv.equivalentCourse !== 'Not Found' ? (
                        <p className="text-sm text-gray-900">{equiv.equivalentCourse}</p>
                      ) : (
                        <span className="text-gray-400 text-sm">Not found</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium text-gray-900">{equiv.credits}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${equiv.matchPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{equiv.matchPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Chip
                        color={getStatusColor(equiv.status)}
                        size="sm"
                        variant="soft"
                      >
                        {equiv.status.charAt(0).toUpperCase() + equiv.status.slice(1)}
                      </Chip>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" variant="secondary">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-950">About Course Equivalencies</p>
                <p className="text-sm leading-6 text-slate-600">
                  Course equivalencies are automatically matched based on course content, credits, and learning outcomes.
                  A higher match percentage indicates a closer equivalence to your course. Rejected equivalencies
                  indicate that no suitable equivalent course was found in the new program.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </SidebarLayout>
  );
}
