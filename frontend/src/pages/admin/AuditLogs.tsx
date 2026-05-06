import type { DateValue, Key } from '@heroui/react';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DateField,
  DateRangePicker,
  Input,
  Label,
  ListBox,
  RangeCalendar,
  Select,
  Spinner,
} from '@heroui/react';
import { Activity, CalendarDays, Filter, Search, X } from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AuditLogEntry } from '@/types';
import { authService } from '@/services/auth';
import { getAuditLogs } from './api';

type AuditDateRange = {
  start: DateValue;
  end: DateValue;
};

const actionOptions = [
  { id: 'all', label: 'All actions' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'escalated', label: 'Escalated' },
  { id: 'status_change', label: 'Status change' },
  { id: 'waitlisted', label: 'Waitlisted' },
];

const selectPopoverClass = 'z-50 max-h-72 overflow-y-auto';

function getSelectValue(value: Key | Key[] | null) {
  if (Array.isArray(value)) return 'all';
  return value?.toString() ?? 'all';
}

function parseLogDate(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRangeBoundary(value: DateValue, boundary: 'start' | 'end') {
  const date = new Date(value.toString());

  if (boundary === 'start') {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date.getTime();
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState<AuditDateRange | null>(null);
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
    const rangeStart = dateRange ? getRangeBoundary(dateRange.start, 'start') : null;
    const rangeEnd = dateRange ? getRangeBoundary(dateRange.end, 'end') : null;

    return logs.filter((log) => {
      const matchesSearch =
        !normalizedSearch ||
        [log.applicationId, log.studentName, log.studentId, log.actor, log.actorRole, log.details]
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const logDate = parseLogDate(log.timestamp);
      const matchesDate =
        !rangeStart ||
        !rangeEnd ||
        (logDate && logDate.getTime() >= rangeStart && logDate.getTime() <= rangeEnd);

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, search, actionFilter, dateRange]);

  const hasActiveFilters = !!search.trim() || actionFilter !== 'all' || !!dateRange;

  function clearFilters() {
    setSearch('');
    setActionFilter('all');
    setDateRange(null);
  }

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
          <Card.Content className="gap-5 p-5">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 p-2 text-slate-600">
                    <Filter className="h-4 w-4" />
                  </span>
                  <p className="font-semibold text-slate-950">Filter audit trail</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Showing {filteredLogs.length} of {logs.length} system events
                </p>
              </div>

              {hasActiveFilters && (
                <Button size="sm" variant="secondary" onPress={clearFilters}>
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_1.2fr]">
              <div className="flex flex-col gap-1">
                <Label htmlFor="audit-search" className="text-sm font-medium text-slate-700">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="audit-search"
                    className="w-full pl-9"
                    placeholder="Search application ID, student, actor, or details"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <Select
                className="w-full"
                placeholder="Select action type"
                value={actionFilter}
                onChange={(value) => setActionFilter(getSelectValue(value))}
              >
                <Label>Action Type</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className={selectPopoverClass} placement="bottom start">
                  <ListBox>
                    {actionOptions.map((option) => (
                      <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                        {option.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <DateRangePicker
                className="w-full"
                endName="auditEndDate"
                startName="auditStartDate"
                value={dateRange}
                onChange={setDateRange}
              >
                <Label>Date Range</Label>
                <DateField.Group fullWidth>
                  <DateField.Input slot="start">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateRangePicker.RangeSeparator />
                  <DateField.Input slot="end">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DateRangePicker.Trigger aria-label="Open audit date range calendar">
                      <DateRangePicker.TriggerIndicator />
                    </DateRangePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DateRangePicker.Popover className="z-50" placement="bottom end">
                  <RangeCalendar aria-label="Audit log date range">
                    <RangeCalendar.Header>
                      <RangeCalendar.YearPickerTrigger>
                        <RangeCalendar.YearPickerTriggerHeading />
                        <RangeCalendar.YearPickerTriggerIndicator />
                      </RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.NavButton slot="previous" />
                      <RangeCalendar.NavButton slot="next" />
                    </RangeCalendar.Header>
                    <RangeCalendar.Grid>
                      <RangeCalendar.GridHeader>
                        {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                      </RangeCalendar.GridHeader>
                      <RangeCalendar.GridBody>
                        {(date) => <RangeCalendar.Cell date={date} />}
                      </RangeCalendar.GridBody>
                    </RangeCalendar.Grid>
                    <RangeCalendar.YearPickerGrid>
                      <RangeCalendar.YearPickerGridBody>
                        {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                      </RangeCalendar.YearPickerGridBody>
                    </RangeCalendar.YearPickerGrid>
                  </RangeCalendar>
                </DateRangePicker.Popover>
              </DateRangePicker>
            </div>
          </Card.Content>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="flex-row items-center gap-3 p-4">
              <span className="rounded-md bg-blue-50 p-2 text-blue-700">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visible Events</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{filteredLogs.length}</p>
              </div>
            </Card.Content>
          </Card>
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="flex-row items-center gap-3 p-4">
              <span className="rounded-md bg-amber-50 p-2 text-amber-700">
                <Filter className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action Filter</p>
                <p className="mt-1 font-semibold capitalize text-slate-950">{actionFilter.replace(/_/g, ' ')}</p>
              </div>
            </Card.Content>
          </Card>
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="flex-row items-center gap-3 p-4">
              <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date Window</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {dateRange ? `${dateRange.start.toString()} to ${dateRange.end.toString()}` : 'All dates'}
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <Card.Content className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="font-semibold text-slate-950">Audit Event History</p>
              <p className="mt-1 text-sm text-slate-500">Chronological review actions and system updates</p>
            </div>
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
