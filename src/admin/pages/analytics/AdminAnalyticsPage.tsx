import { useState } from 'react'
import { BarChart3, TrendingUp, Globe, RefreshCw, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from 'recharts'
import { useAdminCharts, useAdminDashboard } from '@/shared/hooks/useAdminAnalytics'
import { cn } from '@/shared/lib/utils'

const CHART_TOOLTIP = {
  contentStyle: { fontSize: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('monthly')

  const { data: charts, isLoading, error, refetch } = useAdminCharts(period)
  const { data: overview } = useAdminDashboard()

  return (
    <div className="space-y-5" role="main" aria-label="Platform Analytics">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Platform Analytics</h1>
            <p className="text-xs text-slate-500">Live data from database</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                  period === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-xs text-red-300 flex-1">Failed to load chart data.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400">Retry</button>
        </div>
      )}

      {/* KPI snapshot from dashboard */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: overview.users.total.toLocaleString(), color: 'text-blue-400' },
            { label: 'Active (30d)', value: overview.activity.activeLast30.toLocaleString(), color: 'text-emerald-400' },
            { label: 'Roadmaps', value: overview.learning.publishedRoadmaps.toString(), color: 'text-purple-400' },
            { label: 'Problems', value: overview.coding.totalProblems.toString(), color: 'text-amber-400' },
            { label: 'Projects', value: overview.projects.total.toString(), color: 'text-cyan-400' },
            { label: 'Applications', value: overview.placement.applications.toLocaleString(), color: 'text-rose-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Row 1: User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> User Growth & Activity
          </h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
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
                <Line type="monotone" dataKey="activeUsers" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Students vs Managers</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
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

      {/* Row 2: Learning + Coding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Learning Activity</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.learningActivity} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="lessons" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="New Lessons" />
                <Bar dataKey="completions" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Coding Submissions</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.codingActivity}>
                <defs>
                  <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Area type="monotone" dataKey="submissions" stroke="#f59e0b" fill="url(#gradSub)" strokeWidth={2} name="Submissions" />
                <Line type="monotone" dataKey="accepted" stroke="#22d3ee" strokeWidth={1.5} dot={false} name="Accepted" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Row 3: Projects + Placements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Project Creations</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.projectActivity} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="projects" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Placement Activity</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.placementActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={false} name="Applications" />
                <Line type="monotone" dataKey="offered" stroke="#22c55e" strokeWidth={2} dot={false} name="Offered" />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Row 4: Events + Platform stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Event Activity</h2>
          {isLoading ? <Skeleton className="h-48" /> : charts ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.eventActivity} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="events" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Events" />
                <Bar dataKey="registrations" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Coding difficulty breakdown */}
        {overview && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Problem Difficulty Split
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Easy', value: overview.coding.easyProblems, total: overview.coding.totalProblems, color: 'bg-emerald-500' },
                { label: 'Medium', value: overview.coding.mediumProblems, total: overview.coding.totalProblems, color: 'bg-amber-500' },
                { label: 'Hard', value: overview.coding.hardProblems, total: overview.coding.totalProblems, color: 'bg-red-500' },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-14 flex-shrink-0">{label}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
                    <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Content Split</h3>
              <div className="space-y-2">
                {[
                  { label: 'Roadmaps', value: overview.learning.totalRoadmaps, sub: `${overview.learning.publishedRoadmaps} published` },
                  { label: 'Lessons', value: overview.learning.totalLessons, sub: `${overview.learning.publishedLessons} published` },
                  { label: 'Resources', value: overview.learning.totalResources, sub: 'learning resources' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{label}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-200">{value}</span>
                      <span className="text-xs text-slate-600 ml-2">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
