import { useState } from 'react'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { AdminDataTable, Column } from '@/shared/components/placement/AdminDataTable'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog'
import { useAdminUsers, useDeleteUser, useUpdateUserRole } from '@/shared/hooks/useAdmin'
import { useToast } from '@/shared/hooks/useToast'
import { formatDate } from '@/shared/lib/utils'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import type { AdminUser } from '@/shared/types/admin'

const roleColors: Record<string, 'default' | 'info' | 'warning'> = {
  admin: 'default',
  instructor: 'info',
  student: 'warning',
}

export function AdminUsersPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading } = useAdminUsers({ search, role: role || undefined, page, limit: 20 })
  const deleteUser = useDeleteUser()
  const updateRole = useUpdateUserRole()

  if (user?.role !== 'admin') return <Navigate to="/403" replace />

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser.mutateAsync(deleteId)
      toast({ title: 'User deleted' })
    } catch { toast({ title: 'Error', description: 'Could not delete user.', variant: 'destructive' }) }
    setDeleteId(null)
  }

  const columns: Column<AdminUser>[] = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email', className: 'text-muted-foreground' },
    {
      key: 'role', label: 'Role',
      render: (row) => <Badge variant={roleColors[row.role]}>{row.role}</Badge>,
    },
    {
      key: 'isVerified', label: 'Status',
      render: (row) => <Badge variant={row.isVerified ? 'success' : 'secondary'}>{row.isVerified ? 'Verified' : 'Unverified'}</Badge>,
    },
    { key: 'createdAt', label: 'Joined', render: (row) => <span className="text-muted-foreground text-xs">{formatDate(row.createdAt)}</span> },
    { key: 'college', label: 'College', className: 'text-muted-foreground hidden lg:table-cell' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={`${data?.total ?? 0} total users`}
        breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Users' }]}
      />

      <AdminDataTable
        data={data?.data ?? []}
        columns={columns}
        total={data?.total ?? 0}
        page={page}
        pageSize={20}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        isLoading={isLoading}
        onBulkDelete={async (ids) => { for (const id of ids) await deleteUser.mutateAsync(id) }}
        onExport={() => toast({ title: 'Export coming soon' })}
        filterSlot={
          <Select value={role || 'all'} onValueChange={(v) => { setRole(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateRole.mutate({ id: row.id, role: row.role === 'admin' ? 'student' : 'admin' })}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />{row.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(row.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete User" description="This will permanently delete the user and all their data."
        confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} />
    </div>
  )
}
