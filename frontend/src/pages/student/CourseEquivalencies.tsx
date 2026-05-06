import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Chip, Spinner } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Plus,
  SearchCheck,
  XCircle,
} from 'lucide-react';
import { useApplications } from '@/hooks';
import { apiClient } from '@/services/api-client';
import { authService } from '@/services/auth';
import type { CourseEquivalency, SubjectEquivalencyRecord } from '@/types';

type ViewMode = 'checker' | 'report';

type ProgramOption = {
  code: string;
  name: string;
};

type Subject = {
  code: string;
  title: string;
  units: number;
  equivalentCodes?: string[];
};

type SubjectMapping = {
  currentSubject?: Subject;
  equivalentSubject?: Subject;
  units: number;
  status: 'credited' | 'new_required' | 'not_applicable';
};

const programOptions: ProgramOption[] = [
  { code: 'BSA', name: 'Bachelor of Science in Accountancy' },
  { code: 'BSBIO', name: 'Bachelor of Science in Biology' },
  { code: 'BSCE', name: 'Bachelor of Science in Civil Engineering' },
  { code: 'BSCPE', name: 'Bachelor of Science in Computer Engineering' },
  { code: 'BSCS', name: 'Bachelor of Science in Computer Science' },
  { code: 'BSDC', name: 'Bachelor of Science in Development Communication' },
  { code: 'BSECE', name: 'Bachelor of Science in Electronics Engineering' },
  { code: 'BSENTREP-TM', name: 'Bachelor of Science in Entrepreneurship Specialized Track on Tourism' },
  { code: 'BSIS', name: 'Bachelor of Science in Information Systems' },
  { code: 'BSIT', name: 'Bachelor of Science in Information Technology' },
  { code: 'BSMATH', name: 'Bachelor of Science in Mathematics' },
  { code: 'BSN', name: 'Bachelor of Science in Nursing' },
  { code: 'BSPSY', name: 'Bachelor of Science in Psychology' },
  { code: 'BSTM', name: 'Bachelor of Science in Tourism Management' },
  { code: 'BSBA-AIM', name: 'BSBA major in Accounting Information Management' },
  { code: 'BSBA-BF', name: 'BSBA major in Banking and Finance' },
  { code: 'BSBA-BMHP', name: 'BSBA major in Business Management Honors Program' },
  { code: 'BSBA-FMA', name: 'BSBA major in Financial Management and Accounting' },
  { code: 'BSBA-LM', name: 'BSBA major in Legal Management' },
  { code: 'BSBA-MGT', name: 'BSBA major in Management' },
  { code: 'BSBA-MM', name: 'BSBA major in Marketing Management' },
  { code: 'BA-COMM', name: 'Bachelor of Arts in Communication' },
  { code: 'BA-ECON', name: 'Bachelor of Arts in Economics' },
  { code: 'BA-ELS', name: 'Bachelor of Arts in English Language Studies' },
  { code: 'BA-LIT', name: 'Bachelor of Arts in Literature' },
  { code: 'BA-PHILO', name: 'Bachelor of Arts in Philosophy' },
  { code: 'BA-POLS', name: 'Bachelor of Arts in Political Science' },
  { code: 'BA-RVE', name: 'Bachelor of Arts in Religious and Values Education' },
  { code: 'BECE', name: 'Bachelor of Early Childhood Education' },
  { code: 'BEED', name: 'Bachelor of Elementary Education' },
  { code: 'BLIS', name: 'Bachelor of Library Information Science' },
  { code: 'BSED', name: 'Bachelor of Secondary Education' },
  { code: 'BSNE', name: 'Bachelor of Special Needs Education' },
  { code: 'BET-CET', name: 'Bachelor of Engineering Technology - Computer Engineering Technology' },
  { code: 'BPE', name: 'Bachelor of Physical Education' },
];

