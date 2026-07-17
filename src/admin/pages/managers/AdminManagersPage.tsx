import { useState } from 'react'
import { UserCog, Plus, UserMinus, Shield, Eye, AlertCircle, RefreshCw, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAdminManagers, useUpdateManagerPermissions, useDemoteUser, useSendManagerInvitation } from '@/shared/hooks/useAdmin'
import { timeAgo } from '@/shared/lib/time'

const MODULE_KEYS = ['LEARNING', 'CODING', 'PROJECTS', 'PLACEMENTS', 'EVENTS', 'NOTIFICATIONS', 'REPORTS']

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

export default function AdminManagersPage() {
  const [view, setView] = useState<'list' | 'matrix'>('list')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)

  const { data, isLoading, error, refetch } = useAdminManagers({ limit: 50 })
  const updatePerms = useUpdateManagerPermissions()
  const demoteUser = useDemoteUser()
  const sendInvitation = useSendManagerInvitation()

  const managers = data?.data ?? []

  const handleInvite = () => {
    if (!inviteEmail) return
    sendInvitation.mutate(inviteEmail, {
      onSuccess: () => {
        setInviteEmail('')
        setShowInviteForm(false)
      },
    })
  }

  const getManagerModules = (mgr: Record<string, unknown>) => {
    const perms = (mgr.managerPermissions as { module: string; canRead: boolean }[] | undefined) ?? []
    return perms.filter((p) => p.canRead).map((p) => p.module)
  }

  return (
    <div className="space-y-5" role="main" aria-label="Manager Management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
            <UserCog className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Manager Management</h1>
            <p className="text-xs text-slate-500">
              {isLoading ? 'Loading…' : `${data?.total ?? 0} managers`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500')}
              aria-pressed={view === 'list'}
            >
              List
            </button>
            <button
              onClick={() => setView('matrix')}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', view === 'matrix' ? 'bg-slate-700 text-white' : 'text-slate-500')}
              aria-pressed={view === 'matrix'}
            >
              Permission Matrix
            </button>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            onClick={() => setShowInviteForm((v) => !v)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> Invite Manager
          </Button>
        </div>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="bg-slate-900 border border-blue-700/30 rounded-xl p-4 flex items-center gap-3">
          <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <input
            type="email"
            placeholder="manager@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            onClick={handleInvite}
            disabled={sendInvitation.isPending}
          >
            {sendInvitation.isPending ? 'Sending…' : 'Send Invite'}
          </Button>
          {sendInvitation.isSuccess && (
            <span className="text-xs text-emerald-400">Invitation sent!</span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-xs text-red-300 flex-1">Failed to load managers.</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)
            : managers.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-slate-600">
                  <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No managers found</p>
                </div>
              )
            : managers.map((mgr) => {
                const modules = getManagerModules(mgr as Record<string, unknown>)
                const lastLogin = (mgr as Record<string, unknown>).lastLoginAt as string | null
                return (
                  <div key={mgr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-amber-800 text-amber-200 font-bold text-sm">
                            {mgr.fullName?.split(' ').map((n: string) => n[0]).join('') ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white text-sm">{mgr.fullName}</p>
                          <p className="text-xs text-slate-500">{mgr.email}</p>
                          <p className="text-xs text-amber-400 mt-0.5">Manager</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-700/30">
                        active
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Modules</p>
                      <div className="flex flex-wrap gap-1.5">
                        {modules.length > 0
                          ? modules.map((m) => (
                              <span key={m} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-900/30 text-blue-300 border border-blue-700/30 capitalize">
                                {m.toLowerCase()}
                              </span>
                            ))
                          : <span className="text-xs text-slate-600">No modules assigned</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <span className="text-xs text-slate-600">
                        {lastLogin ? `Active ${timeAgo(lastLogin)}` : 'Never logged in'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors" aria-label={`View ${mgr.fullName}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-amber-900/30 text-slate-500 hover:text-amber-400 transition-colors" aria-label={`Manage permissions for ${mgr.fullName}`}>
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => demoteUser.mutate({ id: mgr.id, reason: 'Demoted by admin' })}
                          disabled={demoteUser.isPending}
                          className="p-1.5 rounded-md hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                          aria-label={`Remove ${mgr.fullName}`}
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
        </div>
      )}

      {/* Matrix View */}
      {view === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Permission Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live permissions from database — changes save immediately</p>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Permission matrix">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-48">Manager</th>
                    {MODULE_KEYS.map((m) => (
                      <th key={m} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 capitalize whitespace-nowrap">
                        {m.toLowerCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {managers.map((mgr) => {
                    const perms = ((mgr as Record<string, unknown>).managerPermissions as { module: string; canRead: boolean }[] | undefined) ?? []
                    const hasModule = (mod: string) => perms.some((p) => p.module === mod && p.canRead)
                    return (
                      <tr key={mgr.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-200">{mgr.fullName}</p>
                          <p className="text-xs text-slate-500">{mgr.email}</p>
                        </td>
                        {MODULE_KEYS.map((mod) => (
                          <td key={mod} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              defaultChecked={hasModule(mod)}
                              onChange={(e) => {
                                const current: Record<string, boolean> = {}
                                MODULE_KEYS.forEach((m) => { current[m.toLowerCase()] = hasModule(m) })
                                current[mod.toLowerCase()] = e.target.checked
                                updatePerms.mutate({ id: mgr.id, permissions: current })
                              }}
                              className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer"
                              aria-label={`${mod} for ${mgr.fullName}`}
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
