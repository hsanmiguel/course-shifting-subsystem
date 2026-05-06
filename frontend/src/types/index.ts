import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Course Shifting Types
export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'waitlisted'
  | 'awaiting_data'
  | 'pending_cms_update';

export interface ShiftingApplication {
  application_id: string;
  student_id: string;
  student_name: string;
  student_email: string | null;
  phone_number: string | null;
  current_program: string;
  current_year: string | null;
  target_program: string;
  target_semester: string | null;
  reason_for_shifting: string;
  self_reported_gpa: number | null;
  self_reported_credits: number | null;
  supporting_documents: {
    official_transcripts: boolean;
    recommendation_letter: boolean;
    additional_essays: boolean;
  };
  supporting_attachments?: {
    file_name: string;
    mime_type: string;
    size_bytes: number;
    data_url: string;
  }[];
  acknowledgements: {
    information_is_accurate: boolean;
    understands_transfer_policies: boolean;
    agrees_to_terms: boolean;
  };
  gwa: number | null;
  units_completed: number | null;
  has_failing_major: boolean;
  has_financial_hold: boolean;
  has_academic_alert: boolean;
  slot_available: boolean;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_by: string | null;
  decision_at: string | null;
  remarks: string | null;
  waitlist_position?: number | null;
  rejection_reason_code?: string | null;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CourseEquivalency {
  subject_code: string;
  equivalent_to: string;
  units: number;
  grade: number | 'INC';
  status: 'credited';
}

export interface SubjectEquivalencyRecord {
  equivalency_id: string;
  application_id: string;
  student_id: string;
  credited_subjects: CourseEquivalency[];
  retake_subjects: string[];
  new_units_required: number;
  generated_at: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  date: string;
}

export interface AdminApplication {
  id: string;
  studentId: string;
  studentName: string;
  currentProgram: string;
  targetProgram: string;
  gwa: number;
  units: number;
  reason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'escalated';
  submittedAt: string;
  assignedTo?: string;
  reviewerRemarks?: string;
  eligibilityChecks: {
    label: string;
    passed: boolean;
  }[];
  slaWarning?: {
    title: string;
    hoursPending: number;
    assignedTo: string;
    message: string;
    escalatedTo: string;
    timestamp: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  applicationId: string;
  studentName: string;
  studentId: string;
  action: 'approved' | 'rejected' | 'escalated' | 'status_change' | 'waitlisted';
  actor: string;
  actorRole: string;
  details: string;
  fromStatus: string;
  toStatus: string;
}

export interface AdminAnalytics {
  totalApplications: number;
  pendingReview: number;
  approvedApplications: number;
  rejectedApplications: number;
  slaBreaches: number;
  averageGwa: number;
  averageUnits: number;
  targetProgramDemand: {
    program: string;
    count: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
  }[];
  recentEvents: AuditLogEntry[];
}
