import { useState } from 'react'
import { UserCog, Plus, Trash2, UserMinus, Shield, Eye } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

const mockManagers = [
  { id: '1', name: 'Sarah Connor', email: 'sarah@cse.dev', department: 'CSE', designation: 'Senior Manager', permissions: ['learning', 'coding', 'projects', 'placements', 'events'], status: 'active', joinedAt: 'Jan 2026', lastActive: '1h ago' },
  { id: '2', name: 'John Doe', email: 'john@cse.dev', department: 'IT', designation: 'Content Manager', permissions: ['learning', 'coding'], status: 'active', joinedAt: 'Feb 2026', lastActive: '3h ago' },
  { id: '3', name: 'Emily Chen', email: 'emily@cse.dev', department: 'Placements', designation: 'Placement Manager', permissions: ['placements', 'events', 'notifications'], status: 'active', joinedAt: 'Mar 2026', lastActive: 'Yesterday' },
  { id: '4', name: 'James Wilson', email: 'james@cse.dev', department: 'CSE', designation: 'Junior Manager', permissions: ['learning'], status: 'inactive', joinedAt: 'Apr 2026', lastActive: '5d ago' },
]

const ALL_PERMISSIONS = ['learning', 'coding', 'projects', 'placements', 'events', 'notifications', 'reports']

export default function AdminManagersPage() {
  const [view, setView] = useState<'list' | 'matrix'>('list')

  return (
    <div className="space-y-5" role="main" aria-label="Manager Management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
            <UserCog className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Manager Management</h1>
            <p className="text-xs text-slate-500">Manage managers and their permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setView('list')} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500')} aria-pressed={view === 'list'}>List</button>
            <button onClick={() => setView('matrix')} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', view === 'matrix' ? 'bg-slate-700 text-white' : 'text-slate-500')} aria-pressed={view === 'matrix'}>Permission Matrix</button>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> Create Manager
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockManagers.map((mgr) => (
            <div key={mgr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-amber-800 text-amber-200 font-bold text-sm">
                      {mgr.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white text-sm">{mgr.name}</p>
                    <p className="text-xs text-slate-500">{mgr.email}</p>
                    <p className="text-xs text-amber-400 mt-0.5">{mgr.designation} · {mgr.department}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-md font-medium border',
                  mgr.status === 'active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                )}>
                  {mgr.status}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {mgr.permissions.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-900/30 text-blue-300 border border-blue-700/30 capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-600">Last active: {mgr.lastActive}</span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors" aria-label={`View ${mgr.name}`}>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-amber-900/30 text-slate-500 hover:text-amber-400 transition-colors" aria-label={`Manage permissions for ${mgr.name}`}>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors" aria-label={`Remove ${mgr.name}`}>
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Permission Matrix */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Permission Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Grant or revoke permissions per manager</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Permission matrix">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-48">Manager</th>
                  {ALL_PERMISSIONS.map((p) => (
                    <th key={p} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 capitalize whitespace-nowrap">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockManagers.map((mgr) => (
                  <tr key={mgr.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-200">{mgr.name}</p>
                      <p className="text-xs text-slate-500">{mgr.designation}</p>
                    </td>
                    {ALL_PERMISSIONS.map((perm) => {
                      const hasPermission = mgr.permissions.includes(perm)
                      return (
                        <td key={perm} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            defaultChecked={hasPermission}
                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer"
                            aria-label={`${perm} permission for ${mgr.name}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Save Permissions</Button>
          </div>
        </div>
      )}
    </div>
  )
}
