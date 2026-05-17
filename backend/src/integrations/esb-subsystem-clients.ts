import type {
  AcademicAlertPayload,
  CurriculumSubject,
  FinancialHoldPayload,
  ShiftApplication,
  SlotPayload,
  StudentAcademicProfile,
  SubjectEquivalencyRecord,
  SubjectRecord
} from "../domain/models.js";
import { AppError, DependencyError } from "../errors/app-error.js";
import type { SubsystemClients } from "./subsystem-clients.js";

type JsonObject = Record<string, unknown>;

interface EsbSubsystemClientOptions {
  srmStudentsUrl: string;
  cmsCatalogUrl: string;
  sfwStudentStatusUrlTemplate: string;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;

export class EsbSubsystemClients implements SubsystemClients {
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(
    private readonly fallback: SubsystemClients,
    private readonly options: EsbSubsystemClientOptions
  ) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? DEFAULT_RETRIES;
  }

  async getStudentAcademicProfile(studentId: string): Promise<StudentAcademicProfile> {
    const payload = await this.fetchJson(this.options.srmStudentsUrl, "SRM");
    const students = extractCollection(payload, ["students", "data", "results", "items", "records"]);
    const student = students.find((record) => sameId(readStudentId(record), studentId));

    if (!student) {
      throw new AppError(404, "STUDENT_PROFILE_NOT_FOUND", "Student academic profile was not found in SRM.", {
        student_id: studentId,
        endpoint_attempted: this.options.srmStudentsUrl
      });
    }

    return normalizeStudentAcademicProfile(student, studentId, this.options.srmStudentsUrl);
  }

  async getFinancialHold(studentId: string): Promise<FinancialHoldPayload> {
    const endpoint = this.options.sfwStudentStatusUrlTemplate.replace(":id", encodeURIComponent(studentId));
    const payload = await this.fetchJson(endpoint, "SFW");
    const record = asObject(payload);

    if (record && hasEsbError(record)) {
      throw new AppError(404, "FINANCIAL_STATUS_NOT_FOUND", "Student financial status was not found in SFW.", {
        student_id: studentId,
        endpoint_attempted: endpoint,
        esb_error: readString(record, ["error"]) ?? readString(record, ["message"])
      });
    }

    return normalizeFinancialHold(record ?? {}, studentId);
  }

  async getCurriculum(programId: string): Promise<CurriculumSubject[]> {
    const payload = await this.fetchJson(this.options.cmsCatalogUrl, "CMS");
    const courses = extractCollection(payload, ["courses", "catalog", "curriculum", "subjects", "data", "results", "items", "records"]);
    return normalizeCurriculum(courses, programId);
  }

  async getAcademicAlerts(studentId: string): Promise<AcademicAlertPayload> {
    return this.fallback.getAcademicAlerts(studentId);
  }

  async getProgramSlots(programId: string): Promise<SlotPayload> {
    return this.fallback.getProgramSlots(programId);
  }

  async sendDecisionNotice(application: ShiftApplication): Promise<void> {
    return this.fallback.sendDecisionNotice(application);
  }

  async sendWaitlistNotice(application: ShiftApplication): Promise<void> {
    return this.fallback.sendWaitlistNotice(application);
  }

  async sendSlaReminder(application: ShiftApplication, stage: "48h" | "72h"): Promise<void> {
    return this.fallback.sendSlaReminder(application, stage);
  }

  async updateEnrollment(application: ShiftApplication, equivalency: SubjectEquivalencyRecord | null): Promise<void> {
    return this.fallback.updateEnrollment(application, equivalency);
  }

  async deductSlot(programId: string): Promise<void> {
    return this.fallback.deductSlot(programId);
  }

  async adjustFinance(application: ShiftApplication): Promise<void> {
    return this.fallback.adjustFinance(application);
  }

  async notifyAdministrator(payload: Record<string, unknown>): Promise<void> {
    return this.fallback.notifyAdministrator(payload);
  }

