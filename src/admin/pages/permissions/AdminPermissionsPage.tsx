import { Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAdminManagers, useUpdateManagerPermissions } from '@/shared/hooks/useAdmin'

// Canonical module list matching the backend PermissionModule enum
const MODULE_KEYS = ['LEARNING', 'CODING', 'PROJECTS', 'PLACEMENTS', 'EVENTS', 'NOTIFICATIONS', 'REPORTS'] as const
type Module = typeof MODULE_KEYS[number]

// Permission columns shown in the matrix
const PERMISSION_COLS = [
  { key: 'canRead',    label: 'Read' },
  { key: 'canCreate',  label: 'Create' },
  { key: 'canUpdate',  label: 'Update' },
  { key: 'canDelete',  label: 'Delete' },
  { key: 'canPublish', label: 'Publish' },
] as const

type PermCol = typeof PERMISSION_COLS[number]['key']

interface RawPermission {
  module: Module
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canPublish: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

function getPermValue(perms: RawPermission[], module: Module, col: PermCol): boolean {
  return perms.find((p) => p.module === module)?.[col] ?? false
}

export default function AdminPermissionsPage() {
  const { data, isLoading, error, refetch } = useAdminManagers({ limit: 50 })
  const updatePerms = useUpdateManagerPermissions()

  const managers = data?.data ?? []

  const handleToggle = (
    managerId: string,
    currentPerms: RawPermission[],
    module: Module,
    col: PermCol,
    checked: boolean,
  ) => {
    // Build updated permissions object for this manager
    const updated: Record<string, boolean> = {}
    MODULE_KEYS.forEach((m) => {
      PERMISSION_COLS.forEach(({ key }) => {
        const fieldKey = `${m.toLowerCase()}_${key}`
        const current = getPermValue(currentPerms, m, key)
        updated[fieldKey] = m === module && key === col ? checked : current
      })
    })
    // The backend updateManagerPermissions endpoint accepts flat { learning: true, coding: false, ... }
    // so we re-map to what the backend expects (module-level canRead flag as the simple boolean)
    const simple: Record<string, boolean> = {}
    MODULE_KEYS.forEach((m) => {
      simple[m.toLowerCase()] = m === module
        ? col === 'canRead' ? checked : getPermValue(currentPerms, m, 'canRead')
        : getPermValue(currentPerms, m, 'canRead')
    })
    updatePerms.mutate({ id: managerId, permissions: simple })
  }

  return (
    <div className="space-y-5" role="main" aria-label="Permission Management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Permission Management</h1>
            <p className="text-xs text-slate-500">
              {isLoading ? 'Loading…' : `${managers.length} managers · live from database`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Refresh permissions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300 flex-1">Failed to load managers and permissions.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300">Retry</button>
        </div>
      )}

      {/* Per-manager permission matrix */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : managers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-slate-700 mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-500">No managers found. Promote a student to Manager first.</p>
        </div>
      ) : (
        managers.map((mgr) => {
          const perms = ((mgr as Record<string, unknown>).managerPermissions as RawPermission[] | undefined) ?? []
          return (
            <div key={mgr.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Manager header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/40">
                <div>
                  <p className="text-sm font-semibold text-white">{mgr.fullName}</p>
                  <p className="text-xs text-slate-500">{mgr.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-900/30 text-amber-400 border border-amber-700/30 font-medium">
                  Manager
                </span>
              </div>

              {/* Permission matrix for this manager */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label={`Permissions for ${mgr.fullName}`}>
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Module</th>
                      {PERMISSION_COLS.map(({ label }) => (
                        <th key={label} className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULE_KEYS.map((module) => (
                      <tr key={module} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-2.5">
                          <span className="text-sm font-medium text-slate-300 capitalize">
                            {module.charAt(0) + module.slice(1).toLowerCase()}
                          </span>
                        </td>
                        {PERMISSION_COLS.map(({ key, label }) => (
                          <td key={key} className="px-4 py-2.5 text-center">
                            <input
                              type="checkbox"
                              defaultChecked={getPermValue(perms, module, key)}
                              onChange={(e) => handleToggle(mgr.id, perms, module, key, e.target.checked)}
                              disabled={updatePerms.isPending}
                              className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer w-4 h-4 disabled:opacity-50"
                              aria-label={`${label} for ${module} — ${mgr.fullName}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}

      {/* Role-level summary (static reference — not editable role config) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Role Access Reference</h2>
          <p className="text-xs text-slate-500 mt-0.5">Default access levels by system role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Role access reference table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-56">Permission</th>
                {['Student', 'Manager', 'Super Admin'].map((role) => (
                  <th key={role} className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'View Content',      access: [true,  true,  true]  },
                { label: 'Create Content',     access: [false, true,  true]  },
                { label: 'Publish Content',    access: [false, false, true]  },
                { label: 'Delete Content',     access: [false, false, true]  },
                { label: 'View Users',         access: [false, false, true]  },
                { label: 'Manage Users',       access: [false, false, true]  },
                { label: 'Platform Settings',  access: [false, false, true]  },
                { label: 'Platform Analytics', access: [false, false, true]  },
                { label: 'Audit Logs',         access: [false, false, true]  },
              ].map(({ label, access }) => (
                <tr key={label} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-2.5 text-sm text-slate-300">{label}</td>
                  {access.map((granted, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                        granted ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-600',
                      )}>
                        {granted ? '✓' : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
