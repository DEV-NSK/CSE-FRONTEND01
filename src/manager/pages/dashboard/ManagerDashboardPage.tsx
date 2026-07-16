import {
  BookOpen,
  Code2,
  FolderKanban,
  Building2,
  Briefcase,
  CalendarDays,
  Bell,
  TrendingUp,
  FileEdit,
  Plus,
  Upload,
  BarChart2,
  Target,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useNavigate } from 'react-router-dom'

const weeklyActivity = [
  { day: 'Mon', uploads: 4, edits: 7 },
  { day: 'Tue', uploads: 6, edits: 12 },
  { day: 'Wed', uploads: 3, edits: 5 },
  { day: 'Thu', uploads: 8, edits: 9 },
  { day: 'Fri', uploads: 5, edits: 14 },
  { day: 'Sat', uploads: 2, edits: 3 },
  { day: 'Sun', uploads: 1, edits: 2 },
]

const contentUploaded = [
  { month: 'Jan', lessons: 12, problems: 8, projects: 5 },
  { month: 'Feb', lessons: 18, problems: 11, projects: 7 },
  { month: 'Mar', lessons: 15, problems: 14, projects: 9 },
  { month: 'Apr', lessons: 22, problems: 18, projects: 11 },
  { month: 'May', lessons: 28, problems: 21, projects: 13 },
  { month: 'Jun', lessons: 19, problems: 16, projects: 8 },
]

const topCourses = [
  { name: 'DSA Roadmap', views: 2840 },
  { name: 'React Basics', views: 2100 },
  { name: 'System Design', views: 1980 },
  { name: 'Python Mastery', views: 1650 },
  { name: 'Web Dev Bootcamp', views: 1420 },
]

const completionData = [
  { name: 'Completed', value: 68, color: '#7c3aed' },
  { name: 'In Progress', value: 22, color: '#a78bfa' },
  { name: 'Not Started', value: 10, color: '#e2e8f0' },
]

const recentActivity = [
  { id: 1, action: 'Roadmap Published', detail: 'Advanced React Patterns', time: '2 min ago', icon: BookOpen, color: 'text-violet-500 bg-violet-50' },
  { id: 2, action: 'Lesson Edited', detail: 'Binary Search Trees – Section 3', time: '18 min ago', icon: FileEdit, color: 'text-blue-500 bg-blue-50' },
  { id: 3, action: 'Problem Created', detail: 'Two Sum – Easy (Arrays)', time: '1 hr ago', icon: Code2, color: 'text-emerald-500 bg-emerald-50' },
  { id: 4, action: 'Event Added', detail: 'Google Hiring Drive 2026', time: '3 hr ago', icon: CalendarDays, color: 'text-orange-500 bg-orange-50' },
  { id: 5, action: 'Project Created', detail: 'E-Commerce Platform (Full Stack)', time: '5 hr ago', icon: FolderKanban, color: 'text-pink-500 bg-pink-50' },
]

const quickActions = [
  { label: 'Create Roadmap', icon: Plus, href: '/manager/learning', color: 'bg-violet-600 hover:bg-violet-700 text-white' },
  { label: 'Upload Lesson', icon: Upload, href: '/manager/learning', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'New Problem', icon: Code2, href: '/manager/coding', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { label: 'Create Project', icon: FolderKanban, href: '/manager/projects', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { label: 'Post Job', icon: Briefcase, href: '/manager/placements', color: 'bg-pink-600 hover:bg-pink-700 text-white' },
  { label: 'Add Event', icon: CalendarDays, href: '/manager/events', color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
]

export default function ManagerDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6" role="main" aria-label="Manager Dashboard">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Content Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all platform content</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-slate-500">
            Last updated: just now
          </Badge>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ManagerMetricCard
          title="Published Roadmaps"
          value="24"
          change="3 this month"
          changeType="up"
          icon={BookOpen}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <ManagerMetricCard
          title="Draft Roadmaps"
          value="7"
          description="Pending review"
          icon={FileEdit}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <ManagerMetricCard
          title="Total Lessons"
          value="312"
          change="18 this week"
          changeType="up"
          icon={Target}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <ManagerMetricCard
          title="Coding Problems"
          value="856"
          change="42 this month"
          changeType="up"
          icon={Code2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <ManagerMetricCard
          title="Projects"
          value="143"
          change="12 this month"
          changeType="up"
          icon={FolderKanban}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <ManagerMetricCard
          title="Companies"
          value="38"
          change="5 new"
          changeType="up"
          icon={Building2}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
        />
        <ManagerMetricCard
          title="Job Listings"
          value="67"
          change="Active listings"
          icon={Briefcase}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
        <ManagerMetricCard
          title="Upcoming Events"
          value="9"
          description="Next 30 days"
          icon={CalendarDays}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Weekly Activity</h2>
            <TrendingUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="uploads" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Uploads" />
              <Bar dataKey="edits" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Edits" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-600 rounded-full inline-block" />
              <span className="text-xs text-slate-500">Uploads</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-300 rounded-full inline-block" />
              <span className="text-xs text-slate-500">Edits</span></div>
          </div>
        </div>

        {/* Learning Completion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Learning Completion</h2>
            <BarChart2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={completionData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {completionData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {completionData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content Uploaded */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Content Uploaded (6 months)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={contentUploaded}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="lessons" stroke="#7c3aed" strokeWidth={2} dot={false} name="Lessons" />
              <Line type="monotone" dataKey="problems" stroke="#06b6d4" strokeWidth={2} dot={false} name="Problems" />
              <Line type="monotone" dataKey="projects" stroke="#f59e0b" strokeWidth={2} dot={false} name="Projects" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Most Viewed Courses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Most Viewed Courses</h2>
          <div className="space-y-3">
            {topCourses.map((course, i) => (
              <div key={course.name} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-4 flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{course.name}</p>
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                    <div
                      className="bg-violet-500 h-1 rounded-full"
                      style={{ width: `${(course.views / topCourses[0].views) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={course.views}
                      aria-valuemax={topCourses[0].views}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{course.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800">{item.action}</p>
                    <p className="text-xs text-slate-500 truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{item.time}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <button
                key={label}
                onClick={() => navigate(href)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium transition-all ${color} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-500`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Unread Notifications widget */}
          <div className="mt-4 p-3 bg-violet-50 border border-violet-100 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-violet-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-800">5 Unread Notifications</p>
              <p className="text-xs text-violet-600">3 broadcasts, 2 system alerts</p>
            </div>
            <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-800 text-xs px-2 py-1 h-auto" onClick={() => navigate('/manager/notifications')}>
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
