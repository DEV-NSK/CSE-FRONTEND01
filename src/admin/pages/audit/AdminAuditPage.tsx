import { useState } from 'react'
import { FileSearch, Search, Download, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAdminAuditLogs } from '@/shared/hooks/useAdmin'
import { timeAgo, formatDateForCSV } from '@/shared/lib/time'

const ACTION_SEVERITY: Record<string, 'info' | 'warning' | 'error'> = {
  USER_PROMOTED: 'info',
  USER_DEMOTED: 'warning',
  USER_DELETED: 'error',
  USER_VERIFIED: 'info',
  USER_UNVERIFIED: 'warning',
  PERMISSION_UPDATED: 'warning',
  SETTINGS_CHANGED: 'warning',
  MANAGER_INVITATION_SENT: 'info',
  LOGIN_FAILED: 'error',
  ACCOUNT_LOCKED: 'error',
  METRIC_SNAPSHOT: 'info',
}

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  warning: 'bg-amber-900/30 text-amber-300 border-amber-700/30',
  error: 'bg-red-900/30 text-red-300 border-red-700/30',
}

const MODULES = ['All', 'Users', 'Permissions', 'Platform', 'System', 'Managers']
const SEVERITIES = ['all', 'info', 'warning', 'error']

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

const PAGE_SIZE = 15

function getSeverity(action: string): 'info' | 'warning' | 'error' {
  return ACTION_SEVERITY[action] ?? 'info'
}

function downloadCSV(data: unknown[]) {
  if (!data.length) return
  const headers = ['Action', 'Performer', 'Module', 'Entity', 'IP', 'Timestamp']
  const rows = (data as Record<string, unknown>[]).map((r) => [
    r['action'], r['performerName'] ?? '', r['module'] ?? '', r['entity'] ?? '', r['ipAddress'] ?? '',
    r['createdAt'] ? formatDateForCSV(r['createdAt'] as string) : '',
  ])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [module, setModule] = useState('All')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch, dataUpdatedAt } = useAdminAuditLogs({
    module: module !== 'All' ? module : undefined,
    page,
    limit: PAGE_SIZE,
  })

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Client-side filter for search + severity (server returns all for current module/page)
  const filtered = logs.filter((log) => {
    const matchSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log as unknown as { performer?: { email?: string } }).performer?.email?.includes(search)
    const sev = getSeverity(log.action)
    const matchSev = severity === 'all' || sev === severity
    return matchSearch && matchSev
  })

  const lastUpdated = dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt).toISOString()) : null

  const exportableData = filtered.map((l) => ({
    action: l.action,
    performerName: (l as unknown as { performer?: { fullName?: string } }).performer?.fullName ?? '',
    module: l.module,
    entity: l.entity,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt,
  }))

  return (
    <div className="space-y-5" role="main" aria-label="Audit Logs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Audit Logs</h1>
            <p className="text-xs text-slate-500">
              {total > 0 ? `${total.toLocaleString()} events total` : 'Complete timeline of all admin actions'}
              {lastUpdated && <span className="ml-2 text-slate-600">· {lastUpdated}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs gap-1.5"
            onClick={() => downloadCSV(exportableData)}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-xs text-red-300 flex-1">Failed to load audit logs.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-800">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              placeholder="Search by action or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search audit logs"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => { setSeverity(s); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors',
                  severity === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                )}
              >
                {s}
              </button>
            ))}
            <span className="w-px bg-slate-700 self-stretch mx-1" />
            {MODULES.map((m) => (
              <button
                key={m}
                onClick={() => { setModule(m); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                  module === m ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Audit log table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Performer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">When</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((log) => {
                    const sev = getSeverity(log.action)
                    const performer = (log as unknown as { performer?: { fullName?: string; email?: string } }).performer
                    return (
                      <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-300">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          {log.entity && (
                            <p className="text-xs text-slate-600 mt-0.5">{log.entity}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {performer ? (
                            <>
                              <p className="text-xs text-slate-300">{performer.fullName}</p>
                              <p className="text-[10px] text-slate-600">{performer.email}</p>
                            </>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium border capitalize', SEVERITY_STYLES[sev])}>
                            {sev}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                          {log.module ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell font-mono">
                          {log.ipAddress ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell">
                          {log.createdAt ? timeAgo(log.createdAt) : '—'}
                        </td>
                      </tr>
                    )
                  })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-600 text-sm">
                    No audit events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-600">{total.toLocaleString()} events · Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn('w-7 h-7 rounded-md text-xs font-medium transition-colors', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-500')}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
