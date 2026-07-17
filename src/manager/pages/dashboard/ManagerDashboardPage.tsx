/**
 * FPRD-10: Manager Dashboard — Real data via React Query
 */
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, Code2, FolderKanban, Building2, Briefcase,
  CalendarDays, Bell, TrendingUp, FileEdit, Plus,
  BarChart2, Target, AlertCircle, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { managerService } from '@/shared/services/manager.service'

const COMPLETION_COLORS = ['#7c3aed', '#a78bfa', '#e2e8f0']

const QUICK_ACTIONS = [
  { label: 'Create Roadmap', icon: Plus, href: '/manager/learning', color: 'bg-violet-600 hover:bg-violet-700 text-white' },
  { label: 'Upload Lesson', icon: FileEdit, href: '/manager/learning', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'New Problem', icon: Code2, href: '/manager/coding', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { label: 'Create Project', icon: FolderKanban, href: '/manager/projects', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { label: 'Post Job', icon: Briefcase, href: '/manager/placements', color: 'bg-pink-600 hover:bg-pink-700 text-white' },
  { label: 'Add Event', icon: CalendarDays, href: '/manager/events', color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
]

export default function ManagerDashboardPage() {
  const navigate = useNavigate()

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['manager', 'activity'],
    queryFn: () => managerService.getActivityLog({ limit: 8 }).then((r) => r.data.data),
    staleTime: 60_000,
  })

  const d = rawData as Record<string, Record<string, number>> | undefined
  const learning = d?.learning ?? {}
  const coding = d?.coding ?? {}
  const projects = d?.projects ?? {}
  const placements = d?.placements ?? {}
  const events = d?.events ?? {}
  const notifications = d?.notifications ?? {}
  const today = d?.todayActivity ?? {}

  const completionData = [
    { name: 'Published Lessons', value: learning.publishedLessons ?? 0, color: '#7c3aed' },
    { name: 'Draft Lessons', value: (learning.totalLessons ?? 0) - (learning.publishedLessons ?? 0), color: '#a78bfa' },
    { name: 'Resources', value: learning.totalResources ?? 0, color: '#e2e8f0' },
  ]

  const metricsBar = [
    { name: 'Roadmaps', published: learning.publishedRoadmaps ?? 0, draft: learning.draftRoadmaps ?? 0 },
    { name: 'Problems', published: coding.publishedProblems ?? 0, draft: coding.draftProblems ?? 0 },
    { name: 'Projects', published: projects.publishedProjects ?? 0, draft: 0 },
    { name: 'Jobs', published: placements.publishedJobs ?? 0, draft: 0 },
    { name: 'Events', published: events.publishedEvents ?? 0, draft: 0 },
  ]

  const recentActivity = (activityData as { data?: Array<{ id: string; action: string; entity?: string; createdAt?: string }> } | undefined)?.data ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
          <p className="text-sm text-slate-500">Loading CMS dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-600">Failed to load dashboard data. Please refresh.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" role="main" aria-label="Manager CMS Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Content Management Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time CMS statistics for your platform</p>
        </div>
        <Badge variant="outline" className="text-xs text-slate-500">
          Today: {today.lessonsAddedToday ?? 0} lessons · {today.problemsAddedToday ?? 0} problems added
        </Badge>
      </div>

      {/* Metrics row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ManagerMetricCard title="Categories" value={learning.totalCategories ?? 0} icon={BookOpen} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <ManagerMetricCard title="Published Roadmaps" value={learning.publishedRoadmaps ?? 0} change={`${learning.draftRoadmaps ?? 0} drafts`} icon={BookOpen} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Total Lessons" value={learning.totalLessons ?? 0} change={`${learning.publishedLessons ?? 0} published`} changeType="up" icon={Target} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <ManagerMetricCard title="Resources" value={learning.totalResources ?? 0} icon={FileEdit} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
      </div>

      {/* Metrics row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ManagerMetricCard title="Coding Problems" value={coding.totalProblems ?? 0} change={`${coding.publishedProblems ?? 0} live`} changeType="up" icon={Code2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <ManagerMetricCard title="Projects" value={projects.totalProjects ?? 0} change={`${projects.publishedProjects ?? 0} published`} changeType="up" icon={FolderKanban} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <ManagerMetricCard title="Companies" value={placements.totalCompanies ?? 0} icon={Building2} iconColor="text-pink-600" iconBg="bg-pink-50" />
        <ManagerMetricCard title="Job Listings" value={placements.totalJobs ?? 0} change={`${placements.publishedJobs ?? 0} active`} icon={Briefcase} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <ManagerMetricCard title="Events" value={events.totalEvents ?? 0} change={`${events.publishedEvents ?? 0} published`} changeType="up" icon={CalendarDays} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <ManagerMetricCard title="Notifications Sent" value={notifications.totalNotifications ?? 0} icon={Bell} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content by module */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Content by Module</h2>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metricsBar} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="published" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Published" />
              <Bar dataKey="draft" fill="#ddd6fe" radius={[4, 4, 0, 0]} name="Draft" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-600 rounded-full inline-block" /><span className="text-xs text-slate-500">Published</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-200 rounded-full inline-block" /><span className="text-xs text-slate-500">Draft</span></div>
          </div>
        </div>

        {/* Learning breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Learning Breakdown</h2>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          {(learning.totalLessons ?? 0) === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-xs">No lessons yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={completionData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                    {completionData.map((e, i) => <Cell key={i} fill={COMPLETION_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {completionData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COMPLETION_COLORS[i] }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <FileEdit className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800">{item.action?.replace(/_/g, ' ')}</p>
                    {item.entity && <p className="text-xs text-slate-400 truncate">{item.entity}</p>}
                  </div>
                  {item.createdAt && <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
              <button key={label} onClick={() => navigate(href)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium transition-all ${color} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-500`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800">Notification Center</p>
              <p className="text-xs text-amber-600">{notifications.totalNotifications ?? 0} total sent</p>
            </div>
            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 h-auto"
              onClick={() => navigate('/manager/notifications')}>
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