  private async fetchJson(endpoint: string, dependency: string): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(endpoint, {
          headers: { Accept: "application/json" },
          signal: controller.signal
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          if (response.status >= 500 || response.status === 429) {
            lastError = new Error(`ESB responded with ${response.status}`);
            continue;
          }

          throw new DependencyError(dependency, endpoint, `ESB request failed with ${response.status}`);
        }

        return payload;
      } catch (error) {
        lastError = error;
        if (error instanceof DependencyError) {
          throw error;
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    const message = lastError instanceof Error ? lastError.message : "ESB request failed";
    throw new DependencyError(dependency, endpoint, message);
  }
}

function normalizeStudentAcademicProfile(record: JsonObject, studentId: string, endpoint: string): StudentAcademicProfile {
  const candidates = objectCandidates(record, ["academic_profile", "academicProfile", "profile", "academics", "student"]);
  const gwa = readNumberFrom(candidates, ["gwa", "gpa", "general_weighted_average", "generalWeightedAverage"]);
  const unitsCompleted = readNumberFrom(candidates, ["units_completed", "unitsCompleted", "completed_units", "completedUnits", "total_units", "totalUnits"]);

  if (gwa === undefined || unitsCompleted === undefined) {
    throw new DependencyError("SRM", endpoint, "SRM student payload is missing GWA or completed units");
  }

  return {
    gwa,
    units_completed: unitsCompleted,
    academic_standing: readStringFrom(candidates, ["academic_standing", "academicStanding", "standing"]) ?? "unknown",
    subjects: normalizeSubjects(record)
  };
}

function normalizeFinancialHold(record: JsonObject, studentId: string): FinancialHoldPayload {
  const candidates = objectCandidates(record, ["financial_status", "financialStatus", "status", "account", "wallet"]);
  const status = readStringFrom(candidates, ["status", "financial_status", "financialStatus", "clearance_status", "clearanceStatus"]);
  const balance = readNumberFrom(candidates, ["balance", "outstanding_balance", "outstandingBalance", "amount_due", "amountDue"]);
  const explicitHold = readBooleanFrom(candidates, [
    "has_financial_hold",
    "hasFinancialHold",
    "financial_hold",
    "financialHold",
    "has_hold",
    "hasHold",
    "on_hold",
    "onHold"
  ]);

  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const statusMeansHold = ["hold", "blocked", "unpaid", "overdue", "outstanding", "delinquent", "suspended"].some((value) =>
    normalizedStatus.includes(value)
  );
  const statusMeansClear = ["clear", "cleared", "paid", "good", "active", "no_hold", "no hold"].some((value) =>
    normalizedStatus.includes(value)
  );
  const inferredHold = statusMeansHold || (!statusMeansClear && typeof balance === "number" && balance > 0);
  const hasFinancialHold = explicitHold ?? inferredHold;

  return {
    has_financial_hold: hasFinancialHold,
    hold_type: hasFinancialHold ? readStringFrom(candidates, ["hold_type", "holdType", "reason", "status"]) ?? "UNPAID_BALANCE" : undefined,
    finance_wallet_url:
      readStringFrom(candidates, ["finance_wallet_url", "financeWalletUrl", "wallet_url", "walletUrl", "url"]) ??
      `https://esb-cjnx.onrender.com/api/esb/sfw/students/${encodeURIComponent(studentId)}/status`
  };
}

function normalizeCurriculum(courses: JsonObject[], programId: string): CurriculumSubject[] {
  const targetProgram = programId.trim().toLowerCase();
  const programAwareCourses = courses.filter((course) => {
    const courseProgram = readString(course, ["program_id", "programId", "program", "degree_program", "degreeProgram"]);
    return !courseProgram || courseProgram.trim().toLowerCase() === targetProgram;
  });

  return programAwareCourses.flatMap((course) => {
    const status = readString(course, ["status", "state"]);
    if (status && status.trim().toLowerCase() !== "active") {
      return [];
    }

    const subjectCode = readString(course, ["subject_code", "subjectCode", "course_code", "courseCode", "code"]);
    const subjectName = readString(course, ["subject_name", "subjectName", "course_name", "courseName", "name", "title"]);
    const units = readNumber(course, ["units", "credits", "credit_units", "creditUnits"]);

    if (!subjectCode || !subjectName || units === undefined) {
      return [];
    }

    return [
      {
        subject_code: subjectCode,
        subject_name: subjectName,
        units,
        equivalents: extractEquivalentCodes(course)
      }
    ];
  });
}

function normalizeSubjects(record: JsonObject): SubjectRecord[] {
  const subjects = objectCandidates(record, ["academic_profile", "academicProfile", "profile", "academics", "student"]).flatMap((candidate) =>
    extractCollection(candidate, ["subjects", "courses", "grades", "transcript", "academic_records", "academicRecords"])
  );

  return subjects.flatMap((subject) => {
    const subjectCode = readString(subject, ["subject_code", "subjectCode", "course_code", "courseCode", "code"]);
    const subjectName = readString(subject, ["subject_name", "subjectName", "course_name", "courseName", "name", "title"]);
    const units = readNumber(subject, ["units", "credits", "credit_units", "creditUnits"]) ?? 0;
    const grade = normalizeGrade(readUnknown(subject, ["grade", "final_grade", "finalGrade", "mark"]));

    if (!subjectCode || !subjectName || grade === undefined) {
      return [];
    }

    return [
      {
        subject_code: subjectCode,
        subject_name: subjectName,
        units,
        grade,
        category: normalizeCategory(readString(subject, ["category", "type", "classification"]))
      }
    ];
  });
}

function extractEquivalentCodes(course: JsonObject): string[] {
  const equivalents = readUnknown(course, ["equivalents", "equivalent_codes", "equivalentCodes", "prerequisites"]);
  if (!Array.isArray(equivalents)) {
    return [];
  }

  return equivalents.flatMap((equivalent) => {
    if (typeof equivalent === "string" && equivalent.trim()) {
      return [equivalent.trim()];
    }

    const record = asObject(equivalent);
    const code = record ? readString(record, ["subject_code", "subjectCode", "course_code", "courseCode", "code"]) : undefined;
    return code ? [code] : [];
  });
}

function extractCollection(payload: unknown, keys: string[]): JsonObject[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => (asObject(item) ? [asObject(item)!] : []));
  }

  const object = asObject(payload);
  if (!object) {
    return [];
  }

  for (const key of keys) {
    const value = object[key];
    if (Array.isArray(value)) {
      return value.flatMap((item) => (asObject(item) ? [asObject(item)!] : []));
    }

    const nested = asObject(value);
    if (nested) {
      const nestedCollection = extractCollection(nested, keys);
      if (nestedCollection.length) {
        return nestedCollection;
      }
    }
  }

  return [];
}

