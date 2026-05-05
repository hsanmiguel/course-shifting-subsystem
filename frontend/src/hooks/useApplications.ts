import { useEffect, useState } from 'react';
import { ShiftingApplication, DashboardStats } from '@/types';
import { apiClient } from '@/services/api-client';

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

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listApplications({ studentId });
      const apps = response.data || [];
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
    fetchApplications();
  }, [studentId]);

  return {
    applications,
    stats,
    loading,
    error,
    refetch: fetchApplications,
  };
}
