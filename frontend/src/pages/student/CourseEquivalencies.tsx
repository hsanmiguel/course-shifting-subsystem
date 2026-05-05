import { useEffect, useMemo, useState } from 'react';
import { Card, Chip, Spinner } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { BookOpenCheck, CheckCircle2, Clock3, Info, XCircle } from 'lucide-react';
import { useApplications } from '@/hooks';
import { apiClient } from '@/services/api-client';
import { authService } from '@/services/auth';
import type { CourseEquivalency, SubjectEquivalencyRecord } from '@/types';

export default function CourseEquivalencies() {
  const studentId = authService.getCurrentUser()?.id || localStorage.getItem('studentId') || '';
  const { applications, loading: applicationsLoading, error: applicationsError } = useApplications(studentId);
  const application = applications[0] || null;
  const [equivalencyRecord, setEquivalencyRecord] = useState<SubjectEquivalencyRecord | null>(null);
  const [equivalencies, setEquivalencies] = useState<CourseEquivalency[]>([]);
  const [isLoadingEquivalencies, setIsLoadingEquivalencies] = useState(false);
  const [equivalencyError, setEquivalencyError] = useState<string | null>(null);

  useEffect(() => {
    if (!application?.application_id) {
      setEquivalencyRecord(null);
      setEquivalencies([]);
      return;
    }

    async function fetchEquivalencies() {
      if (!application?.application_id) return;

      try {
        setIsLoadingEquivalencies(true);
        setEquivalencyError(null);
        const data = await apiClient.getEquivalency(application.application_id);
        const record = Array.isArray(data)
          ? null
          : data;

        setEquivalencyRecord(record);
        setEquivalencies(Array.isArray(data) ? data : (data.credited_subjects || []));
      } catch (err) {
        setEquivalencyError(err instanceof Error ? err.message : 'Failed to load course equivalencies');
        setEquivalencyRecord(null);
        setEquivalencies([]);
      } finally {
        setIsLoadingEquivalencies(false);
      }
    }

    fetchEquivalencies();
  }, [application?.application_id]);

  const retakeSubjects = equivalencyRecord?.retake_subjects || [];

  const stats = useMemo(() => ({
    total: equivalencies.length + retakeSubjects.length,
    credited: equivalencies.length,
    retake: retakeSubjects.length,
    newUnits: equivalencyRecord?.new_units_required ?? 0,
  }), [equivalencies.length, equivalencyRecord?.new_units_required, retakeSubjects.length]);

  const isLoading = applicationsLoading || isLoadingEquivalencies;
  const error = applicationsError || equivalencyError;

  return (
    <SidebarLayout title="Course Equivalencies" userRole="student">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Total Courses" value={stats.total} icon={<BookOpenCheck className="h-6 w-6" />} />
          <StatCard title="Credited" value={stats.credited} icon={<CheckCircle2 className="h-6 w-6" />} />
          <StatCard title="Retake" value={stats.retake} icon={<Clock3 className="h-6 w-6" />} />
          <StatCard title="New Units" value={stats.newUnits} icon={<XCircle className="h-6 w-6" />} />
        </div>

        {!studentId && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">Please log in to view course equivalencies.</p>
          </Card>
        )}

        {isLoading && studentId && (
          <Card className="rounded-md border border-slate-200 bg-white p-8">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Spinner size="sm" />
              <span>Loading course equivalencies...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">Unable to load course equivalencies</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </Card>
        )}

        {!isLoading && !error && studentId && !application && (
          <Card className="rounded-md border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-950">No active application found</p>
            <p className="mt-2 text-sm text-slate-500">Course equivalencies will appear after you submit an application.</p>
          </Card>
        )}

        {!isLoading && !error && application && (
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{application.application_id}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Subject Code</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Equivalent To</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Units</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Grade</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equivalencies.length === 0 && retakeSubjects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                          No course equivalencies found for this application.
                        </td>
                      </tr>
                    )}

                    {equivalencies.map((equiv, idx) => (
                      <tr key={`${equiv.subject_code}-${idx}`} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{equiv.subject_code}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{equiv.equivalent_to}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">{equiv.units}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">{equiv.grade}</td>
                        <td className="px-4 py-3">
                          <Chip color="success" size="sm" variant="soft">
                            {equiv.status}
                          </Chip>
                        </td>
                      </tr>
                    ))}

                    {retakeSubjects.map((subject, idx) => (
                      <tr key={`${subject}-${idx}`} className="border-b bg-white">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{subject}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">No credited equivalent</td>
                        <td className="px-4 py-3 text-center text-gray-400">-</td>
                        <td className="px-4 py-3 text-center text-gray-400">-</td>
                        <td className="px-4 py-3">
                          <Chip color="warning" size="sm" variant="soft">
                            retake
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Content>
          </Card>
        )}

        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-6">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-950">About Course Equivalencies</p>
                <p className="text-sm leading-6 text-slate-600">
                  Course equivalencies are shown from the submitted application record. If nothing is listed yet, the application may still be awaiting evaluation.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </SidebarLayout>
  );
}
