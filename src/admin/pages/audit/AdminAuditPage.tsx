import { useState } from 'react'
import { FileSearch, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

const mockAuditLogs = Array.from({ length: 60 }, (_, i) => ({
  id: `al${i + 1}`,
  action: [
    'User account created',
    'Manager promoted',
    'Platform settings updated',
    'Permission granted',
    'User suspended',
    'Cache cleared',
    'Bulk user import',
    'Permission revoked',
    'Feature flag toggled',
    'Admin login detected',
  ][i % 10],
  user: `admin@cse.dev`,
  module: ['Users', 'Permissions', 'Platform', 'System', 'Managers'][i % 5],
  severity: ['info', 'warning', 'info', 'warning', 'error', 'info', 'info', 'warning', 'info', 'warning'][i % 10] as 'info' | 'warning' | 'error',
  ipAddress: `192.168.${Math.floor(i / 10)}.${(i % 255) + 1}`,
  timestamp: `Jul ${17 - Math.floor(i / 4)}, 2026 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}))

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  warning: 'bg-amber-900/30 text-amber-300 border-amber-700/30',
  error: 'bg-red-900/30 text-red-300 border-red-700/30',
}

const PAGE_SIZE = 12

export default function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [module, setModule] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.user.includes(search)
    const matchSeverity = severity === 'all' || log.severity === severity
    const matchModule = module === 'all' || log.module === module
    return matchSearch && matchSeverity && matchModule
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5" role="main" aria-label="Audit Logs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Audit Logs</h1>
            <p className="text-xs text-slate-500">Complete timeline of all admin actions</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-800">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search audit logs"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'info', 'warning', 'error'].map((s) => (
              <button
                key={s}
                onClick={() => { setSeverity(s); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors',
                  severity === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                )}
              >
                {s}
              </button>
            ))}
            {['all', 'Users', 'Permissions', 'Platform', 'System', 'Managers'].map((m) => (
              <button
                key={m}
                onClick={() => { setModule(m); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                  module === m ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Audit log table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300">{log.action}</p>
                    <p className="text-xs text-slate-600">{log.user}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium border capitalize', SEVERITY_STYLES[log.severity])}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{log.module}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell font-mono">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 hidden lg:table-cell">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-600">{filtered.length} events · Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous page">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn('w-7 h-7 rounded-md text-xs font-medium transition-colors', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-500')} aria-current={p === page ? 'page' : undefined}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next page">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
