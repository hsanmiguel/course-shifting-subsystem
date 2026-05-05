import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/rbac.js";
import type { ShiftingService } from "../services/shifting-service.js";

function mapApplication(app: any) {
  return {
    id: app.application_id,
    studentId: app.student_id,
    studentName: app.student_name,
    currentProgram: app.current_program,
    targetProgram: app.target_program,
    gwa: app.gwa ?? 0,
    units: app.units_completed ?? 0,
    reason: app.reason_for_shifting ?? "",
    status: app.status,
    submittedAt: app.submitted_at,
    assignedTo: app.reviewed_by ?? undefined,
    eligibilityChecks: [],
  };
}

function mapAudit(entry: any) {
  const mapAction = (action: string) => {
    const a = action?.toUpperCase() ?? "";
    if (a.includes("APPROV")) return "approved";
    if (a.includes("REJECT")) return "rejected";
    if (a.includes("ESCAL")) return "escalated";
    if (a.includes("WAITLIST")) return "waitlisted";
    return "status_change";
  };

  const details = typeof entry.details === "string" ? entry.details : JSON.stringify(entry.details || {});

  return {
    id: entry.id,
    timestamp: new Date(entry.timestamp).toLocaleString(),
    applicationId: entry.application_id,
    studentName: "",
    studentId: "",
    action: mapAction(entry.action),
    actor: entry.actor_id ?? "",
    actorRole: entry.actor_role ?? "",
    details,
    fromStatus: "",
    toStatus: "",
  };
}

export function createAdminRouter(service: ShiftingService) {
  const router = Router();

  // Return a list of applications (admin view)
  router.get("/admin/applications", authenticate, allowRoles("department_head", "registrar", "system_admin"), async (req, res, next) => {
    try {
      const apps = await service.listApplications();
      return res.json(mapApplicationsPayload(apps));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/admin/audit-logs", authenticate, allowRoles("department_head", "registrar", "system_admin"), async (req, res, next) => {
    try {
      const logs = await service.getAllAuditLogs();
      return res.json(mapAuditPayload(logs));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/admin/analytics", authenticate, allowRoles("department_head", "registrar", "system_admin"), async (req, res, next) => {
    try {
      const apps = await service.listApplications();
      const logs = await service.getAllAuditLogs();

      const analytics = buildAnalytics(apps, logs);
      return res.json(analytics);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

function mapApplicationsPayload(apps: any[]) {
  return apps.map(mapApplication);
}

function mapAuditPayload(entries: any[]) {
  return entries.map(mapAudit);
}

function buildAnalytics(apps: any[], logs: any[]) {
  const totalApplications = apps.length;
  const pendingReview = apps.filter((a) => ["pending", "under_review", "escalated"].includes(a.status)).length;
  const statusCounts = apps.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const targetProgramCounts = apps.reduce<Record<string, number>>((acc, app) => {
    acc[app.target_program] = (acc[app.target_program] ?? 0) + 1;
    return acc;
  }, {});

  const averageGwa = apps.length ? apps.reduce((s, a) => s + (a.gwa ?? 0), 0) / apps.length : 0;
  const averageUnits = apps.length ? apps.reduce((s, a) => s + (a.units_completed ?? 0), 0) / apps.length : 0;

  return {
    totalApplications,
    pendingReview,
    approvedApplications: statusCounts.approved ?? 0,
    rejectedApplications: statusCounts.rejected ?? 0,
    slaBreaches: 0,
    averageGwa: Number(averageGwa.toFixed(2)),
    averageUnits: Number(averageUnits.toFixed(0)),
    targetProgramDemand: Object.entries(targetProgramCounts).map(([program, count]) => ({ program, count })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    recentEvents: mapAuditPayload(logs).slice(0, 4),
  };
}
