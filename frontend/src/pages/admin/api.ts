import { AdminAnalytics, AuditLogEntry, ShiftingApplication } from '@/types';
import { formatProgramName } from '@/constants/programs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !API_BASE_URL;

interface BackendAuditLog {
  id: string;
  application_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  details?: Record<string, unknown> | string | null;
  timestamp: string;
  from_status?: string | null;
  to_status?: string | null;
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK_DATA) return fallback;

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = localStorage.getItem('authToken') || import.meta.env.VITE_AUTH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${path}`, { headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to fetch admin data.');
  }
}

export const mockAdminApplications: ShiftingApplication[] = [
  {
    application_id: 'CSS-2024-00142',
    student_id: 'STU-2021-08831',
    student_name: 'Juan Dela Cruz',
    student_email: 'juan.delacruz@example.edu',
    phone_number: null,
    current_program: 'BSIT',
    current_year: '3rd Year',
    target_program: 'BSCS',
    target_semester: '2024-2025 First Semester',
    reason_for_shifting:
      'I have developed a stronger interest in computer science theory and algorithms through my programming courses.',
    self_reported_gpa: 1.75,
    self_reported_credits: 72,
    supporting_documents: {
      official_transcripts: true,
      recommendation_letter: true,
      additional_essays: false,
    },
    acknowledgements: {
      information_is_accurate: true,
      understands_transfer_policies: true,
      agrees_to_terms: true,
    },
    gwa: 1.75,
    units_completed: 72,
    has_failing_major: false,
    has_financial_hold: false,
    has_academic_alert: false,
    slot_available: true,
    status: 'under_review',
    submitted_at: '2024-07-10',
    reviewed_by: 'dept_head_01',
    decision_at: null,
    remarks: null,
  },
  {
    application_id: 'CSS-2024-00156',
    student_id: 'STU-2021-09045',
    student_name: 'Maria Santos',
    student_email: 'maria.santos@example.edu',
    phone_number: null,
    current_program: 'BSCS',
    current_year: '3rd Year',
    target_program: 'BSIT',
    target_semester: '2024-2025 First Semester',
    reason_for_shifting:
      'I want to move toward applied software implementation and systems administration work.',
    self_reported_gpa: 1.42,
    self_reported_credits: 84,
    supporting_documents: {
      official_transcripts: true,
      recommendation_letter: true,
      additional_essays: false,
    },
    acknowledgements: {
      information_is_accurate: true,
      understands_transfer_policies: true,
      agrees_to_terms: true,
    },
    gwa: 1.42,
    units_completed: 84,
    has_failing_major: false,
    has_financial_hold: false,
    has_academic_alert: false,
    slot_available: true,
    status: 'pending',
    submitted_at: '2024-07-11',
    reviewed_by: 'dept_head_02',
    decision_at: null,
    remarks: null,
  },
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: 'Jul 15, 2024, 06:30 PM',
    applicationId: 'CSS-2024-00156',
    studentName: 'Maria Santos',
    studentId: 'STU-2021-09045',
    action: 'approved',
    actor: 'dept_head_02',
    actorRole: 'Department Head',
    details: 'Application approved with conditions. Student has excellent academic standing.',
    fromStatus: 'under_review',
    toStatus: 'approved',
  },
  {
    id: 'AUD-002',
    timestamp: 'Jul 15, 2024, 05:15 PM',
    applicationId: 'CSS-2024-00155',
    studentName: 'Carlos Reyes',
    studentId: 'STU-2021-08956',
    action: 'rejected',
    actor: 'registrar_admin',
    actorRole: 'Registrar',
    details: 'Application rejected: GWA does not meet minimum requirement of 2.5. Current GWA: 2.65',
    fromStatus: 'under_review',
    toStatus: 'rejected',
  },
  {
    id: 'AUD-003',
    timestamp: 'Jul 15, 2024, 12:45 AM',
    applicationId: 'CSS-2024-00142',
    studentName: 'Juan Dela Cruz',
    studentId: 'STU-2021-08831',
    action: 'escalated',
    actor: 'system',
    actorRole: 'System',
    details: 'Application escalated to Registrar due to SLA breach. No action taken within 72 hours.',
    fromStatus: 'under_review',
    toStatus: 'under_review',
  },
  {
    id: 'AUD-004',
    timestamp: 'Jul 14, 2024, 10:20 PM',
    applicationId: 'CSS-2024-00153',
    studentName: 'Anna Lim',
    studentId: 'STU-2021-08745',
    action: 'status_change',
    actor: 'system',
    actorRole: 'System',
    details: 'Application status changed from awaiting_data to under_review. SRM service restored.',
    fromStatus: 'awaiting_data',
    toStatus: 'under_review',
  },
  {
    id: 'AUD-005',
    timestamp: 'Jul 14, 2024, 07:00 PM',
    applicationId: 'CSS-2024-00152',
    studentName: 'Robert Cruz',
    studentId: 'STU-2021-08889',
    action: 'waitlisted',
    actor: 'system',
    actorRole: 'System',
    details: 'Application placed on waitlist. No available slots in BSCS (0 slots available). Waitlist position: 5',
    fromStatus: 'pending',
    toStatus: 'waitlisted',
  },
];

export function getAdminApplications() {
  return getJson<{ data?: ShiftingApplication[] } | ShiftingApplication[]>(
    '/api/css/applications',
    { data: mockAdminApplications },
  ).then((payload) => (Array.isArray(payload) ? payload : payload.data ?? mockAdminApplications));
}

export function getAuditLogs() {
  return getJson<{ data?: BackendAuditLog[] } | BackendAuditLog[] | AuditLogEntry[]>(
    '/api/css/audit-logs',
    mockAuditLogs,
  ).then((payload) => {
    const logs = Array.isArray(payload) ? payload : payload.data ?? [];

    if (!logs.length) return [];

    return logs.map((log) => ('application_id' in log ? normalizeAuditLog(log) : log));
  });
}

export function buildAdminAnalytics(
  applications: ShiftingApplication[],
  auditLogs: AuditLogEntry[],
): AdminAnalytics {
  const statusCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.status] = (counts[application.status] ?? 0) + 1;
    return counts;
  }, {});

  const targetProgramCounts = applications.reduce<Record<string, number>>((counts, application) => {
    const programName = formatProgramName(application.target_program);

    counts[programName] = (counts[programName] ?? 0) + 1;
    return counts;
  }, {});

  const averageGwa = average(applications.map((application) => application.gwa ?? application.self_reported_gpa));
  const averageUnits = average(applications.map((application) => application.units_completed ?? application.self_reported_credits));

  return {
    totalApplications: applications.length,
    pendingReview: applications.filter((application) =>
      ['pending', 'under_review', 'waitlisted', 'awaiting_data', 'pending_cms_update'].includes(application.status),
    ).length,
    approvedApplications: statusCounts.approved ?? 0,
    rejectedApplications: statusCounts.rejected ?? 0,
    slaBreaches: applications.filter((application) => application.status === 'under_review' && hoursSince(application.submitted_at) >= 48).length,
    averageGwa: Number(averageGwa.toFixed(2)),
    averageUnits: Number(averageUnits.toFixed(0)),
    targetProgramDemand: Object.entries(targetProgramCounts).map(([program, count]) => ({ program, count })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    recentEvents: auditLogs.slice(0, 4),
  };
}

export async function getAdminAnalytics() {
  const [applications, auditLogs] = await Promise.all([
    getAdminApplications(),
    getAuditLogs().catch(() => []),
  ]);

  return buildAdminAnalytics(applications, auditLogs);
}

function average(values: Array<number | string | null | undefined>) {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!numbers.length) return 0;

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function hoursSince(date: string) {
  const submitted = new Date(date).getTime();

  if (!Number.isFinite(submitted)) return 0;

  return Math.max(0, (Date.now() - submitted) / (1000 * 60 * 60));
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString();
}

function formatAuditDetails(log: BackendAuditLog) {
  if (typeof log.details === 'string') return log.details;

  const detailText = Object.entries(log.details || {})
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ');

  return detailText || log.action.replace(/_/g, ' ').toLowerCase();
}

function normalizeAuditAction(action: string): AuditLogEntry['action'] {
  const normalized = action.toLowerCase();

  if (normalized.includes('approved')) return 'approved';
  if (normalized.includes('rejected')) return 'rejected';
  if (normalized.includes('escalated')) return 'escalated';
  if (normalized.includes('waitlist')) return 'waitlisted';

  return 'status_change';
}

function normalizeAuditLog(log: BackendAuditLog): AuditLogEntry {
  return {
    id: log.id,
    timestamp: formatDateTime(log.timestamp),
    applicationId: log.application_id,
    studentName: '',
    studentId: '',
    action: normalizeAuditAction(log.action),
    actor: log.actor_id,
    actorRole: log.actor_role,
    details: formatAuditDetails(log),
    fromStatus: log.from_status ?? '',
    toStatus: log.to_status ?? '',
  };
}
