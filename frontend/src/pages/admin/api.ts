import { AdminAnalytics, AdminApplication, AuditLogEntry } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = localStorage.getItem('authToken') || import.meta.env.VITE_AUTH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${path}`, { headers });

    if (!response.ok) return fallback;

    return await response.json();
  } catch {
    return fallback;
  }
}

export const mockAdminApplications: AdminApplication[] = [
  {
    id: 'CSS-2024-00142',
    studentId: 'STU-2021-08831',
    studentName: 'Juan Dela Cruz',
    currentProgram: 'BSIT',
    targetProgram: 'BSCS',
    gwa: 1.75,
    units: 72,
    reason:
      'I have developed a stronger interest in computer science theory and algorithms through my programming courses.',
    status: 'under_review',
    submittedAt: '2024-07-10',
    assignedTo: 'dept_head_01',
    eligibilityChecks: [
      { label: 'Minimum GWA (2.5 required)', passed: true },
      { label: 'No failing grades in major subjects', passed: true },
      { label: 'No financial holds', passed: true },
      { label: 'No academic alerts', passed: true },
      { label: 'Available slots in target program', passed: true },
    ],
    slaWarning: {
      title: 'SLA Breach Warning - Application CSS-2024-00142',
      hoursPending: 48,
      assignedTo: 'dept_head_01',
      message: 'Reminder notification sent to assigned reviewer via U-ANAS.',
      escalatedTo: 'registrar_admin',
      timestamp: '7/12/2024, 4:30:00 PM',
    },
  },
  {
    id: 'CSS-2024-00156',
    studentId: 'STU-2021-09045',
    studentName: 'Maria Santos',
    currentProgram: 'BSCS',
    targetProgram: 'BSIT',
    gwa: 1.42,
    units: 84,
    reason:
      'I want to move toward applied software implementation and systems administration work.',
    status: 'pending',
    submittedAt: '2024-07-11',
    assignedTo: 'dept_head_02',
    eligibilityChecks: [
      { label: 'Minimum GWA (2.5 required)', passed: true },
      { label: 'No failing grades in major subjects', passed: true },
      { label: 'No financial holds', passed: true },
      { label: 'No academic alerts', passed: true },
      { label: 'Available slots in target program', passed: true },
    ],
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
  return getJson<AdminApplication[]>('/admin/applications', mockAdminApplications);
}

export function getAuditLogs() {
  return getJson<AuditLogEntry[]>('/admin/audit-logs', mockAuditLogs);
}

export function buildAdminAnalytics(
  applications: AdminApplication[],
  auditLogs: AuditLogEntry[],
): AdminAnalytics {
  const statusCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.status] = (counts[application.status] ?? 0) + 1;

    return counts;
  }, {});

  const targetProgramCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.targetProgram] = (counts[application.targetProgram] ?? 0) + 1;

    return counts;
  }, {});

  const averageGwa = applications.length
    ? applications.reduce((sum, application) => sum + application.gwa, 0) / applications.length
    : 0;
  const averageUnits = applications.length
    ? applications.reduce((sum, application) => sum + application.units, 0) / applications.length
    : 0;

  return {
    totalApplications: applications.length,
    pendingReview: applications.filter((application) =>
      ['pending', 'under_review', 'escalated'].includes(application.status),
    ).length,
    approvedApplications: statusCounts.approved ?? 0,
    rejectedApplications: statusCounts.rejected ?? 0,
    slaBreaches: applications.filter((application) => application.slaWarning).length,
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
    getAuditLogs(),
  ]);

  const fallback = buildAdminAnalytics(applications, auditLogs);

  return getJson<AdminAnalytics>('/admin/analytics', fallback);
}
