import { Monitor, Database, Cpu, HardDrive, Activity, Zap, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/shared/components/ui/button'

const cpuData = Array.from({ length: 20 }, (_, i) => ({ t: i, cpu: 20 + Math.random() * 40 }))
const memData = Array.from({ length: 20 }, (_, i) => ({ t: i, mem: 45 + Math.random() * 20 }))

const services = [
  { name: 'PostgreSQL', type: 'Database', status: 'healthy', latency: '4ms', uptime: '99.99%', icon: Database, color: 'text-emerald-400' },
  { name: 'Redis', type: 'Cache', status: 'healthy', latency: '0.8ms', uptime: '100%', icon: Zap, color: 'text-emerald-400' },
  { name: 'Supabase Storage', type: 'Storage', status: 'healthy', latency: '15ms', uptime: '99.95%', icon: HardDrive, color: 'text-emerald-400' },
  { name: 'API Server', type: 'Compute', status: 'healthy', latency: '8ms', uptime: '99.98%', icon: Activity, color: 'text-emerald-400' },
  { name: 'Queue Worker', type: 'Worker', status: 'degraded', latency: '—', uptime: '97.50%', icon: RefreshCw, color: 'text-amber-400' },
  { name: 'Email Service', type: 'Integration', status: 'healthy', latency: '120ms', uptime: '99.80%', icon: Zap, color: 'text-emerald-400' },
]

const logs = [
  { level: 'INFO', message: 'Database connection pool: 8/20 connections active', time: '10:42:01' },
  { level: 'WARN', message: 'Queue worker high latency detected (>500ms)', time: '10:38:22' },
  { level: 'INFO', message: 'Redis cache hit ratio: 87.3%', time: '10:35:10' },
  { level: 'INFO', message: 'API rate limiter: 1,240 req/min across all endpoints', time: '10:30:05' },
  { level: 'ERROR', message: 'Queue job failed: email-worker-3 (retry 2/3)', time: '10:28:44' },
  { level: 'INFO', message: 'Scheduled backup completed: 4.8GB stored', time: '10:00:00' },
]

const LOG_COLORS: Record<string, string> = {
  INFO: 'text-blue-400 bg-blue-400/10',
  WARN: 'text-amber-400 bg-amber-400/10',
  ERROR: 'text-red-400 bg-red-400/10',
}

const CHART_STYLE = {
  contentStyle: { fontSize: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
}

export default function AdminSystemPage() {
  return (
    <div className="space-y-5" role="main" aria-label="System Monitor">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">System Monitor</h1>
            <p className="text-xs text-slate-500">Real-time infrastructure health and metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-xs text-emerald-400 font-medium">5/6 services healthy</span>
        </div>
      </div>

      {/* Resource metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'CPU Usage', value: '34%', icon: Cpu, color: 'text-blue-400', bar: 34 },
          { label: 'Memory', value: '58%', icon: Activity, color: 'text-purple-400', bar: 58 },
          { label: 'Storage', value: '28%', icon: HardDrive, color: 'text-cyan-400', bar: 28 },
          { label: 'DB Connections', value: '8/20', icon: Database, color: 'text-emerald-400', bar: 40 },
        ].map(({ label, value, icon: Icon, color, bar }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
            </div>
            <p className="text-xl font-bold text-white mb-2">{value}</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-blue-500`}
                style={{ width: `${bar}%` }}
                role="progressbar"
                aria-valuenow={bar}
                aria-valuemax={100}
                aria-label={`${label}: ${value}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> CPU Usage (live)
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip {...CHART_STYLE} formatter={(v: number) => [`${v.toFixed(1)}%`, 'CPU']} />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} name="CPU" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Memory Usage (live)
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={memData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip {...CHART_STYLE} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Memory']} />
              <Line type="monotone" dataKey="mem" stroke="#a78bfa" strokeWidth={2} dot={false} name="Memory" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Service Health</h2>
        </div>
        <table className="w-full text-sm" aria-label="Service health table">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Latency</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => {
              const Icon = svc.icon
              return (
                <tr key={svc.name} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Icon className={`w-3.5 h-3.5 ${svc.color}`} aria-hidden="true" />
                      </div>
                      <span className="font-medium text-slate-200">{svc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{svc.type}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${svc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">{svc.latency}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden lg:table-cell">{svc.uptime}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">System Logs</h2>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-300 text-xs" aria-label="Refresh logs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> Refresh
          </Button>
        </div>
        <div className="p-4 font-mono space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="text-slate-600 flex-shrink-0 w-16">{log.time}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${LOG_COLORS[log.level]}`}>{log.level}</span>
              <span className="text-slate-400">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
