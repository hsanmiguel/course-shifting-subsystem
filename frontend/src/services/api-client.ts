import { CourseCatalogItem, EligibilityCheckResult, ShiftingApplication, SubjectEquivalencyRecord } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_PATH = '/api/css';

export { BASE_URL };

type SubmissionRequest = {
  student_id: string;
  student_name: string;
  student_email?: string | null;
  phone_number?: string | null;
  current_program: string;
  current_year?: string | null;
  target_program: string;
  target_semester?: string | null;
  reason_for_shifting: string;
  self_reported_gpa?: number | string | null;
  self_reported_credits?: number | string | null;
  official_transcripts?: boolean;
  recommendation_letter?: boolean;
  additional_essays?: boolean;
  supporting_attachments?: {
    file_name: string;
    mime_type: string;
    size_bytes: number;
    data_url: string;
  }[];
  information_is_accurate?: boolean;
  understands_transfer_policies?: boolean;
  agrees_to_terms?: boolean;
};

type ApiErrorPayload = {
  status?: number;
  error_code?: string;
  message?: string;
  details?: {
    application_id?: string;
    application_status?: ShiftingApplication['status'];
    [key: string]: unknown;
  };
};

const RECOVERABLE_SUBMISSION_ERROR_CODES = new Set([
  'DEPENDENCY_UNAVAILABLE',
  'CURRICULUM_MAP_NOT_FOUND',
  'NO_SLOTS_AVAILABLE',
]);

// Get auth token from localStorage or env
function getAuthToken(): string {
  return localStorage.getItem('authToken') || import.meta.env.VITE_AUTH_TOKEN || '';
}

function createHeaders(headersInit?: HeadersInit) {
  const headers = new Headers(headersInit);
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function requestApi(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${API_PATH}${endpoint}`;

  return fetch(url, {
    ...options,
    headers: createHeaders(options.headers),
  });
}

function isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
  return typeof payload === 'object' && payload !== null && 'error_code' in payload;
}

function isRecoverableSubmissionPayload(payload: unknown): payload is ApiErrorPayload {
  if (!isApiErrorPayload(payload)) return false;

  const applicationId = payload.details?.application_id;
  return typeof applicationId === 'string' && RECOVERABLE_SUBMISSION_ERROR_CODES.has(payload.error_code ?? '');
}

function buildRecoveredSubmission(
  data: SubmissionRequest,
  payload: ApiErrorPayload
): ShiftingApplication {
  return {
    application_id: payload.details?.application_id ?? 'PENDING',
    student_id: data.student_id,
    student_name: data.student_name,
    student_email: data.student_email ?? null,
    phone_number: data.phone_number ?? null,
    current_program: data.current_program,
    current_year: data.current_year ?? null,
    target_program: data.target_program,
    target_semester: data.target_semester ?? null,
    reason_for_shifting: data.reason_for_shifting,
    self_reported_gpa:
      data.self_reported_gpa === undefined || data.self_reported_gpa === null || data.self_reported_gpa === ''
        ? null
        : Number(data.self_reported_gpa),
    self_reported_credits:
      data.self_reported_credits === undefined || data.self_reported_credits === null || data.self_reported_credits === ''
        ? null
        : Number(data.self_reported_credits),
    supporting_documents: {
      official_transcripts: data.official_transcripts ?? false,
      recommendation_letter: data.recommendation_letter ?? false,
      additional_essays: data.additional_essays ?? false,
    },
    supporting_attachments: data.supporting_attachments ?? [],
    acknowledgements: {
      information_is_accurate: data.information_is_accurate ?? false,
      understands_transfer_policies: data.understands_transfer_policies ?? false,
      agrees_to_terms: data.agrees_to_terms ?? false,
    },
    gwa: null,
    units_completed: null,
    has_failing_major: false,
    has_financial_hold: false,
    has_academic_alert: false,
    slot_available: false,
    status: payload.details?.application_status ?? 'pending',
    submitted_at: new Date().toISOString(),
    reviewed_by: null,
    decision_at: null,
    remarks: payload.message ?? null,
    waitlist_position:
      typeof payload.details?.waitlist_position === 'number' ? payload.details.waitlist_position : null,
    rejection_reason_code: null,
  };
}

// Fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await requestApi(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// API Endpoints
export const apiClient = {
  // Applications
  async submitApplication(data: SubmissionRequest) {
    const response = await requestApi('/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok && !isRecoverableSubmissionPayload(payload)) {
      return payload as ShiftingApplication;
    }

    if (isRecoverableSubmissionPayload(payload)) {
      const applicationId = payload.details?.application_id;

      if (applicationId) {
        try {
          return await fetchApi<ShiftingApplication>(`/applications/${applicationId}`);
        } catch {
          return buildRecoveredSubmission(data, payload);
        }
      }
    }

    throw new Error(
      isApiErrorPayload(payload) && payload.message
        ? payload.message
        : `API error: ${response.status}`
    );
  },

  async listApplications(filters?: {
    studentId?: string;
    status?: string;
    targetProgram?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.targetProgram) params.append('targetProgram', filters.targetProgram);

    return fetchApi<{ data: ShiftingApplication[] }>(
      `/applications?${params.toString()}`
    );
  },

  async getApplication(applicationId: string) {
    return fetchApi<ShiftingApplication>(`/applications/${applicationId}`);
  },

  async getEquivalency(applicationId: string) {
    return fetchApi<SubjectEquivalencyRecord>(
      `/applications/${applicationId}/equivalency`
    );
  },

  async getAuditLogs(applicationId: string) {
    return fetchApi<{ data: any[] }>(`/applications/${applicationId}/audits`);
  },

  async getAllAuditLogs() {
    return fetchApi<{ data: any[] }>('/audit-logs');
  },

  async checkEligibility(data: {
    student_id: string;
    current_program: string;
    target_program: string;
  }) {
    return fetchApi<EligibilityCheckResult>('/eligibility-check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listCatalogCourses() {
    return fetchApi<{ data: CourseCatalogItem[] }>('/catalog');
  },

  async reviewApplication(
    applicationId: string,
    data: {
      decision: 'approved' | 'rejected';
      remarks?: string;
    }
  ) {
    return fetchApi<ShiftingApplication>(
      `/applications/${applicationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Auth
  setAuthToken(token: string) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },

  clearAuthToken() {
    localStorage.removeItem('authToken');
  },

  getAuthToken() {
    return getAuthToken();
  },
};