const completedSubjectsByProgram: Record<string, Subject[]> = {
  BSIT: [
    { code: 'IT101', title: 'Introduction to Computing', units: 3, equivalentCodes: ['CS101', 'IS101'] },
    { code: 'IT102', title: 'Computer Programming I', units: 3, equivalentCodes: ['CS102'] },
    { code: 'IT201', title: 'Data Structures and Algorithms', units: 3, equivalentCodes: ['CS201'] },
    { code: 'IT202', title: 'Object-Oriented Programming', units: 3, equivalentCodes: ['CS202'] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
    { code: 'GE101', title: 'Understanding the Self', units: 3, equivalentCodes: ['GE101'] },
    { code: 'IT301', title: 'Systems Integration and Architecture', units: 3, equivalentCodes: ['IS301'] },
    { code: 'IT302', title: 'Web Systems and Technologies', units: 3, equivalentCodes: [] },
    { code: 'IT401', title: 'Information Assurance and Security', units: 3, equivalentCodes: [] },
  ],
  BSCS: [
    { code: 'CS101', title: 'Introduction to Computer Science', units: 3, equivalentCodes: ['IT101', 'IS101'] },
    { code: 'CS102', title: 'Programming Fundamentals', units: 3, equivalentCodes: ['IT102'] },
    { code: 'CS201', title: 'Data Structures', units: 3, equivalentCodes: ['IT201'] },
    { code: 'CS202', title: 'Object-Oriented Design', units: 3, equivalentCodes: ['IT202'] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
  ],
};

const targetCurricula: Record<string, Subject[]> = {
  BSIT: completedSubjectsByProgram.BSIT,
  BSCS: completedSubjectsByProgram.BSCS,
  BSIS: [
    { code: 'IS101', title: 'Introduction to Information Systems', units: 3, equivalentCodes: ['IT101', 'CS101'] },
    { code: 'IS201', title: 'Business Process Management', units: 3, equivalentCodes: [] },
    { code: 'IS301', title: 'Systems Analysis and Design', units: 3, equivalentCodes: ['IT301'] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
    { code: 'GE101', title: 'Understanding the Self', units: 3, equivalentCodes: ['GE101'] },
  ],
  BSCPE: [
    { code: 'CPE101', title: 'Computer Engineering as a Discipline', units: 3, equivalentCodes: ['IT101', 'CS101'] },
    { code: 'CPE201', title: 'Computer Programming', units: 3, equivalentCodes: ['IT102', 'CS102'] },
    { code: 'CPE301', title: 'Digital Logic Design', units: 3, equivalentCodes: [] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
  ],
};

function fallbackCompletedSubjects(programCode: string): Subject[] {
  return [
    { code: `${programCode}101`, title: 'Program Foundation Course', units: 3, equivalentCodes: [] },
    { code: 'GE101', title: 'Understanding the Self', units: 3, equivalentCodes: ['GE101'] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
  ];
}

function fallbackTargetCurriculum(programCode: string): Subject[] {
  return [
    { code: `${programCode}101`, title: 'Program Foundation Course', units: 3, equivalentCodes: [] },
    { code: `${programCode}201`, title: 'Major Course Requirement', units: 3, equivalentCodes: [] },
    { code: 'GE101', title: 'Understanding the Self', units: 3, equivalentCodes: ['GE101'] },
    { code: 'MATH101', title: 'College Algebra', units: 3, equivalentCodes: ['MATH101'] },
  ];
}

function getCompletedSubjects(programCode: string) {
  return completedSubjectsByProgram[programCode] || fallbackCompletedSubjects(programCode);
}

function getTargetCurriculum(programCode: string) {
  return targetCurricula[programCode] || fallbackTargetCurriculum(programCode);
}

function buildSubjectMappings(currentProgram: string, targetProgram: string): SubjectMapping[] {
  const completedSubjects = getCompletedSubjects(currentProgram);
  const targetSubjects = getTargetCurriculum(targetProgram);
  const creditedCodes = new Set<string>();

  const creditedMappings = targetSubjects.flatMap((targetSubject) => {
    const completedSubject = completedSubjects.find((subject) => (
      subject.code === targetSubject.code ||
      subject.equivalentCodes?.includes(targetSubject.code) ||
      targetSubject.equivalentCodes?.includes(subject.code)
    ));

    if (!completedSubject) return [];

    creditedCodes.add(completedSubject.code);

    return [{
      currentSubject: completedSubject,
      equivalentSubject: targetSubject,
      units: Math.min(completedSubject.units, targetSubject.units),
      status: 'credited' as const,
    }];
  });

  const creditedTargetCodes = new Set(creditedMappings.map((mapping) => mapping.equivalentSubject?.code));
  const newRequiredMappings = targetSubjects
    .filter((targetSubject) => !creditedTargetCodes.has(targetSubject.code))
    .map((targetSubject) => ({
      equivalentSubject: targetSubject,
      units: targetSubject.units,
      status: 'new_required' as const,
    }));

  const notApplicableMappings = completedSubjects
    .filter((subject) => !creditedCodes.has(subject.code))
    .map((subject) => ({
      currentSubject: subject,
      units: subject.units,
      status: 'not_applicable' as const,
    }));

  return [...creditedMappings, ...newRequiredMappings, ...notApplicableMappings];
}

function getProgramName(code: string) {
  return programOptions.find((program) => program.code === code)?.name || code;
}

function getStatusLabel(status: SubjectMapping['status']) {
  if (status === 'credited') return 'Credited';
  if (status === 'new_required') return 'New Required';
  return 'Not Applicable';
}

export default function CourseEquivalencies() {
  const studentId = authService.getCurrentUser()?.id || localStorage.getItem('studentId') || '';
  const { applications, loading: applicationsLoading, error: applicationsError } = useApplications(studentId);
  const application = applications[0] || null;
  const [activeView, setActiveView] = useState<ViewMode>('report');
  const [currentProgram, setCurrentProgram] = useState(application?.current_program || 'BSIT');
  const [targetProgram, setTargetProgram] = useState('');
  const [subjectMappings, setSubjectMappings] = useState<SubjectMapping[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
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

  useEffect(() => {
    if (!application?.current_program) return;
    setCurrentProgram(application.current_program);
  }, [application?.current_program]);

  const retakeSubjects = equivalencyRecord?.retake_subjects || [];

  const stats = useMemo(() => ({
    total: equivalencies.length + retakeSubjects.length,
    credited: equivalencies.length,
    retake: retakeSubjects.length,
    newUnits: equivalencyRecord?.new_units_required ?? 0,
  }), [equivalencies.length, equivalencyRecord?.new_units_required, retakeSubjects.length]);

  const checkerStats = useMemo(() => {
    const credited = subjectMappings.filter((mapping) => mapping.status === 'credited');
    const newRequired = subjectMappings.filter((mapping) => mapping.status === 'new_required');
    const notApplicable = subjectMappings.filter((mapping) => mapping.status === 'not_applicable');

    return {
      creditedCount: credited.length,
      creditedUnits: credited.reduce((sum, mapping) => sum + mapping.units, 0),
      newRequiredCount: newRequired.length,
      newRequiredUnits: newRequired.reduce((sum, mapping) => sum + mapping.units, 0),
      notApplicableCount: notApplicable.length,
    };
  }, [subjectMappings]);

  const isLoading = applicationsLoading || isLoadingEquivalencies;
  const error = applicationsError || equivalencyError;
  const canCheck = Boolean(currentProgram && targetProgram && currentProgram !== targetProgram);

  const handleProgramChange = (field: 'current' | 'target', value: string) => {
    setHasChecked(false);
    setSubjectMappings([]);

    if (field === 'current') {
      setCurrentProgram(value);
      if (value === targetProgram) setTargetProgram('');
      return;
    }

    setTargetProgram(value);
  };

  const handleCheckEquivalency = () => {
    if (!canCheck) return;

    setSubjectMappings(buildSubjectMappings(currentProgram, targetProgram));
    setHasChecked(true);
  };

  return (
    <SidebarLayout
      title="Course Equivalencies"
      subtitle="Check how your completed subjects map to another program"
      userRole="student"
    >
      <div className="space-y-6">
        <div className="border-b border-slate-200">
          <div className="flex gap-6">
            <button
              type="button"
              className={`min-h-12 border-b-2 px-6 text-sm font-semibold transition ${
                activeView === 'report'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setActiveView('report')}
            >
              Equivalency Report
            </button>
            <button
              type="button"
              className={`min-h-12 border-b-2 px-6 text-sm font-semibold transition ${
                activeView === 'checker'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setActiveView('checker')}
            >
              Subject Equivalency Checker
            </button>
          </div>
        </div>

        {activeView === 'checker' && (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Subject Equivalency Checker</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Check how your current subjects map to different programs and see what credits will transfer.
              </p>
            </div>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="p-6">
                <p className="text-lg font-semibold text-slate-950">Select Programs to Compare</p>

                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Your Current Program <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={currentProgram}
                      onChange={(event) => handleProgramChange('current', event.target.value)}
                    >
                      {programOptions.map((program) => (
                        <option key={program.code} value={program.code}>
                          {program.code} - {program.name.replace('Bachelor of Science in ', 'BS ').replace('Bachelor of Arts in ', 'BA ')}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="hidden pb-3 text-slate-400 lg:block">
                    <ArrowRight className="h-5 w-5" />
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Target Program <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={targetProgram}
                      onChange={(event) => handleProgramChange('target', event.target.value)}
                    >
                      <option value="">Select target program</option>
                      {programOptions
                        .filter((program) => program.code !== currentProgram)
                        .map((program) => (
                          <option key={program.code} value={program.code}>
                            {program.code} - {program.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>

                <Button
                  className="mt-6 w-full justify-center"
                  size="lg"
                  variant="primary"
                  isDisabled={!canCheck}
                  onPress={handleCheckEquivalency}
                >
                  <SearchCheck className="h-4 w-4" />
                  Check Equivalency
                </Button>
              </Card.Content>
            </Card>

            {!hasChecked && (
              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-8">
                  <div className="flex min-h-64 flex-col items-center justify-center text-center">
                    <span className="rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-400">
                      <FileText className="h-10 w-10" />
                    </span>
                    <p className="mt-5 text-lg font-semibold text-slate-950">No Equivalency Data Yet</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      Select your current program and target program, then click Check Equivalency to see how your subjects transfer.
                    </p>
                  </div>
                </Card.Content>
              </Card>
            )}

            {hasChecked && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="rounded-md border border-green-200 bg-green-50 shadow-sm">
                    <Card.Content className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-green-900">Credited Subjects</p>
                          <p className="mt-2 text-3xl font-bold text-green-700">{checkerStats.creditedCount}</p>
                          <p className="mt-1 text-sm text-green-700">{checkerStats.creditedUnits} units credited</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-700" />
                      </div>
                    </Card.Content>
                  </Card>

                  <Card className="rounded-md border border-blue-200 bg-blue-50 shadow-sm">
                    <Card.Content className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-blue-900">New Subjects Required</p>
                          <p className="mt-2 text-3xl font-bold text-blue-700">{checkerStats.newRequiredCount}</p>
                          <p className="mt-1 text-sm text-blue-700">{checkerStats.newRequiredUnits} units to complete</p>
                        </div>
                        <Plus className="h-5 w-5 text-blue-700" />
                      </div>
                    </Card.Content>
                  </Card>

                  <Card className="rounded-md border border-amber-200 bg-amber-50 shadow-sm">
                    <Card.Content className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Not Applicable</p>
                          <p className="mt-2 text-3xl font-bold text-amber-700">{checkerStats.notApplicableCount}</p>
                          <p className="mt-1 text-sm text-amber-700">Won't transfer to new program</p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-amber-700" />
                      </div>
                    </Card.Content>
                  </Card>
                </div>

                <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                  <Card.Content className="p-0">
                    <div className="p-6">
                      <p className="text-lg font-semibold text-slate-950">Subject Mappings</p>
                      <p className="mt-1 text-sm text-slate-600">
                        How your subjects from {getProgramName(currentProgram)} map to {getProgramName(targetProgram)}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-y border-slate-200 bg-slate-50">
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Current Subject</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600"> </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Equivalent Subject</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Units</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectMappings.map((mapping, idx) => (
                            <tr key={`${mapping.status}-${idx}`} className="border-b border-slate-100 bg-white">
                              <td className="px-6 py-4">
                                {mapping.currentSubject ? (
                                  <>
                                    <p className="font-medium text-slate-950">{mapping.currentSubject.code}</p>
                                    <p className="mt-1 text-xs text-slate-500">{mapping.currentSubject.title}</p>
                                  </>
                                ) : (
                                  <span className="text-sm text-slate-400">No completed equivalent</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center text-slate-400">→</td>
                              <td className="px-6 py-4">
                                {mapping.equivalentSubject ? (
                                  <>
                                    <p className="font-medium text-slate-950">{mapping.equivalentSubject.code}</p>
                                    <p className="mt-1 text-xs text-slate-500">{mapping.equivalentSubject.title}</p>
                                  </>
                                ) : (
                                  <span className="text-sm text-slate-400">No target equivalent</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center font-medium text-slate-900">{mapping.units}</td>
                              <td className="px-6 py-4">
                                <Chip
                                  color={mapping.status === 'credited' ? 'success' : mapping.status === 'new_required' ? 'default' : 'warning'}
                                  size="sm"
                                  variant="soft"
                                >
                                  {getStatusLabel(mapping.status)}
                                </Chip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Content>
                </Card>
              </>
            )}
          </>
        )}

        {activeView === 'report' && (
          <>
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
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
