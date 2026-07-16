import { useState } from 'react'
import { Search, Filter, Trash2, Eye, EyeOff, Archive, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export type ContentStatus = 'published' | 'draft' | 'archived'

export interface ContentRow {
  id: string
  title: string
  status: ContentStatus
  category?: string
  updatedAt: string
  author?: string
  extra?: string
}

interface ContentTableProps {
  title: string
  rows: ContentRow[]
  columns?: { key: string; label: string }[]
  onCreateNew?: () => void
  createLabel?: string
  loading?: boolean
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
}

const PAGE_SIZE = 8

export function ContentTable({ title, rows, onCreateNew, createLabel = 'Create New', loading }: ContentTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const filtered = rows.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allPageSelected = paginated.length > 0 && paginated.every((r) => selected.has(r.id))

  const toggleAll = () => {
    if (allPageSelected) {
      const next = new Set(selected)
      paginated.forEach((r) => next.delete(r.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      paginated.forEach((r) => next.add(r.id))
      setSelected(next)
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 flex-shrink-0">{title}</h2>
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
              aria-label={`Search ${title}`}
            />
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'published', 'draft', 'archived'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                  statusFilter === s
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-3 text-xs flex-shrink-0">
            + {createLabel}
          </Button>
        )}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
          <span className="text-xs font-semibold text-violet-700">{selected.size} selected</span>
          <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Publish
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-600 transition-colors">
            <EyeOff className="w-3.5 h-3.5" /> Draft
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-500 transition-colors">
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label={`${title} table`}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-4 py-3" colSpan={6}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  No content found
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className={cn('border-b border-slate-50 hover:bg-slate-50/50 transition-colors', selected.has(row.id) && 'bg-violet-50/30')}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      aria-label={`Select ${row.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[200px]">{row.title}</p>
                    {row.author && <p className="text-xs text-slate-400 mt-0.5">{row.author}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', STATUS_COLORS[row.status])}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{row.category || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{row.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label={`Edit ${row.title}`}>
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" aria-label={`Delete ${row.title}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}–{Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length} results
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-400 text-xs">…</span>}
                <button
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-7 h-7 rounded-md text-xs font-medium transition-colors',
                    p === page ? 'bg-violet-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                  )}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
