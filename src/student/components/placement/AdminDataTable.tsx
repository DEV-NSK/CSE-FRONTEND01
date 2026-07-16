import { useState } from 'react'
import { Search, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/utils'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface AdminDataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  total: number
  page: number
  pageSize?: number
  search?: string
  onSearchChange?: (v: string) => void
  onPageChange?: (p: number) => void
  onBulkDelete?: (ids: string[]) => void
  onExport?: () => void
  isLoading?: boolean
  actions?: (row: T) => React.ReactNode
  filterSlot?: React.ReactNode
}

export function AdminDataTable<T extends { id: string }>({
  data, columns, total, page, pageSize = 20, search, onSearchChange,
  onPageChange, onBulkDelete, onExport, isLoading, actions, filterSlot,
}: AdminDataTableProps<T>) {
  const [selected, setSelected] = useState<string[]>([])
  const totalPages = Math.ceil(total / pageSize)

  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map((r) => r.id))
  const toggleOne = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-3">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search"
              />
            </div>
          )}
          {filterSlot}
          <div className="flex items-center gap-2 ml-auto">
            {selected.length > 0 && onBulkDelete && (
              <Button variant="destructive" size="sm" className="gap-1.5 h-9"
                onClick={() => { onBulkDelete(selected); setSelected([]) }}>
                <Trash2 className="h-3.5 w-3.5" />Delete ({selected.length})
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onExport}>
                <Download className="h-3.5 w-3.5" />Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {onBulkDelete && (
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={data.length > 0 && selected.length === data.length}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-muted-foreground', col.className)}>
                    {col.label}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {onBulkDelete && <td className="px-4 py-3"><div className="h-4 w-4 bg-muted rounded animate-pulse" /></td>}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3" />}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onBulkDelete ? 1 : 0) + (actions ? 1 : 0)}
                    className="text-center text-muted-foreground py-12">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn('border-b border-border hover:bg-muted/30 transition-colors', selected.includes(row.id) && 'bg-primary/5')}
                  >
                    {onBulkDelete && (
                      <td className="px-4 py-3">
                        <Checkbox checked={selected.includes(row.id)} onCheckedChange={() => toggleOne(row.id)} aria-label="Select row" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3', col.className)}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
