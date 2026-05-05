import { apiClient } from '@/services/api-client';
import type { AdminAnalytics, AuditLogEntry, ShiftingApplication } from '@/types';

interface BackendAuditLog {
  id: string;
  application_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export async function getAdminApplications() {
  const response = await apiClient.listApplications();
  return response.data || [];
}

export async function getAuditLogs() {
  const [auditResponse, applicationResponse] = await Promise.all([
    apiClient.getAllAuditLogs(),
    apiClient.listApplications(),
  ]);
  const logs = (auditResponse.data || []) as BackendAuditLog[];
  const applicationMap = new Map(
    (applicationResponse.data || []).map((application) => [application.application_id, application]),
  );

  return logs.map<AuditLogEntry>((log) => ({
    id: log.id,
    timestamp: formatDateTime(log.timestamp),
    applicationId: log.application_id,
    studentName: applicationMap.get(log.application_id)?.student_name || 'Unknown student',
    studentId: applicationMap.get(log.application_id)?.student_id || 'Unknown ID',
    action: normalizeAuditAction(log.action),
    actor: log.actor_id,
    actorRole: log.actor_role,
    details: formatAuditDetails(log),
    fromStatus: '-',
    toStatus: '-',
  }));
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
    counts[application.target_program] = (counts[application.target_program] ?? 0) + 1;
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
