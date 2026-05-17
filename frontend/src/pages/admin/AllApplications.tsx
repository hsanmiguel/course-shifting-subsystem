import type { Key } from '@heroui/react';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Label, ListBox, Select, Spinner, TextArea } from '@heroui/react';
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Filter,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ShiftingApplication } from '@/types';
import { authService } from '@/services/auth';
import { getAdminApplications } from './api';
import { apiClient } from '@/services/api-client';
import { formatProgramName } from '@/constants/programs';

function formatDateTime(date?: string | null) {
  if (!date) return 'Not available';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString();
}

function hoursSince(date?: string | null) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  if (!Number.isFinite(parsed)) return 0;
  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60));
}

const statusFilterOptions = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'under_review', label: 'Under review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'waitlisted', label: 'Waitlisted' },
  { id: 'awaiting_data', label: 'Awaiting data' },
];

const filterPopoverClass = 'z-50 max-h-72 overflow-y-auto';

function getFilterValue(value: Key | Key[] | null) {
  if (Array.isArray(value)) return 'all';
  return value?.toString() ?? 'all';
}

export default function AllApplications() {
  const [applications, setApplications] = useState<ShiftingApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [targetProgramFilter, setTargetProgramFilter] = useState('all');
  const currentUser = authService.getCurrentUser();
  const displayName = currentUser?.name || 'System Administrator';
  const displayId = currentUser?.id || 'ADM-2021-00001';

  const targetProgramOptions = useMemo(
    () =>
      Array.from(new Set(applications.map((application) => application.target_program).filter(Boolean)))
        .sort((a, b) => formatProgramName(a).localeCompare(formatProgramName(b))),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        [
          application.student_name,
          application.student_id,
          application.application_id,
          formatProgramName(application.current_program),
          formatProgramName(application.target_program),
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const matchesTargetProgram = targetProgramFilter === 'all' || application.target_program === targetProgramFilter;

      return matchesSearch && matchesStatus && matchesTargetProgram;
    });
  }, [applications, searchQuery, statusFilter, targetProgramFilter]);

  const selectedApplication = useMemo(
    () =>
      filteredApplications.find((application) => application.application_id === selectedId) ??
      filteredApplications[0] ??
      null,
    [filteredApplications, selectedId],
  );

  useEffect(() => {
    async function loadApplications() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAdminApplications();
        setApplications(data);
        setSelectedId((current) => current ?? data[0]?.application_id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
        setApplications([]);
        setSelectedId(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, []);

  useEffect(() => {
    setRemarks(selectedApplication?.remarks ?? '');
  }, [selectedApplication?.application_id, selectedApplication?.remarks]);

  useEffect(() => {
    if (!filteredApplications.length) {
      setSelectedId(null);
      return;
    }

    if (!filteredApplications.some((application) => application.application_id === selectedId)) {
      setSelectedId(filteredApplications[0].application_id);
    }
  }, [filteredApplications, selectedId]);

  async function handleReview(decision: 'approved' | 'rejected') {
    if (!selectedApplication) return;

    try {
      setIsReviewing(true);
      setError(null);
      const updated = await apiClient.reviewApplication(selectedApplication.application_id, {
        decision,
        remarks: remarks.trim() || undefined,
      });

      setApplications((current) =>
        current.map((application) =>
          application.application_id === updated.application_id ? updated : application,
        ),
      );
      setRemarks(updated.remarks ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${decision} application`);
    } finally {
      setIsReviewing(false);
    }
  }

  const canReview = selectedApplication && ['pending', 'under_review', 'awaiting_data'].includes(selectedApplication.status);
  const submittedHours = hoursSince(selectedApplication?.submitted_at);
  const showSlaWarning = !!selectedApplication && selectedApplication.status === 'under_review' && submittedHours >= 48;
  const hasActiveFilters = !!searchQuery.trim() || statusFilter !== 'all' || targetProgramFilter !== 'all';

  function clearFilters() {
    setSearchQuery('');
    setStatusFilter('all');
    setTargetProgramFilter('all');
  }

  return (
    <SidebarLayout
      title="Student Applications"
      subtitle={`${applications.length} submitted applications from Firebase`}
      userRole="admin"
      userName={displayName}
      studentId={displayId}
    >
      <div className="grid min-h-[calc(100vh-12rem)] gap-6 xl:grid-cols-[26rem_1fr]">
        <Card className="h-fit overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
          <Card.Content className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">Submitted Applications</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredApplications.length} of {applications.length} records
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 p-2 text-slate-600">
                  <Filter className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="space-y-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search applications"
                  className="w-full pl-9"
                  placeholder="Search name, student ID, application ID..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  aria-label="Filter by status"
                  className="w-full"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(getFilterValue(value))}
                >
                  <Label>Status</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className={filterPopoverClass} placement="bottom start">
                    <ListBox>
                      {statusFilterOptions.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                          {option.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  aria-label="Filter by target program"
                  className="w-full"
                  value={targetProgramFilter}
                  onChange={(value) => setTargetProgramFilter(getFilterValue(value))}
                >
                  <Label>Target</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className={filterPopoverClass} placement="bottom start">
                    <ListBox>
                      <ListBox.Item id="all" textValue="All programs">
                        All programs
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {targetProgramOptions.map((program) => (
                        <ListBox.Item key={program} id={program} textValue={formatProgramName(program)}>
                          {formatProgramName(program)}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button className="w-full" size="sm" variant="secondary" onPress={clearFilters}>
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-3 px-5 py-8 text-slate-600">
                <Spinner size="sm" />
                <span>Loading applications...</span>
              </div>
            )}

            {!isLoading && applications.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No student applications have been submitted yet.
              </div>
            )}

            {!isLoading && applications.length > 0 && filteredApplications.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No applications match the selected filters.
              </div>
            )}

            <div className="max-h-[calc(100vh-24rem)] divide-y divide-slate-200 overflow-y-auto">
              {filteredApplications.map((application) => (
                <button
                  key={application.application_id}
                  className={`w-full border-l-2 px-5 py-4 text-left transition ${
                    application.application_id === selectedApplication?.application_id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-transparent bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedId(application.application_id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{application.student_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{application.student_id}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    <span className="font-medium text-slate-800">{formatProgramName(application.current_program)}</span>
                    {' to '}
                    <span className="font-medium text-slate-800">{formatProgramName(application.target_program)}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(application.submitted_at)}</p>
                </button>
              ))}
            </div>
          </Card.Content>
        </Card>

        {!isLoading && applications.length > 0 && !selectedApplication && (
          <Card className="h-fit rounded-md border border-dashed border-slate-300 bg-white shadow-sm">
            <Card.Content className="p-8 text-center">
              <p className="font-semibold text-slate-950">No application selected</p>
              <p className="mt-2 text-sm text-slate-500">Adjust the filters or clear them to view applications.</p>
            </Card.Content>
          </Card>
        )}

        {selectedApplication && (
          <div className="space-y-6">
            {showSlaWarning && (
              <Card className="rounded-md border-l-4 border-l-amber-500 border-y-amber-100 border-r-amber-100 bg-amber-50 shadow-sm">
                <Card.Content className="gap-4 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-900">SLA warning</p>
                        <p className="mt-2 text-sm text-amber-800">
                          This application has been under review for {submittedHours} hours.
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="warning" />
                  </div>
                </Card.Content>
              </Card>
            )}

            {error && (
              <Card className="rounded-md border border-red-200 bg-red-50 p-5 shadow-sm">
                <p className="font-semibold text-red-900">Request failed</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </Card>
            )}

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application Review</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedApplication.student_name}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span>Student ID: {selectedApplication.student_id}</span>
                      <span>Application ID: {selectedApplication.application_id}</span>
                      <span>Submitted: {formatDateTime(selectedApplication.submitted_at)}</span>
                    </div>
                  </div>
                  <StatusBadge status={selectedApplication.status} />
                </div>
              </Card.Content>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-5">
                  <p className="text-sm font-semibold text-slate-950">Program Transfer</p>
                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Current</p>
                      <p className="font-semibold leading-6 text-slate-950">
                        {formatProgramName(selectedApplication.current_program)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="font-semibold leading-6 text-slate-950">
                        {formatProgramName(selectedApplication.target_program)}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-5">
                  <p className="text-sm font-semibold text-slate-950">Academic Standing</p>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">GWA</p>
                      <p className="font-semibold text-slate-950">
                        {selectedApplication.gwa ?? selectedApplication.self_reported_gpa ?? 'Not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Units</p>
                      <p className="font-semibold text-slate-950">
                        {selectedApplication.units_completed ?? selectedApplication.self_reported_credits ?? 'Not available'}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="gap-4 p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-slate-600" />
                    <p className="font-semibold text-slate-950">Eligibility Signals</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>No failing major subjects</span>
                      <span className={selectedApplication.has_failing_major ? 'text-red-600' : 'text-emerald-600'}>
                        {selectedApplication.has_failing_major ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>No financial hold</span>
                      <span className={selectedApplication.has_financial_hold ? 'text-red-600' : 'text-emerald-600'}>
                        {selectedApplication.has_financial_hold ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>No academic alert</span>
                      <span className={selectedApplication.has_academic_alert ? 'text-red-600' : 'text-emerald-600'}>
                        {selectedApplication.has_academic_alert ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Slot available</span>
                      <span className={selectedApplication.slot_available ? 'text-emerald-600' : 'text-amber-600'}>
                        {selectedApplication.slot_available ? 'Available' : 'Waitlisted/Unavailable'}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
                <Card.Content className="gap-4 p-5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-slate-600" />
                    <p className="font-semibold text-slate-950">Student Contact</p>
                  </div>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{selectedApplication.student_email || 'No email on file'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedApplication.phone_number || 'No phone number on file'}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Target semester</p>
                      <p className="mt-1 font-medium text-slate-950">{selectedApplication.target_semester || 'Not specified'}</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="p-5">
                <p className="font-semibold text-slate-950">Reason for Shifting</p>
                <p className="mt-4 text-sm leading-6 text-slate-700">{selectedApplication.reason_for_shifting}</p>
              </Card.Content>
            </Card>

            <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
              <Card.Content className="gap-4 p-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-slate-600" />
                  <p className="font-semibold text-slate-950">Reviewer Remarks</p>
                </div>
                <TextArea
                  aria-label="Reviewer remarks"
                  placeholder="Add notes or conditions for this application..."
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                />
                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    variant="secondary"
                    isDisabled={!canReview || isReviewing}
                    onPress={() => handleReview('rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    isDisabled={!canReview || isReviewing}
                    isPending={isReviewing}
                    onPress={() => handleReview('approved')}
                  >
                    Approve
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
