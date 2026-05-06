import type { EligibilityCheckInput, ReviewDecisionInput, ShiftApplicationInput } from "../domain/models.js";
import { AppError } from "../errors/app-error.js";

const studentIdPattern = /^STU-\d{4}-\d{4,5}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(body: Record<string, unknown>, field: string, schemaErrors: Array<Record<string, unknown>>) {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    schemaErrors.push({
      field,
      expected_type: "string",
      received_type: typeof value,
      received_value: value
    });
    return null;
  }

  return value.trim();
}

function optionalNumber(body: Record<string, unknown>, field: string, schemaErrors: Array<Record<string, unknown>>) {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) {
    schemaErrors.push({
      field,
      expected_type: "number",
      received_type: typeof value,
      received_value: value
    });
    return null;
  }

  return parsed;
}

function optionalBoolean(body: Record<string, unknown>, field: string, fallback = false) {
  return typeof body[field] === "boolean" ? body[field] : fallback;
}

function validateSupportingAttachments(body: Record<string, unknown>, field: string, schemaErrors: Array<Record<string, unknown>>) {
  const value = body[field];

  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (!Array.isArray(value)) {
    schemaErrors.push({
      field,
      expected_type: "array",
      received_type: typeof value,
      received_value: value
    });
    return [];
  }

  const attachments: NonNullable<ShiftApplicationInput["supporting_attachments"]> = [];

  value.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      schemaErrors.push({
        field: `${field}[${index}]`,
        expected_type: "object",
        received_type: typeof item,
        received_value: item
      });
      return;
    }

    const record = item as Record<string, unknown>;
    const fileName = record.file_name;
    const mimeType = record.mime_type;
    const sizeBytes = record.size_bytes;
    const dataUrl = record.data_url;

    if (typeof fileName !== "string" || fileName.trim().length === 0) {
      schemaErrors.push({ field: `${field}[${index}].file_name`, expected_type: "string", received_type: typeof fileName, received_value: fileName });
    }
    if (typeof mimeType !== "string" || mimeType.trim().length === 0) {
      schemaErrors.push({ field: `${field}[${index}].mime_type`, expected_type: "string", received_type: typeof mimeType, received_value: mimeType });
    }
    if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes < 0) {
      schemaErrors.push({ field: `${field}[${index}].size_bytes`, expected_type: "non-negative number", received_type: typeof sizeBytes, received_value: sizeBytes });
    }
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      schemaErrors.push({ field: `${field}[${index}].data_url`, expected_type: "data url string", received_type: typeof dataUrl, received_value: dataUrl });
    }

    if (
      typeof fileName === "string" &&
      typeof mimeType === "string" &&
      typeof sizeBytes === "number" &&
      Number.isFinite(sizeBytes) &&
      sizeBytes >= 0 &&
      typeof dataUrl === "string" &&
      dataUrl.startsWith("data:")
    ) {
      attachments.push({
        file_name: fileName.trim(),
        mime_type: mimeType.trim(),
        size_bytes: sizeBytes,
        data_url: dataUrl
      });
    }
  });

  return attachments;
}

