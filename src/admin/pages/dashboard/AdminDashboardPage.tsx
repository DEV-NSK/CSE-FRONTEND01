import {
  Users, UserCog, Activity, TrendingUp, Database, Server, Cpu, HardDrive,
  Globe, Clock, BarChart3, ArrowUp, Shield, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar,
} from 'recharts'
import { AnalyticsCard } from '@/admin/components/AnalyticsCard'

const dailyUsers = [
  { day: 'Mon', users: 480, new: 32 },
  { day: 'Tue', users: 620, new: 45 },
  { day: 'Wed', users: 540, new: 28 },
  { day: 'Thu', users: 710, new: 56 },
  { day: 'Fri', users: 680, new: 49 },
  { day: 'Sat', users: 320, new: 18 },
  { day: 'Sun', users: 260, new: 14 },
]

const growthData = [
  { month: 'Jan', students: 820, managers: 12 },
  { month: 'Feb', students: 980, managers: 14 },
  { month: 'Mar', students: 1150, managers: 16 },
  { month: 'Apr', students: 1340, managers: 18 },
  { month: 'May', students: 1580, managers: 20 },
  { month: 'Jun', students: 1820, managers: 22 },
  { month: 'Jul', students: 2100, managers: 24 },
]

const systemServices = [
  { name: 'PostgreSQL', status: 'healthy', latency: '4ms', color: 'text-emerald-400' },
  { name: 'Redis', status: 'healthy', latency: '0.8ms', color: 'text-emerald-400' },
  { name: 'Supabase', status: 'healthy', latency: '12ms', color: 'text-emerald-400' },
  { name: 'API Server', status: 'healthy', latency: '8ms', color: 'text-emerald-400' },
  { name: 'Queue Worker', status: 'degraded', latency: '—', color: 'text-amber-400' },
  { name: 'Storage', status: 'healthy', latency: '15ms', color: 'text-emerald-400' },
]

const recentAudit = [
  { action: 'User promoted to Manager', user: 'admin@cse.dev', module: 'Users', severity: 'info', time: '2m ago' },
  { action: 'Platform settings updated', user: 'admin@cse.dev', module: 'Platform', severity: 'warning', time: '18m ago' },
  { action: 'Bulk user import completed', user: 'admin@cse.dev', module: 'Users', severity: 'info', time: '1h ago' },
  { action: 'Manager permissions updated', user: 'admin@cse.dev', module: 'Permissions', severity: 'warning', time: '2h ago' },
  { action: 'System cache cleared', user: 'admin@cse.dev', module: 'System', severity: 'error', time: '3h ago' },
]

const SEVERITY_COLORS: Record<string, string> = {
  info: 'text-blue-400 bg-blue-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  error: 'text-red-400 bg-red-400/10',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-slate-200" role="main" aria-label="Super Admin Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Enterprise dashboard · July 17, 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-xs text-emerald-400 font-medium">All systems operational</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnalyticsCard title="Total Users" value="2,847" change="+124 this month" changeType="up" icon={Users} />
        <AnalyticsCard title="Managers" value="24" change="+2 this month" changeType="up" icon={UserCog} />
        <AnalyticsCard title="Today's Active" value="468" sub="out of 2847" change="+8% vs yesterday" changeType="up" icon={Activity} />
        <AnalyticsCard title="Monthly Active" value="1,920" change="67.5% retention" changeType="up" icon={TrendingUp} />
        <AnalyticsCard title="Avg Session" value="24m" change="+2m vs last month" changeType="up" icon={Clock} />
        <AnalyticsCard title="API Requests" value="1.2M/day" change="+12% this week" changeType="up" icon={Zap} />
        <AnalyticsCard title="Database Size" value="4.8 GB" sub="PostgreSQL" icon={Database} />
        <AnalyticsCard title="Storage Used" value="28 GB" sub="of 100 GB" change="72 GB available" icon={HardDrive} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Daily Active Users</h2>
            <Activity className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyUsers}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#userGradient)" strokeWidth={2} name="Active Users" />
              <Line type="monotone" dataKey="new" stroke="#22d3ee" strokeWidth={1.5} dot={false} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Platform Growth</h2>
            <TrendingUp className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={false} name="Students" />
              <Line type="monotone" dataKey="managers" stroke="#f59e0b" strokeWidth={2} dot={false} name="Managers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System + Audit row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">System Health</h2>
          </div>
          <div className="space-y-2.5">
            {systemServices.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
                  <span className="text-sm text-slate-300 font-medium">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {svc.latency !== '—' && <span className="text-xs text-slate-500">{svc.latency}</span>}
                  <span className={`text-xs font-medium ${svc.color}`}>{svc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">Recent Audit Events</h2>
          </div>
          <div className="space-y-2.5">
            {recentAudit.map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-800 last:border-0">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[log.severity]}`}>
                  {log.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-300 leading-relaxed">{log.action}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{log.module} · {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
