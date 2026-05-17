import { Button, Card, Spinner } from '@heroui/react';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { apiClient } from '@/services/api-client';
import { authService } from '@/services/auth';
import type { EligibilityCheckResult } from '@/types';

const programOptions = [
  { value: 'BSBA', label: 'BSBA - Bachelor of Science in Business Administration' },
  { value: 'BSA', label: 'BSA - Bachelor of Science in Accountancy' },
  { value: 'BSAIM', label: 'BSAIM - Bachelor of Science in Accounting Information Management' },
  { value: 'BSBF', label: 'BSBF - Bachelor of Science in Banking and Finance' },
  { value: 'BSBM-H', label: 'BSBM-H - Bachelor of Science in Business Management Honors Program' },
  { value: 'BSFMA', label: 'BSFMA - Bachelor of Science in Financial Management and Accounting' },
  { value: 'BSLM', label: 'BSLM - Bachelor of Science in Legal Management' },
  { value: 'BSM', label: 'BSM - Bachelor of Science in Management' },
  { value: 'BSMM', label: 'BSMM - Bachelor of Science in Marketing Management' },
  { value: 'BSEntrep', label: 'BSEntrep - Bachelor of Science in Entrepreneurship' },
  { value: 'BSBA-Tourism', label: 'BSBA-Tourism - Bachelor of Science in Business Administration, Specialized Track on Tourism' },
  { value: 'BSCE', label: 'BSCE - Bachelor of Science in Civil Engineering' },
  { value: 'BSCpE', label: 'BSCpE - Bachelor of Science in Computer Engineering' },
  { value: 'BSECE', label: 'BSECE - Bachelor of Science in Electronics Engineering' },
  { value: 'BET-CET', label: 'BET-CET - Bachelor of Engineering Technology - Computer Engineering Technology' },
  { value: 'BSCS', label: 'BSCS - Bachelor of Science in Computer Science' },
  { value: 'BSIS', label: 'BSIS - Bachelor of Science in Information Systems' },
  { value: 'BSIT', label: 'BSIT - Bachelor of Science in Information Technology' },
  { value: 'BSBio', label: 'BSBio - Bachelor of Science in Biology' },
  { value: 'BSMath', label: 'BSMath - Bachelor of Science in Mathematics' },
  { value: 'BSN', label: 'BSN - Bachelor of Science in Nursing' },
  { value: 'BSPsych', label: 'BSPsych - Bachelor of Science in Psychology' },
  { value: 'BSDC', label: 'BSDC - Bachelor of Science in Development Communication' },
  { value: 'BSTM', label: 'BSTM - Bachelor of Science in Tourism Management' },
  { value: 'BAComm', label: 'BAComm - Bachelor of Arts in Communication' },
  { value: 'BAEcon', label: 'BAEcon - Bachelor of Arts in Economics' },
  { value: 'BAELS', label: 'BAELS - Bachelor of Arts in English Language Studies' },
  { value: 'BALit', label: 'BALit - Bachelor of Arts in Literature' },
  { value: 'BAPhil', label: 'BAPhil - Bachelor of Arts in Philosophy' },
  { value: 'BAPolSci', label: 'BAPolSci - Bachelor of Arts in Political Science' },
  { value: 'BECEd', label: 'BECEd - Bachelor of Early Childhood Education' },
  { value: 'BEEd', label: 'BEEd - Bachelor of Elementary Education' },
  { value: 'BSEd', label: 'BSEd - Bachelor of Secondary Education' },
  { value: 'BSNEd', label: 'BSNEd - Bachelor of Special Needs Education' },
  { value: 'BRVE', label: 'BRVE - Bachelor of Religious and Values Education' },
  { value: 'BPEd', label: 'BPEd - Bachelor of Physical Education' },
];

function getStudentIdFromToken() {
  const token = apiClient.getAuthToken();
  const [prefix, role, studentId] = token.split(':');

  return prefix === 'dev' && role === 'student' ? studentId : '';
}

function formatProgram(programCode: string, options = programOptions) {
  return options.find((program) => program.value === programCode)?.label ?? programCode;
}

