import { useEffect, useState } from 'react';
import { ShiftingApplication, DashboardStats } from '@/types';
import { apiClient } from '@/services/api-client';

function getApplicationTimestamp(application: ShiftingApplication) {
  const submittedAt = new Date(application.submitted_at).getTime();
  if (Number.isFinite(submittedAt)) {
    return submittedAt;
  }

  const decisionAt = application.decision_at ? new Date(application.decision_at).getTime() : Number.NaN;
  if (Number.isFinite(decisionAt)) {
    return decisionAt;
  }

  return 0;
}

function sortApplicationsNewestFirst(applications: ShiftingApplication[]) {
  return [...applications].sort((left, right) => {
    const timeDelta = getApplicationTimestamp(right) - getApplicationTimestamp(left);
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return right.application_id.localeCompare(left.application_id);
  });
}

interface UseApplicationsResult {
  applications: ShiftingApplication[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApplications(studentId?: string): UseApplicationsResult {
  const [applications, setApplications] = useState<ShiftingApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async (options: { silent?: boolean } = {}) => {
    try {
      const showLoading = !options.silent && applications.length === 0;
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await apiClient.listApplications({ studentId });
      const apps = sortApplicationsNewestFirst(response.data || []);
      setApplications(apps);

      // Calculate stats
      const newStats: DashboardStats = {
        total: apps.length,
        pending: apps.filter((a) => a.status === 'under_review').length,
        approved: apps.filter((a) => a.status === 'approved').length,
        rejected: apps.filter((a) => a.status === 'rejected').length,
      };
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) {
      setApplications([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      setLoading(false);
      setError(null);
      return;
    }

    fetchApplications();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const refreshOnFocus = () => {
      void fetchApplications({ silent: true });
    };

    const refreshOnVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchApplications({ silent: true });
      }
    };

    const refreshInterval = window.setInterval(() => {
      void fetchApplications({ silent: true });
    }, 15000);

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibilityChange);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibilityChange);
    };
  }, [studentId, applications.length]);

  return {
    applications,
    stats,
    loading,
    error,
    refetch: fetchApplications,
  };
}
