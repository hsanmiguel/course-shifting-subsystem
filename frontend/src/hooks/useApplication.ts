import { useEffect, useState } from 'react';
import { ShiftingApplication, CourseEquivalency } from '@/types';
import { apiClient } from '@/services/api-client';

interface UseApplicationResult {
  application: ShiftingApplication | null;
  equivalencies: CourseEquivalency[];
  auditLogs: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApplication(applicationId: string): UseApplicationResult {
  const [application, setApplication] = useState<ShiftingApplication | null>(null);
  const [equivalencies, setEquivalencies] = useState<CourseEquivalency[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appData, eqData] = await Promise.all([
        apiClient.getApplication(applicationId),
        apiClient.getEquivalency(applicationId),
      ]);

      setApplication(appData);
      setEquivalencies(Array.isArray(eqData) ? eqData : (eqData.credited_subjects || []));

      // Only fetch audit logs if user has permission
      try {
        const auditData = await apiClient.getAuditLogs(applicationId);
        setAuditLogs(auditData.data || []);
      } catch {
        // User may not have permission to view audit logs
        setAuditLogs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  return {
    application,
    equivalencies,
    auditLogs,
    loading,
    error,
    refetch: fetchApplication,
  };
}