function CheckRow({
  passed,
  title,
  detail,
}: {
  passed: boolean;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      </span>
      <div>
        <p className="font-medium text-slate-950">{title}</p>
        {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

export default function EligibilityChecker() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const studentId = currentUser?.id || getStudentIdFromToken() || localStorage.getItem('studentId') || '';
  const currentProgram = localStorage.getItem('currentProgram') || 'CURRENT';
  const [targetProgram, setTargetProgram] = useState('');
  const [result, setResult] = useState<EligibilityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isProgramListOpen, setIsProgramListOpen] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState(programOptions);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .listCatalogCourses()
      .then(({ data }) => {
        const optionsByValue = new Map<string, { value: string; label: string }>();

        for (const course of data) {
          if (!course.subject_code || !course.subject_name) continue;
          optionsByValue.set(course.subject_code, {
            value: course.subject_code,
            label: `${course.subject_code} - ${course.subject_name}`,
          });
        }

        if (isMounted && optionsByValue.size > 0) {
          setCatalogOptions([...optionsByValue.values()]);
        }
      })
      .catch((err) => {
        console.error('Failed to load CMS course catalog:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProgramLabel = useMemo(() => formatProgram(targetProgram, catalogOptions), [targetProgram, catalogOptions]);

  const handleCheckEligibility = async () => {
    if (!targetProgram) {
      setError('Please select a target program before checking eligibility.');
      setResult(null);
      return;
    }

    if (!studentId) {
      setError('Please log in again before checking eligibility.');
      setResult(null);
      return;
    }

    try {
      setIsChecking(true);
      setError(null);
      const eligibility = await apiClient.checkEligibility({
        student_id: studentId,
        current_program: currentProgram,
        target_program: targetProgram,
      });

      setResult(eligibility);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Unable to check eligibility right now.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceed = () => {
    if (!result?.overall_eligible) return;

    navigate(`/student/application-form?targetProgram=${encodeURIComponent(result.target_program)}`, {
      state: { targetProgram: result.target_program },
    });
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setTargetProgram('');
    setIsProgramListOpen(false);
  };

  return (
    <SidebarLayout
      title="Eligibility Checker"
      subtitle="Check your readiness before starting a course shifting request"
      userRole="student"
    >
      <div className="flex flex-col min-h-screen">
        <div className="mx-auto max-w-5xl space-y-6 flex-1">
        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="gap-6 p-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Eligibility Checker</h2>
              <p className="mt-2 text-sm text-slate-500">
                Select the program you want to shift into. The checker will validate your academic standing, holds, alerts, and slot availability.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900" id="target-program-label">
                Select Target Program <span className="text-red-600">*</span>
              </label>
              <div className="rounded-md border border-slate-300 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                {isProgramListOpen ? (
                  <button
                    aria-expanded="true"
                    aria-haspopup="listbox"
                    aria-labelledby="target-program-label target-program-button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm outline-none"
                    id="target-program-button"
                    type="button"
                    onClick={() => setIsProgramListOpen((isOpen) => !isOpen)}
                  >
                    <span className={targetProgram ? 'text-slate-950' : 'text-slate-500'}>
                      {targetProgram ? selectedProgramLabel : 'Choose a program to check eligibility'}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 rotate-180 text-slate-500 transition-transform" />
                  </button>
                ) : (
                  <button
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    aria-labelledby="target-program-label target-program-button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm outline-none"
                    id="target-program-button"
                    type="button"
                    onClick={() => setIsProgramListOpen((isOpen) => !isOpen)}
                  >
                    <span className={targetProgram ? 'text-slate-950' : 'text-slate-500'}>
                      {targetProgram ? selectedProgramLabel : 'Choose a program to check eligibility'}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform" />
                  </button>
                )}

                {isProgramListOpen && (
                  <div
                    aria-labelledby="target-program-label"
                    className="max-h-72 overflow-y-auto border-t border-slate-200"
                    role="listbox"
                  >
                    {catalogOptions.map((program) => {
                      const isSelected = program.value === targetProgram;

                      if (isSelected) {
                        return (
                          <button
                            aria-selected="true"
                            className="flex w-full items-start justify-between gap-3 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-700 transition"
                            key={program.value}
                            role="option"
                            type="button"
                            onClick={() => {
                              setTargetProgram(program.value);
                              setResult(null);
                              setError(null);
                              setIsProgramListOpen(false);
                            }}
                          >
                            <span>{program.label}</span>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          </button>
                        );
                      }

                      return (
                        <button
                          aria-selected="false"
                          className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                          key={program.value}
                          role="option"
                          type="button"
                          onClick={() => {
                            setTargetProgram(program.value);
                            setResult(null);
                            setError(null);
                            setIsProgramListOpen(false);
                          }}
                        >
                          <span>{program.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              variant="primary"
              isDisabled={!targetProgram || isChecking}
              onPress={handleCheckEligibility}
            >
              {isChecking ? (
                <>
                  <Spinner size="sm" />
                  Checking...
                </>
              ) : (
                'Check Eligibility'
              )}
            </Button>

            {!result && !error && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-5">
                <p className="font-semibold text-blue-950">What this checker reviews</p>
                <div className="mt-4 grid gap-3 text-sm text-blue-900 md:grid-cols-2">
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> GPA minimum requirement</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Major subject standing</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Financial obligations</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Academic alerts and slots</p>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        {error && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3 text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unable to complete eligibility check</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {result && (
          <>
            <Card
              className={`rounded-md border p-6 shadow-sm ${
                result.overall_eligible
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <span
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                      result.overall_eligible ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {result.overall_eligible ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">
                      {result.overall_eligible ? 'You are eligible' : 'Not eligible at this time'}
                    </p>
                    <p className="mt-1 text-sm">
                      {result.overall_eligible
                        ? `You meet the requirements for ${formatProgram(result.target_program, catalogOptions)}.`
                        : `One or more requirements need attention before shifting to ${selectedProgramLabel}.`}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{formatProgram(result.target_program, catalogOptions)}</p>
              </div>
            </Card>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="gap-6 p-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Eligibility Requirements</h3>
                  <p className="mt-1 text-sm text-slate-500">These results come from your student profile and target program data.</p>
                </div>

                <div className="space-y-5">
                  <CheckRow
                    passed={result.checks.gwa_eligible}
                    title="Your GPA meets the minimum requirement"
                    detail={`Your GPA: ${result.checks.student_gwa} | Required: ${result.checks.minimum_gwa_required}`}
                  />
                  <CheckRow
                    passed={result.checks.no_failing_major}
                    title="No failing grades in major subjects"
                    detail={
                      result.failing_subjects.length
                        ? result.failing_subjects.map((subject) => `${subject.subject_code} - ${subject.subject_name}`).join(', ')
                        : undefined
                    }
                  />
                  <CheckRow
                    passed={result.checks.no_financial_hold}
                    title="No outstanding financial obligations"
                    detail={result.hold_type ? `Hold type: ${result.hold_type}` : undefined}
                  />
                  <CheckRow
                    passed={result.checks.no_academic_alert}
                    title="No active academic alerts"
                    detail={result.alerts.length ? result.alerts.join(', ') : undefined}
                  />
                  <CheckRow
                    passed={result.checks.slot_available}
                    title={`${result.checks.available_slots} slot${result.checks.available_slots === 1 ? '' : 's'} available in ${result.target_program}`}
                  />
                  <CheckRow
                    passed={result.checks.curriculum_found}
                    title="Curriculum map is available for the target program"
                  />
                </div>
              </Card.Content>
            </Card>

            {!result.overall_eligible && (
              <Card className="rounded-md border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-950">Recommendations</p>
                <p className="mt-2 text-sm text-amber-800">
                  Resolve the failed requirements above before starting an application for this program.
                </p>
              </Card>
            )}

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              {result.overall_eligible && (
                <Button className="w-full" variant="primary" onPress={handleProceed}>
                  Proceed to Application
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button variant="secondary" onPress={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Check Another Program
              </Button>
            </div>
          </>
        )}
        </div>
      </div>
    </SidebarLayout>
  );
}
