import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Course Shifting Types
export interface ShiftingApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  currentCourses: string;
  desiredCourses: string;
  reason: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approverName?: string;
  approverNotes?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CourseEquivalency {
  id: string;
  currentSubject: string;
  currentSubjectCode: string;
  equivalentSubject: string;
  equivalentSubjectCode: string;
  credits: number;
  status: 'approved' | 'pending' | 'rejected';
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
