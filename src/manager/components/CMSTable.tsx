/**
 * FPRD-10: CMSTable — Enterprise data table with real API integration
 * Replaces ContentTable with: real data, bulk ops, confirm dialogs, full actions
 */
import { useState, useCallback } from 'react'
import {
  Search, Trash2, Eye, EyeOff, Archive, ChevronLeft, ChevronRight,
  Plus, Edit2, Copy, MoreHorizontal, RefreshCw, AlertTriangle,
  ArchiveRestore, Filter,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'

export type CMSStatus = 'published' | 'draft' | 'archived'

export interface CMSRow {
  id: string
  title: string
  status?: CMSStatus
  isPublished?: boolean
  subtitle?: string
  badge?: string
  badgeColor?: string
  meta?: string
  extra?: string
  createdAt?: string
  updatedAt?: string
}

export interface CMSColumn {
  key: string
  label: string
  render?: (row: CMSRow) => React.ReactNode
}

interface CMSTableProps {
  title: string
  rows: CMSRow[]
  columns?: CMSColumn[]
  total?: number
  page?: number
  pageSize?: number
  loading?: boolean
  search?: string
  statusFilter?: string
  onSearchChange?: (v: string) => void
  onStatusChange?: (v: string) => void
  onPageChange?: (p: number) => void
  onCreateNew?: () => void
  createLabel?: string
  onEdit?: (row: CMSRow) => void
  onDelete?: (id: string) => void
  onPublish?: (id: string) => void
  onArchive?: (id: string) => void
  onDuplicate?: (id: string) => void
  onRestore?: (id: string) => void
  onBulkPublish?: (ids: string[]) => void
  onBulkArchive?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  extraFilters?: React.ReactNode
  /** Show/hide action buttons */
  actions?: {
    edit?: boolean
    delete?: boolean
    publish?: boolean
    archive?: boolean
    duplicate?: boolean
    restore?: boolean
  }
}

const STATUS_MAP = {
  published: { label: 'Published', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Draft', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived: { label: 'Archived', class: 'bg-slate-100 text-slate-500 border-slate-200' },
}

function deriveStatus(row: CMSRow): CMSStatus {
  if (row.status) return row.status
  if (row.isPublished === true) return 'published'
  if (row.isPublished === false) return 'draft'
  return 'draft'
}

export function CMSTable({
  title, rows, columns, total, page = 1, pageSize = 20, loading,
  search = '', statusFilter = 'all',
  onSearchChange, onStatusChange, onPageChange,
  onCreateNew, createLabel = 'Create New',
  onEdit, onDelete, onPublish, onArchive, onDuplicate, onRestore,
  onBulkPublish, onBulkArchive, onBulkDelete,
  extraFilters,
  actions = { edit: true, delete: true, publish: true, archive: true, duplicate: false, restore: false },
}: CMSTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false })

  const totalPages = Math.max(1, Math.ceil((total ?? rows.length) / pageSize))
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected)
      rows.forEach((r) => next.delete(r.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      rows.forEach((r) => next.add(r.id))
      setSelected(next)
    }
  }

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDeleteConfirmed = () => {
    if (confirmDelete.bulk) {
      onBulkDelete?.(Array.from(selected))
      setSelected(new Set())
    } else if (confirmDelete.id) {
      onDelete?.(confirmDelete.id)
    }
    setConfirmDelete({ open: false })
  }

  const formatDate = (d?: string) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d }
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-800 flex-shrink-0 hidden sm:block">{title}</span>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* Search */}
            {onSearchChange && (
              <div className="relative min-w-[160px] flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                  aria-label={`Search ${title}`}
                />
              </div>
            )}
            {/* Status filter */}
            {onStatusChange && (
              <div className="flex items-center gap-1">
                {(['all', 'published', 'draft', 'archived'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                      statusFilter === s ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {extraFilters}
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-3 text-xs flex-shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" />
              {createLabel}
            </Button>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
            <span className="text-xs font-semibold text-violet-700">{selected.size} selected</span>
            {onBulkPublish && (
              <button onClick={() => { onBulkPublish(Array.from(selected)); setSelected(new Set()) }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Publish
              </button>
            )}
            {onBulkArchive && (
              <button onClick={() => { onBulkArchive(Array.from(selected)); setSelected(new Set()) }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-500 transition-colors">
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
            )}
            {onBulkDelete && (
              <button onClick={() => setConfirmDelete({ open: true, bulk: true })}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-400 hover:text-slate-600">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label={`${title} table`}>
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    aria-label="Select all" />
                </th>
                {columns ? (
                  columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {col.label}
                    </th>
                  ))
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Extra</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Updated</th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-4 py-3" colSpan={(columns?.length ?? 4) + 2}>
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={(columns?.length ?? 4) + 2} className="px-4 py-12 text-center text-sm text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No {title.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const status = deriveStatus(row)
                  const statusCfg = STATUS_MAP[status]
                  return (
                    <tr key={row.id} className={cn('border-b border-slate-50 hover:bg-slate-50/50 transition-colors', selected.has(row.id) && 'bg-violet-50/30')}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          aria-label={`Select ${row.title}`} />
                      </td>
                      {columns ? (
                        columns.map((col) => (
                          <td key={col.key} className="px-4 py-3">
                            {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode ?? '—'}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 truncate max-w-[220px]">{row.title}</p>
                            {row.subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{row.subtitle}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', statusCfg.class)}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                            {row.badge ? (
                              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', row.badgeColor ?? 'bg-slate-50 text-slate-600 border-slate-200')}>
                                {row.badge}
                              </span>
                            ) : row.extra ?? row.meta ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{formatDate(row.updatedAt ?? row.createdAt)}</td>
                        </>
                      )}
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Actions">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {actions.edit && onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(row)}>
                                  <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-500" />Edit
                                </DropdownMenuItem>
                              )}
                              {actions.duplicate && onDuplicate && (
                                <DropdownMenuItem onClick={() => onDuplicate(row.id)}>
                                  <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />Duplicate
                                </DropdownMenuItem>
                              )}
                              {actions.publish && onPublish && status !== 'published' && (
                                <DropdownMenuItem onClick={() => onPublish(row.id)}>
                                  <Eye className="w-3.5 h-3.5 mr-2 text-emerald-500" />Publish
                                </DropdownMenuItem>
                              )}
                              {actions.archive && onArchive && status === 'published' && (
                                <DropdownMenuItem onClick={() => onArchive(row.id)}>
                                  <EyeOff className="w-3.5 h-3.5 mr-2 text-amber-500" />Set Draft
                                </DropdownMenuItem>
                              )}
                              {actions.restore && onRestore && status === 'archived' && (
                                <DropdownMenuItem onClick={() => onRestore(row.id)}>
                                  <ArchiveRestore className="w-3.5 h-3.5 mr-2 text-blue-500" />Restore
                                </DropdownMenuItem>
                              )}
                              {actions.delete && onDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setConfirmDelete({ open: true, id: row.id })} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {total != null ? `${total} total` : `${rows.length} results`}
            {total != null && ` · Page ${page} of ${totalPages}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => onPageChange?.(Math.max(1, page - 1))} disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => onPageChange?.(p)}
                    className={cn('w-7 h-7 rounded-md text-xs font-medium transition-colors', p === page ? 'bg-violet-600 text-white' : 'hover:bg-slate-100 text-slate-600')}
                    aria-current={p === page ? 'page' : undefined}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => onPageChange?.(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete.open} onOpenChange={(o) => !o && setConfirmDelete({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              {confirmDelete.bulk
                ? `Are you sure you want to permanently delete ${selected.size} selected items? This action cannot be undone.`
                : 'Are you sure you want to permanently delete this item? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
