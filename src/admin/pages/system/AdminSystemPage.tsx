import { Monitor, Database, Cpu, HardDrive, Activity, Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAdminSystemHealth, useAdminApiAnalytics, useAdminDatabase } from '@/shared/hooks/useAdminAnalytics'
import { useAdminSystemLogs } from '@/shared/hooks/useAdmin'
import { cn } from '@/shared/lib/utils'
import { timeAgo, formatUptime } from '@/shared/lib/time'

const CHART_STYLE = {
  contentStyle: { fontSize: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
}

const LOG_COLORS: Record<string, string> = {
  info: 'text-blue-400 bg-blue-400/10',
  warn: 'text-amber-400 bg-amber-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  error: 'text-red-400 bg-red-400/10',
  debug: 'text-slate-400 bg-slate-400/10',
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function AdminSystemPage() {
  const { data: health, isLoading: loadingHealth, refetch: refetchHealth } = useAdminSystemHealth()
  const { data: apiStats, isLoading: loadingApi } = useAdminApiAnalytics()
  const { data: dbStats, isLoading: loadingDb } = useAdminDatabase()
  const { data: sysLogs, isLoading: loadingLogs, refetch: refetchLogs } = useAdminSystemLogs({ limit: 20 })

  const allHealthy = health?.services.every((s) => s.status === 'healthy') ?? true

  return (
    <div className="space-y-5" role="main" aria-label="System Monitor">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">System Monitor</h1>
            <p className="text-xs text-slate-500">Real-time infrastructure health — auto-refreshes every 15s</p>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
          allHealthy
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        )}>
          <div className="w-2 h-2 rounded-full animate-pulse bg-current" aria-hidden="true" />
          {loadingHealth ? 'Checking…' : allHealthy
            ? `${health?.services.length ?? 0}/${health?.services.length ?? 0} services healthy`
            : 'Degradation detected'}
        </div>
      </div>

      {/* Resource metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loadingHealth ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : health ? (
          <>
            {[
              { label: 'CPU Usage', value: `${health.cpu.percent}%`, icon: Cpu, color: 'text-blue-400', bar: health.cpu.percent },
              { label: 'Memory', value: `${health.memory.percent}%`, icon: Activity, color: 'text-purple-400', bar: health.memory.percent, sub: `${health.memory.usedMb}/${health.memory.totalMb} MB` },
              { label: 'Uptime', value: formatUptime(health.uptime), icon: Zap, color: 'text-emerald-400', bar: 100 },
              { label: 'Storage Used', value: `${health.storage.usedGb.toFixed(1)} GB`, icon: HardDrive, color: 'text-cyan-400', bar: Math.min(100, health.storage.usedGb * 2) },
            ].map(({ label, value, icon: Icon, color, bar, sub }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                </div>
                <p className="text-xl font-bold text-white mb-0.5">{value}</p>
                {sub && <p className="text-[10px] text-slate-600 mb-2">{sub}</p>}
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${bar > 80 ? 'bg-red-500' : bar > 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${bar}%` }}
                    role="progressbar"
                    aria-valuenow={bar}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>

      {/* API Analytics cards */}
      {!loadingApi && apiStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Requests Today', value: apiStats.totalRequestsToday.toLocaleString(), color: 'text-blue-400' },
            { label: 'Success Rate', value: `${apiStats.successRate}%`, color: apiStats.successRate > 95 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Error Rate', value: `${apiStats.errorRate}%`, color: apiStats.errorRate < 5 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Warnings', value: apiStats.warningCount.toString(), color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Database stats */}
      {!loadingDb && dbStats && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Database Analytics</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Size: <span className="text-slate-300 font-medium">{dbStats.dbSize}</span></span>
              <span>Connections: <span className="text-slate-300 font-medium">{dbStats.connections}</span></span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Table</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Live Rows</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Dead Rows</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Seq Scans</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.tableStats.slice(0, 10).map((t) => (
                  <tr key={t.table} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-2.5 font-mono text-xs text-slate-300">{t.table}</td>
                    <td className="px-5 py-2.5 text-right text-xs text-slate-400">{t.rows.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right text-xs text-slate-600 hidden md:table-cell">{(t.deadRows ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right text-xs text-slate-600 hidden lg:table-cell">{(t.seqScans ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services table */}
      {!loadingHealth && health && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Service Health</h2>
          </div>
          <table className="w-full text-sm" aria-label="Service health table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Latency</th>
              </tr>
            </thead>
            <tbody>
              {health.services.map((svc) => (
                <tr key={svc.name} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center')}>
                        <Activity className={cn('w-3.5 h-3.5', svc.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400')} />
                      </div>
                      <span className="font-medium text-slate-200">{svc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'text-xs font-medium flex items-center gap-1.5',
                      svc.status === 'healthy' ? 'text-emerald-400' : svc.status === 'error' ? 'text-red-400' : 'text-amber-400',
                    )}>
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        svc.status === 'healthy' ? 'bg-emerald-400' : svc.status === 'error' ? 'bg-red-400' : 'bg-amber-400',
                      )} />
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">
                    {svc.latencyMs > 0 ? `${svc.latencyMs}ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* System Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">System Logs</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-300 text-xs"
            onClick={() => refetchLogs()}
            aria-label="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> Refresh
          </Button>
        </div>
        <div className="p-4 font-mono space-y-1.5 max-h-72 overflow-y-auto">
          {loadingLogs ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5" />)
          ) : sysLogs?.data.length ? (
            sysLogs.data.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="text-slate-600 flex-shrink-0 w-20 tabular-nums">
                  {log.createdAt ? timeAgo(log.createdAt) : '—'}
                </span>
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0', LOG_COLORS[log.level] ?? 'text-slate-400 bg-slate-400/10')}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-slate-400 truncate">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-600 text-center py-4">No system logs found</p>
          )}
        </div>
      </div>
    </div>
  )
}
