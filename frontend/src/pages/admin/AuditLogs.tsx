import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Label, Spinner } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AuditLogEntry } from '@/types';
import { authService } from '@/services/auth';
import { getAuditLogs } from './api';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  const displayName = currentUser?.name || 'System Administrator';
  const displayId = currentUser?.id || 'ADM-2021-00001';

  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        setError(null);
        setLogs(await getAuditLogs());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs');
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return logs;

    return logs.filter((log) =>
      [log.applicationId, log.studentName, log.studentId, log.actor, log.details]
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [logs, search]);

  return (
    <SidebarLayout
      title="Audit Logs"
      subtitle="All application status changes and system events"
      userRole="admin"
      userName={displayName}
      studentId={displayId}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {isLoading && (
          <Card className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Spinner size="sm" />
              <span>Loading audit logs...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="rounded-md border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="font-semibold text-red-900">Unable to load audit logs</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </Card>
        )}

        <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-5">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="audit-search" className="text-sm font-medium text-slate-700">Search</Label>
                <Input
                  id="audit-search"
                  placeholder="Search by application ID or student name..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="action-type" className="text-sm font-medium text-slate-700">Action Type</Label>
                <Input id="action-type" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-700">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input aria-label="Start date" />
                  <Input aria-label="End date" />
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] table-fixed text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="w-[16%] px-5 py-4 text-left font-semibold">Timestamp</th>
                    <th className="w-[13%] px-5 py-4 text-left font-semibold">Application ID</th>
                    <th className="w-[12%] px-5 py-4 text-left font-semibold">Student Name</th>
                    <th className="w-[12%] px-5 py-4 text-left font-semibold">Action</th>
                    <th className="w-[13%] px-5 py-4 text-left font-semibold">Actor</th>
                    <th className="w-[34%] px-5 py-4 text-left font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {!isLoading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="bg-white align-middle">
                      <td className="px-5 py-5 font-medium text-slate-600">{log.timestamp}</td>
                      <td className="px-5 py-5 font-medium text-slate-950">{log.applicationId}</td>
                      <td className="px-5 py-5">
                        <p className="font-medium text-slate-950">{log.studentName}</p>
                        <p className="mt-1 text-xs text-slate-500">{log.studentId}</p>
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={log.action} />
                      </td>
                      <td className="px-5 py-5">
                        <p className="font-medium text-slate-950">{log.actor}</p>
                        <p className="mt-1 text-xs text-slate-500">{log.actorRole}</p>
                      </td>
                      <td className="px-5 py-5">
                        <p className="whitespace-pre-line leading-6 text-slate-700">{log.details}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {log.fromStatus} &gt; {log.toStatus}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </div>
    </SidebarLayout>
  );
}