export function validateApplicationPayload(payload: unknown): ShiftApplicationInput {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: body must be a JSON object.", {
      schema_errors: [{ field: "body", expected_type: "object", received_type: typeof payload }]
    });
  }

  const body = payload as Record<string, unknown>;
  const fieldErrors: Array<{ field: string; issue: string }> = [];
  const schemaErrors: Array<Record<string, unknown>> = [];

  const requiredFields = ["student_id", "student_name", "current_program", "target_program", "reason_for_shifting"] as const;

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === "") {
      fieldErrors.push({ field, issue: "Field is required and cannot be empty." });
    } else if (typeof body[field] !== "string") {
      schemaErrors.push({
        field,
        expected_type: "string",
        received_type: typeof body[field],
        received_value: body[field]
      });
    }
  }

  if (fieldErrors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Application submission failed: missing required fields.", {
      field_errors: fieldErrors
    });
  }

  if (schemaErrors.length > 0) {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: one or more fields have invalid data types.", {
      schema_errors: schemaErrors
    });
  }

  if (!studentIdPattern.test(String(body.student_id))) {
    throw new AppError(400, "VALIDATION_ERROR", "Application submission failed: missing required fields.", {
        field_errors: [{ field: "student_id", issue: "Invalid format. Expected pattern: STU-YYYY-NNNN or STU-YYYY-NNNNN." }]
      });
  }

  if (![body.student_name, body.current_program, body.target_program].every(isNonEmptyString)) {
    throw new AppError(400, "VALIDATION_ERROR", "Application submission failed: missing required fields.", {
      field_errors: requiredFields.map((field) => ({
        field,
        issue: "Field is required and cannot be empty."
      }))
    });
  }

  const studentEmail = optionalString(body, "student_email", schemaErrors) ?? optionalString(body, "email", schemaErrors);
  const phoneNumber = optionalString(body, "phone_number", schemaErrors) ?? optionalString(body, "phone", schemaErrors);
  const currentYear = optionalString(body, "current_year", schemaErrors);
  const targetSemester = optionalString(body, "target_semester", schemaErrors);
  const selfReportedGpa = optionalNumber(body, "self_reported_gpa", schemaErrors) ?? optionalNumber(body, "gpa", schemaErrors);
  const selfReportedCredits =
    optionalNumber(body, "self_reported_credits", schemaErrors) ?? optionalNumber(body, "credits", schemaErrors);
  const supportingAttachments = validateSupportingAttachments(body, "supporting_attachments", schemaErrors);

  if (studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
    fieldErrors.push({ field: "student_email", issue: "Invalid email address." });
  }

  if (selfReportedGpa !== null && (selfReportedGpa < 0 || selfReportedGpa > 4)) {
    fieldErrors.push({ field: "self_reported_gpa", issue: "GPA must be between 0 and 4." });
  }

  if (selfReportedCredits !== null && selfReportedCredits < 0) {
    fieldErrors.push({ field: "self_reported_credits", issue: "Completed credits cannot be negative." });
  }

  if (fieldErrors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Application submission failed: invalid field values.", {
      field_errors: fieldErrors
    });
  }

  if (schemaErrors.length > 0) {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: one or more fields have invalid data types.", {
      schema_errors: schemaErrors
    });
  }

  return {
    student_id: String(body.student_id).trim(),
    student_name: String(body.student_name).trim(),
    student_email: studentEmail,
    phone_number: phoneNumber,
    current_program: String(body.current_program).trim().toUpperCase(),
    current_year: currentYear,
    target_program: String(body.target_program).trim().toUpperCase(),
    target_semester: targetSemester,
    reason_for_shifting: String(body.reason_for_shifting).trim(),
    self_reported_gpa: selfReportedGpa,
    self_reported_credits: selfReportedCredits,
    supporting_attachments: supportingAttachments,
    supporting_documents: {
      official_transcripts: optionalBoolean(body, "official_transcripts", true),
      recommendation_letter: optionalBoolean(body, "recommendation_letter", true),
      additional_essays: optionalBoolean(body, "additional_essays")
    },
    acknowledgements: {
      information_is_accurate: optionalBoolean(body, "information_is_accurate"),
      understands_transfer_policies: optionalBoolean(body, "understands_transfer_policies"),
      agrees_to_terms: optionalBoolean(body, "agrees_to_terms")
    }
  };
}

export function validateEligibilityPayload(payload: unknown): EligibilityCheckInput {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: body must be a JSON object.", {
      schema_errors: [{ field: "body", expected_type: "object", received_type: typeof payload }]
    });
  }

  const body = payload as Record<string, unknown>;
  const fieldErrors: Array<{ field: string; issue: string }> = [];
  const requiredFields = ["student_id", "current_program", "target_program"] as const;

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === "" || typeof body[field] !== "string") {
      fieldErrors.push({ field, issue: "Field is required and cannot be empty." });
    }
  }

  if (fieldErrors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Eligibility check failed: missing required fields.", {
      field_errors: fieldErrors
    });
  }

  if (!studentIdPattern.test(String(body.student_id))) {
    throw new AppError(400, "VALIDATION_ERROR", "Eligibility check failed: invalid student ID format.", {
        field_errors: [{ field: "student_id", issue: "Invalid format. Expected pattern: STU-YYYY-NNNN or STU-YYYY-NNNNN." }]
      });
  }

  return {
    student_id: String(body.student_id).trim(),
    current_program: String(body.current_program).trim().toUpperCase(),
    target_program: String(body.target_program).trim().toUpperCase()
  };
}

export function validateReviewPayload(payload: unknown): ReviewDecisionInput {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: body must be a JSON object.");
  }

  const body = payload as Record<string, unknown>;

  if (body.decision !== "approved" && body.decision !== "rejected") {
    throw new AppError(400, "VALIDATION_ERROR", "Review submission failed: invalid decision.", {
      field_errors: [{ field: "decision", issue: "Decision must be either approved or rejected." }]
    });
  }

  if (body.remarks !== undefined && typeof body.remarks !== "string") {
    throw new AppError(422, "SCHEMA_VALIDATION_FAILED", "Payload rejected: one or more fields have invalid data types.", {
      schema_errors: [{ field: "remarks", expected_type: "string", received_type: typeof body.remarks }]
    });
  }

  return {
    decision: body.decision,
    remarks: typeof body.remarks === "string" ? body.remarks.trim() : undefined
  };
}
