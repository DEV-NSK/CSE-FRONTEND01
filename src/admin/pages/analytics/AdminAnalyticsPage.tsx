import { BarChart3, TrendingUp, Users, Globe, Monitor } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  FunnelChart, Funnel, LabelList,
} from 'recharts'

const userGrowth = [
  { month: 'Jan', users: 820, sessions: 3200 },
  { month: 'Feb', users: 980, sessions: 4100 },
  { month: 'Mar', users: 1150, sessions: 4800 },
  { month: 'Apr', users: 1340, sessions: 5600 },
  { month: 'May', users: 1580, sessions: 6900 },
  { month: 'Jun', users: 1820, sessions: 7800 },
  { month: 'Jul', users: 2100, sessions: 8900 },
]

const retentionData = [
  { week: 'W1', d1: 100, d7: 68, d30: 42 },
  { week: 'W2', d1: 100, d7: 71, d30: 45 },
  { week: 'W3', d1: 100, d7: 65, d30: 38 },
  { week: 'W4', d1: 100, d7: 74, d30: 49 },
]

const deviceData = [
  { name: 'Desktop', value: 58, color: '#3b82f6' },
  { name: 'Mobile', value: 31, color: '#8b5cf6' },
  { name: 'Tablet', value: 11, color: '#22d3ee' },
]

const featureUsage = [
  { feature: 'Learning', value: 92 },
  { feature: 'Coding', value: 78 },
  { feature: 'Projects', value: 64 },
  { feature: 'Events', value: 56 },
  { feature: 'Placement', value: 48 },
  { feature: 'Analytics', value: 34 },
]

const peakHours = [
  { hour: '6AM', users: 45 }, { hour: '8AM', users: 120 }, { hour: '10AM', users: 280 },
  { hour: '12PM', users: 340 }, { hour: '2PM', users: 420 }, { hour: '4PM', users: 380 },
  { hour: '6PM', users: 460 }, { hour: '8PM', users: 510 }, { hour: '10PM', users: 320 },
  { hour: '12AM', users: 90 },
]

const countryData = [
  { country: 'India', users: 1840, pct: 65 },
  { country: 'USA', users: 284, pct: 10 },
  { country: 'UK', users: 198, pct: 7 },
  { country: 'Canada', users: 142, pct: 5 },
  { country: 'Others', users: 383, pct: 13 },
]

const funnelData = [
  { name: 'Registered', value: 2847, fill: '#3b82f6' },
  { name: 'Onboarded', value: 2410, fill: '#6366f1' },
  { name: 'Active (7d)', value: 1680, fill: '#8b5cf6' },
  { name: 'Active (30d)', value: 1200, fill: '#a78bfa' },
  { name: 'Retained', value: 840, fill: '#c4b5fd' },
]

const CHART_TOOLTIP_STYLE = {
  contentStyle: { fontSize: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-5" role="main" aria-label="Platform Analytics">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Platform Analytics</h1>
          <p className="text-xs text-slate-500">Enterprise-grade analytics — 30+ charts</p>
        </div>
      </div>

      {/* Row 1: Growth + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> User Growth & Sessions
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#usersGrad)" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="sessions" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Retention (D1 / D7 / D30)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Line dataKey="d1" stroke="#3b82f6" name="Day 1" strokeWidth={2} dot={false} />
              <Line dataKey="d7" stroke="#22d3ee" name="Day 7" strokeWidth={2} dot={false} />
              <Line dataKey="d30" stroke="#8b5cf6" name="Day 30" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Feature usage + Devices + Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Most Used Features</h2>
          <div className="space-y-2.5">
            {featureUsage.map(({ feature, value }) => (
              <div key={feature} className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 w-20 flex-shrink-0">{feature}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemax={100}
                    aria-label={`${feature}: ${value}%`}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Device Types</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {deviceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {deviceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden="true" />
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-300">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Peak Hours</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={peakHours} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Country + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Country Usage
          </h2>
          <div className="space-y-3">
            {countryData.map(({ country, users, pct }) => (
              <div key={country} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-20 flex-shrink-0">{country}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={pct} aria-valuemax={100} />
                </div>
                <span className="text-xs text-slate-500 w-12 text-right">{users.toLocaleString()}</span>
                <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">User Funnel</h2>
          <div className="space-y-2.5 mt-4">
            {funnelData.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28 flex-shrink-0">{name}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(value / funnelData[0].value) * 100}%`, backgroundColor: fill }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemax={funnelData[0].value}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300 w-16 text-right">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Activity Heatmap (Weekly)</h2>
        <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Activity heatmap">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-[10px] text-slate-600 mb-1">{d}</div>
          ))}
          {Array.from({ length: 7 * 24 }, (_, i) => {
            const intensity = Math.random()
            const bg = intensity > 0.8 ? 'bg-blue-500' : intensity > 0.6 ? 'bg-blue-700' : intensity > 0.3 ? 'bg-blue-900' : 'bg-slate-800'
            return (
              <div
                key={i}
                className={`h-3 rounded-sm ${bg} transition-opacity hover:opacity-80`}
                title={`${Math.floor(intensity * 500)} users`}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-slate-600">Less</span>
          {['bg-slate-800', 'bg-blue-900', 'bg-blue-700', 'bg-blue-500'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} aria-hidden="true" />
          ))}
          <span className="text-[10px] text-slate-600">More</span>
        </div>
      </div>
    </div>
  )
}
