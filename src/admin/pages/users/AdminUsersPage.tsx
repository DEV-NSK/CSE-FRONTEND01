import { useState } from 'react'
import {
  Users, Search, Trash2, UserCheck, UserX, Star, Eye,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'
import { useAdminUsers, useDeleteUser, usePromoteUser } from '@/shared/hooks/useAdmin'
import { useAdminDashboard as useDashboardOverview } from '@/shared/hooks/useAdminAnalytics'
import { timeAgo } from '@/shared/lib/time'

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  student: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  MANAGER: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  manager: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  SUPER_ADMIN: 'bg-red-900/40 text-red-300 border-red-700/40',
  super_admin: 'bg-red-900/40 text-red-300 border-red-700/40',
  MENTOR: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  mentor: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

const PAGE_SIZE = 20

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearch(val)
    clearTimeout((window as unknown as { _searchTimer: ReturnType<typeof setTimeout> })._searchTimer)
    ;(window as unknown as { _searchTimer: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, error, refetch } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const { data: overview } = useDashboardOverview()

  const deleteUser = useDeleteUser()
  const promoteUser = usePromoteUser()

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const allSelected = users.length > 0 && users.every((u) => selected.has(u.id))
  const toggleAll = () => {
    const next = new Set(selected)
    if (allSelected) users.forEach((u) => next.delete(u.id))
    else users.forEach((u) => next.add(u.id))
    setSelected(next)
  }
  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="space-y-5" role="main" aria-label="User Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">User Management</h1>
          <p className="text-xs text-slate-500">
            {total > 0 ? `${total.toLocaleString()} users total` : 'Manage all platform users'}
          </p>
        </div>
      </div>

      {/* Live Stats from real DB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {overview ? (
          <>
            {[
              { label: 'Total Users', value: overview.users.total.toLocaleString(), color: 'border-blue-700/40 bg-blue-500/5 text-blue-300' },
              { label: 'Students', value: overview.users.students.total.toLocaleString(), color: 'border-slate-700 bg-slate-900 text-slate-300' },
              { label: 'Managers', value: overview.users.managers.total.toLocaleString(), color: 'border-amber-700/40 bg-amber-500/5 text-amber-300' },
              { label: 'New Today', value: overview.users.newToday.toLocaleString(), color: 'border-emerald-700/40 bg-emerald-500/5 text-emerald-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
                <p className="text-xs opacity-70">{label}</p>
                <p className="text-2xl font-bold mt-0.5">{value}</p>
              </div>
            ))}
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-800">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              placeholder="Search users…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search users"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'All', value: '' },
              { label: 'Student', value: 'STUDENT' },
              { label: 'Manager', value: 'MANAGER' },
              { label: 'Mentor', value: 'MENTOR' },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => { setRoleFilter(value); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                  roleFilter === value ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
            <span className="text-xs font-semibold text-blue-300">{selected.size} selected</span>
            <button className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <UserCheck className="w-3.5 h-3.5" /> Activate
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selected)
                if (ids.length === 1) promoteUser.mutate({ id: ids[0] })
              }}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Star className="w-3.5 h-3.5" /> Promote
            </button>
            <button className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors">
              <UserX className="w-3.5 h-3.5" /> Suspend
            </button>
            <button
              onClick={() => {
                Array.from(selected).forEach((id) => deleteUser.mutate(id))
                setSelected(new Set())
              }}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 m-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-red-300">Failed to load users.</p>
            <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 ml-auto">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Users table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Last Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((user) => (
                    <tr
                      key={user.id}
                      className={cn(
                        'border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors',
                        selected.has(user.id) && 'bg-blue-500/5',
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(user.id)}
                          onChange={() => toggleOne(user.id)}
                          className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                          aria-label={`Select ${user.fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-slate-700 text-slate-300 text-xs font-semibold">
                              {user.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ?? '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-200 text-sm">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize',
                          ROLE_COLORS[user.role] ?? 'bg-slate-800 text-slate-400 border-slate-700',
                        )}>
                          {(user.role ?? '').toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                        {(user as unknown as Record<string, string>).collegeName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                        {user.createdAt ? timeAgo(user.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                        {(user as unknown as Record<string, string | null>).lastLoginAt
                          ? timeAgo((user as unknown as Record<string, string>).lastLoginAt)
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors"
                            aria-label={`View ${user.fullName}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {user.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => deleteUser.mutate(user.id)}
                              disabled={deleteUser.isPending}
                              className="p-1.5 rounded-md hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                              aria-label={`Delete ${user.fullName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            {total.toLocaleString()} results · Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-7 h-7 rounded-md text-xs font-medium transition-colors',
                  p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-500',
                )}
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