function objectCandidates(record: JsonObject, nestedKeys: string[]): JsonObject[] {
  return [record, ...nestedKeys.flatMap((key) => (asObject(record[key]) ? [asObject(record[key])!] : []))];
}

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : null;
}

function readStudentId(record: JsonObject): string | undefined {
  const value = readUnknown(record, ["student_id", "studentId", "student_number", "studentNumber", "student_no", "studentNo", "id"]);
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function sameId(left: string | undefined, right: string): boolean {
  return left?.trim().toLowerCase() === right.trim().toLowerCase();
}

function hasEsbError(record: JsonObject): boolean {
  return typeof record.error === "string" || typeof record.error_code === "string";
}

function readStringFrom(candidates: JsonObject[], keys: string[]): string | undefined {
  for (const candidate of candidates) {
    const value = readString(candidate, keys);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function readNumberFrom(candidates: JsonObject[], keys: string[]): number | undefined {
  for (const candidate of candidates) {
    const value = readNumber(candidate, keys);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function readBooleanFrom(candidates: JsonObject[], keys: string[]): boolean | undefined {
  for (const candidate of candidates) {
    const value = readBoolean(candidate, keys);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function readUnknown(record: JsonObject, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function readString(record: JsonObject, keys: string[]): string | undefined {
  const value = readUnknown(record, keys);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readNumber(record: JsonObject, keys: string[]): number | undefined {
  const value = readUnknown(record, keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readBoolean(record: JsonObject, keys: string[]): boolean | undefined {
  const value = readUnknown(record, keys);
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y", "1", "hold", "blocked"].includes(normalized)) {
      return true;
    }
    if (["false", "no", "n", "0", "clear", "cleared", "paid", "no_hold", "no hold"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function normalizeGrade(value: unknown): number | "INC" | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized === "INC") {
      return "INC";
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeCategory(value: string | undefined): "major" | "minor" | "general" {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.includes("major")) {
    return "major";
  }
  if (normalized.includes("minor")) {
    return "minor";
  }
  return "general";
}
