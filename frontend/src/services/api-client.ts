import { ShiftingApplication, SubjectEquivalencyRecord } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_PATH = '/api/css';

export { BASE_URL };

// Get auth token from localStorage or env
function getAuthToken(): string {
  return localStorage.getItem('authToken') || import.meta.env.VITE_AUTH_TOKEN || '';
}

// Fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${API_PATH}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// API Endpoints
export const apiClient = {
  // Applications
  async submitApplication(data: {
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
    information_is_accurate?: boolean;
    understands_transfer_policies?: boolean;
    agrees_to_terms?: boolean;
  }) {
    return fetchApi<ShiftingApplication>('/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return fetchApi<any>('/eligibility-check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
