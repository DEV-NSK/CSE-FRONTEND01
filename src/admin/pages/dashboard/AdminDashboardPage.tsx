import { timeAgo } from '@/shared/lib/time'
import {
  Users, UserCog, Activity, TrendingUp, Database, Server,
  Zap, BookOpen, Code2, FolderGit2,
  Briefcase, Calendar, Bell, RefreshCw, AlertCircle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { AnalyticsCard } from '@/admin/components/AnalyticsCard'
import { useAdminDashboard, useAdminCharts, useAdminLiveActivity, useAdminSystemHealth } from '@/shared/hooks/useAdminAnalytics'
import { cn } from '@/shared/lib/utils'

const CHART_TOOLTIP = {
  contentStyle: { fontSize: 12, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-300 flex-1">Failed to load dashboard data.</p>
      <button onClick={onRetry} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  )
}

const ACTION_LABELS: Record<string, string> = {
  USER_PROMOTED: 'User promoted to Manager',
  USER_DEMOTED: 'User demoted to Student',
  USER_DELETED: 'User deleted',
  USER_VERIFIED: 'User verified',
  USER_UNVERIFIED: 'User unverified',
  PERMISSION_UPDATED: 'Manager permissions updated',
  SETTINGS_CHANGED: 'Platform settings updated',
  MANAGER_INVITATION_SENT: 'Manager invitation sent',
}

export default function AdminDashboardPage() {
  const { data: overview, isLoading: loadingOverview, error: errorOverview, refetch: refetchOverview, dataUpdatedAt } = useAdminDashboard()
  const { data: charts, isLoading: loadingCharts } = useAdminCharts('monthly')
  const { data: live, isLoading: loadingLive } = useAdminLiveActivity()
  const { data: health } = useAdminSystemHealth()

  const lastUpdated = dataUpdatedAt
    ? timeAgo(new Date(dataUpdatedAt).toISOString())
    : null

  return (
    <div className="space-y-6 text-slate-200" role="main" aria-label="Super Admin Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enterprise dashboard
            {lastUpdated && <span className="ml-2 text-slate-600">· Updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchOverview()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
            health?.services.every(s => s.status === 'healthy')
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          )}>
            <div className="w-2 h-2 rounded-full animate-pulse bg-current" aria-hidden="true" />
            {health ? (
              health.services.every(s => s.status === 'healthy')
                ? 'All systems operational'
                : 'Service degradation detected'
            ) : 'Checking health…'}
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorOverview && <ErrorCard onRetry={refetchOverview} />}

      {/* KPIs — Section 1: Users */}
      {loadingOverview ? <SectionSkeleton /> : overview && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Users</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <AnalyticsCard
              title="Total Users"
              value={overview.users.total.toLocaleString()}
              change={`+${overview.users.newThisMonth} this month`}
              changeType="up"
              icon={Users}
              sub={`+${overview.users.newToday} today`}
            />
            <AnalyticsCard
              title="Students"
              value={overview.users.students.total.toLocaleString()}
              change={`${overview.users.students.active.toLocaleString()} active`}
              changeType="up"
              icon={Users}
              sub={`${overview.users.students.inactive.toLocaleString()} inactive`}
            />
            <AnalyticsCard
              title="Managers"
              value={overview.users.managers.total.toLocaleString()}
              change={`${overview.users.managers.active} active`}
              changeType="up"
              icon={UserCog}
              sub={`${overview.users.managers.pendingInvitations} pending invitations`}
            />
            <AnalyticsCard
              title="Growth %"
              value={`${overview.users.growthPct > 0 ? '+' : ''}${overview.users.growthPct}%`}
              change="vs last month"
              changeType={overview.users.growthPct >= 0 ? 'up' : 'down'}
              icon={TrendingUp}
              sub={`${overview.users.mentors.total} mentors · 1 super admin`}
            />
          </div>
        </div>
      )}

      {/* Section 2: Active Users */}
      {!loadingOverview && overview && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Users</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <AnalyticsCard title="Online Today" value={overview.activity.onlineToday.toLocaleString()} icon={Activity} changeType="up" change="logged in today" />
            <AnalyticsCard title="Active Yesterday" value={overview.activity.activeYesterday.toLocaleString()} icon={Activity} changeType="neutral" />
            <AnalyticsCard title="Active (7 days)" value={overview.activity.activeLast7.toLocaleString()} icon={TrendingUp} changeType="up" />
            <AnalyticsCard title="Active (30 days)" value={overview.activity.activeLast30.toLocaleString()} icon={TrendingUp} changeType="up" sub={`${overview.users.total > 0 ? Math.round((overview.activity.activeLast30 / overview.users.total) * 100) : 0}% of total`} />
          </div>
        </div>
      )}

      {/* Section 3+: Content Analytics */}
      {!loadingOverview && overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <AnalyticsCard title="Roadmaps" value={overview.learning.totalRoadmaps.toString()} sub={`${overview.learning.publishedRoadmaps} published`} icon={BookOpen} />
          <AnalyticsCard title="Lessons" value={overview.learning.totalLessons.toString()} sub={`${overview.learning.publishedLessons} published`} icon={BookOpen} />
          <AnalyticsCard title="Problems" value={overview.coding.totalProblems.toString()} sub={`Solved today: ${overview.coding.solvedToday}`} icon={Code2} />
          <AnalyticsCard title="Projects" value={overview.projects.total.toString()} sub={`${overview.projects.published} published`} icon={FolderGit2} />
          <AnalyticsCard title="Jobs & Internships" value={(overview.placement.jobs + overview.placement.internships).toString()} sub={`${overview.placement.applications} applications`} icon={Briefcase} />
          <AnalyticsCard title="Events" value={overview.events.upcoming.toString()} sub={`${overview.events.registrations} registrations`} icon={Calendar} change="upcoming" />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">User Growth (Monthly)</h2>
            <TrendingUp className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </div>
          {loadingCharts ? (
            <Skeleton className="h-48" />
          ) : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.userGrowth}>
                <defs>
                  <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Area type="monotone" dataKey="newUsers" stroke="#3b82f6" fill="url(#gradNew)" strokeWidth={2} name="New Users" />
                <Line type="monotone" dataKey="activeUsers" stroke="#22d3ee" strokeWidth={1.5} dot={false} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Platform Growth</h2>
            <Activity className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </div>
          {loadingCharts ? (
            <Skeleton className="h-48" />
          ) : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={false} name="Students" />
                <Line type="monotone" dataKey="managers" stroke="#f59e0b" strokeWidth={2} dot={false} name="Managers" />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* System Health + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">System Health</h2>
          </div>
          {!health ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <>
              {/* CPU + Memory bars */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'CPU', pct: health.cpu.percent, color: 'bg-blue-500' },
                  { label: 'Memory', pct: health.memory.percent, color: 'bg-purple-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="bg-slate-800 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-300 font-medium">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {health.services.map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-1.5 h-1.5 rounded-full', svc.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400')} />
                      <span className="text-sm text-slate-300">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {svc.latencyMs > 0 && <span className="text-xs text-slate-500">{svc.latencyMs}ms</span>}
                      <span className={cn('text-xs font-medium', svc.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400')}>
                        {svc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-white">Live Activity Feed</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Live · 10s</span>
            </div>
          </div>
          {loadingLive ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : live && live.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {live.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-1.5 border-b border-slate-800 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ACTION_LABELS[item.action] ?? item.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {item.performer} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Bottom row: Notifications + Placement */}
      {!loadingOverview && overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnalyticsCard title="Notifications Sent" value={overview.notifications.total.toLocaleString()} sub={`${overview.notifications.unread} unread`} icon={Bell} />
          <AnalyticsCard title="Read Rate" value={`${overview.notifications.readRate}%`} icon={Bell} changeType={overview.notifications.readRate > 70 ? 'up' : 'down'} />
          <AnalyticsCard title="Companies" value={overview.placement.companies.toLocaleString()} icon={Briefcase} sub={`${overview.placement.offered} offered`} />
          <AnalyticsCard
            title="Database"
            value={overview.users.total > 0 ? `${overview.users.total.toLocaleString()} rows` : '—'}
            sub="PostgreSQL"
            icon={Database}
          />
        </div>
      )}
    </div>
  )
}
