import { useState } from 'react'
import { Users, Search, Trash2, UserCheck, UserX, Star, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'

const mockUsers = Array.from({ length: 50 }, (_, i) => ({
  id: `u${i + 1}`,
  fullName: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Williams', 'Frank Castle', 'Grace Hopper', 'Henry Ford'][i % 8],
  email: `user${i + 1}@cse.dev`,
  role: i % 15 === 0 ? 'manager' : 'student',
  status: i % 7 === 0 ? 'suspended' : 'active',
  college: ['IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore'][i % 4],
  joinedAt: `Jul ${(i % 17) + 1}, 2026`,
  lastActive: i % 3 === 0 ? '2h ago' : i % 3 === 1 ? 'Yesterday' : '3d ago',
}))

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  manager: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  admin: 'bg-red-900/40 text-red-300 border-red-700/40',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  suspended: 'bg-red-900/40 text-red-300 border-red-700/40',
  inactive: 'bg-slate-800 text-slate-500 border-slate-700',
}

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const allSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id))

  const toggleAll = () => {
    const next = new Set(selected)
    if (allSelected) paginated.forEach((u) => next.delete(u.id))
    else paginated.forEach((u) => next.add(u.id))
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
          <p className="text-xs text-slate-500">Manage all platform users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: '2,847', color: 'border-blue-700/40 bg-blue-500/5 text-blue-300' },
          { label: 'Students', value: '2,823', color: 'border-slate-700 bg-slate-900 text-slate-300' },
          { label: 'Managers', value: '24', color: 'border-amber-700/40 bg-amber-500/5 text-amber-300' },
          { label: 'Suspended', value: '12', color: 'border-red-700/40 bg-red-500/5 text-red-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-xs opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-800">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search users"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'student', 'manager'].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors capitalize',
                  roleFilter === r ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                )}
              >
                {r}
              </button>
            ))}
            {['all', 'active', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors capitalize',
                  statusFilter === s ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-shrink-0">+ Add User</Button>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
            <span className="text-xs font-semibold text-blue-300">{selected.size} selected</span>
            <button className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <UserCheck className="w-3.5 h-3.5" /> Activate
            </button>
            <button className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors">
              <Star className="w-3.5 h-3.5" /> Promote
            </button>
            <button className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors">
              <UserX className="w-3.5 h-3.5" /> Suspend
            </button>
            <button className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Users table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" aria-label="Select all" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Last Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id} className={cn('border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors', selected.has(user.id) && 'bg-blue-500/5')}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleOne(user.id)} className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" aria-label={`Select ${user.fullName}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-slate-700 text-slate-300 text-xs font-semibold">
                          {user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-200">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize', ROLE_COLORS[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize', STATUS_COLORS[user.status])}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{user.college}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{user.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors" aria-label={`View ${user.fullName}`}>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors" aria-label={`Delete ${user.fullName}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
            {filtered.length} results · Page {page} of {totalPages}
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
                  p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-500'
                )}
                aria-label={`Page ${p}`}
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
