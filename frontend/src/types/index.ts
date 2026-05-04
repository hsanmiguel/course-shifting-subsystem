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
