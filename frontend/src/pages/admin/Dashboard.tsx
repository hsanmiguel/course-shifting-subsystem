import { useEffect, useMemo, useState } from 'react';
import { Card } from '@heroui/react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Timer,
  XCircle,
} from 'lucide-react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/atoms/StatCard';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AdminAnalytics } from '@/types';
import { buildAdminAnalytics, getAdminAnalytics, mockAdminApplications, mockAuditLogs } from './api';

const fallbackAnalytics = buildAdminAnalytics(mockAdminApplications, mockAuditLogs);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(fallbackAnalytics);

  useEffect(() => {
    getAdminAnalytics().then(setAnalytics);
  }, []);

  const largestProgramCount = useMemo(
    () => Math.max(...analytics.targetProgramDemand.map((item) => item.count), 1),
    [analytics.targetProgramDemand],
  );
  const largestStatusCount = useMemo(
    () => Math.max(...analytics.statusBreakdown.map((item) => item.count), 1),
    [analytics.statusBreakdown],
  );

  return (
    <SidebarLayout
      title="Admin Dashboard"
      subtitle="Application analytics and operational review metrics"
      userRole="admin"
      userName="Juan Dela Cruz"
      studentId="STU-2021-08831"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={analytics.totalApplications}
            description="All submitted records"
            icon={<ClipboardList className="h-6 w-6" />}
          />
          <StatCard
            title="Pending Review"
            value={analytics.pendingReview}
            description="Needs admin action"
            icon={<Timer className="h-6 w-6" />}
          />
          <StatCard
            title="Approved"
            value={analytics.approvedApplications}
            description="Cleared applications"
            icon={<CheckCircle2 className="h-6 w-6" />}
          />
          <StatCard
            title="Rejected"
            value={analytics.rejectedApplications}
            description="Closed as ineligible"
            icon={<XCircle className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Target Program Demand</h2>
                  <p className="mt-1 text-sm text-slate-500">Applications grouped by destination program.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-500" />
              </div>
              <div className="space-y-4">
                {analytics.targetProgramDemand.map((item) => (
                  <div key={item.program} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.program}</span>
                      <span className="font-semibold text-slate-950">{item.count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-sm bg-slate-100">
                      <div
                        className="h-full rounded-sm bg-blue-600"
                        style={{ width: `${(item.count / largestProgramCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Academic Profile</h2>
                <p className="mt-1 text-sm text-slate-500">Average student standing across applications.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <GraduationCap className="h-5 w-5 text-slate-500" />
                  <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Average GWA</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{analytics.averageGwa}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <ClipboardList className="h-5 w-5 text-slate-500" />
                  <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Average Units</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{analytics.averageUnits}</p>
                </div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">{analytics.slaBreaches} SLA breach warnings</p>
                    <p className="mt-1 text-sm text-amber-800">Review escalated items before the 72-hour cutoff.</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Status Breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">Current workflow distribution.</p>
              </div>
              <div className="space-y-4">
                {analytics.statusBreakdown.map((item) => (
                  <div key={item.status} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3">
                    <StatusBadge status={item.status} />
                    <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                      <div
                        className="h-full rounded-sm bg-slate-800"
                        style={{ width: `${(item.count / largestStatusCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-sm font-semibold text-slate-950">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card className="rounded-md border border-slate-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Recent Audit Events</h2>
                <p className="mt-1 text-sm text-slate-500">Latest application and system actions.</p>
              </div>
              <div className="divide-y divide-slate-200">
                {analytics.recentEvents.map((event) => (
                  <div key={event.id} className="grid gap-3 py-4 md:grid-cols-[8rem_1fr_auto] md:items-center">
                    <p className="text-sm font-medium text-slate-500">{event.timestamp}</p>
                    <div>
                      <p className="font-semibold text-slate-950">{event.applicationId}</p>
                      <p className="mt-1 text-sm text-slate-600">{event.details}</p>
                    </div>
                    <StatusBadge status={event.action} />
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
