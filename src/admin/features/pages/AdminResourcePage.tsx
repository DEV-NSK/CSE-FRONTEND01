import { useState } from 'react'
import { Trash2, MoreVertical, Plus } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { AdminDataTable, Column } from '@/shared/components/placement/AdminDataTable'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog'
import { useAdminResource, useDeleteAdminResource, useBulkDeleteAdminResource } from '@/shared/hooks/useAdmin'
import { useToast } from '@/shared/hooks/useToast'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { formatDate } from '@/shared/lib/utils'

interface AdminResourcePageProps {
  resource: string
  title: string
  columns?: Column<Record<string, unknown>>[]
}

const defaultColumns = (resource: string): Column<Record<string, unknown>>[] => [
  { key: 'title', label: 'Title', render: (row) => <span className="font-medium">{(row.title ?? row.name ?? row.slug ?? row.id) as string}</span> },
  { key: 'createdAt', label: 'Created', render: (row) => <span className="text-xs text-muted-foreground">{row.createdAt ? formatDate(row.createdAt as string) : '—'}</span> },
  { key: 'status', label: 'Status', render: (row) => <span className="text-xs capitalize text-muted-foreground">{(row.status as string) ?? '—'}</span> },
]

export function AdminResourcePage({ resource, title, columns }: AdminResourcePageProps) {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading } = useAdminResource<Record<string, unknown>>(resource, { search, page, limit: 20 })
  const deleteResource = useDeleteAdminResource(resource)
  const bulkDelete = useBulkDeleteAdminResource(resource)

  if (user?.role !== 'admin') return <Navigate to="/403" replace />

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteResource.mutateAsync(deleteId)
      toast({ title: `${title} deleted` })
    } catch { toast({ title: 'Error', description: 'Delete failed.', variant: 'destructive' }) }
    setDeleteId(null)
  }

  const cols: Column<Record<string, unknown>>[] = columns ?? defaultColumns(resource)

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={`${data?.total ?? 0} total records`}
        breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: title }]}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />Add {title.slice(0, -1)}
          </Button>
        }
      />

      <AdminDataTable
        data={data?.data ?? []}
        columns={cols}
        total={data?.total ?? 0}
        page={page}
        pageSize={20}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        isLoading={isLoading}
        onBulkDelete={async (ids) => { await bulkDelete.mutateAsync(ids); toast({ title: 'Deleted selected records' }) }}
        onExport={() => toast({ title: 'Export coming soon' })}
        actions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(row.id as string)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <ConfirmDialog
        open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title={`Delete ${title.slice(0, -1)}`}
        description="This action cannot be undone."
        confirmLabel="Delete" variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
