import { useState } from 'react'
import { LayoutGrid, List, KanbanSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { ApplicationCard } from '@/student/components/placement/ApplicationCard'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog'
import { Briefcase } from 'lucide-react'
import { useApplications, useDeleteApplication, useUpdateApplicationStatus } from '@/shared/hooks/usePlacement'
import { usePlacementStore } from '@/shared/store/placementStore'
import { useToast } from '@/shared/hooks/useToast'
import type { ApplicationStatus, Application } from '@/shared/types/placement'

const KANBAN_COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'saved', label: 'Saved', color: 'bg-gray-100 dark:bg-gray-800' },
  { status: 'applied', label: 'Applied', color: 'bg-blue-50 dark:bg-blue-950/30' },
  { status: 'oa', label: 'Online Assessment', color: 'bg-amber-50 dark:bg-amber-950/30' },
  { status: 'interview', label: 'Interview', color: 'bg-orange-50 dark:bg-orange-950/30' },
  { status: 'hr', label: 'HR Round', color: 'bg-purple-50 dark:bg-purple-950/30' },
  { status: 'offered', label: 'Offered', color: 'bg-green-50 dark:bg-green-950/30' },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-50 dark:bg-red-950/30' },
]

export function ApplicationsPage() {
  const { applicationsViewMode, setApplicationsViewMode } = usePlacementStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading } = useApplications({ limit: 100 })
  const deleteApp = useDeleteApplication()
  const updateStatus = useUpdateApplicationStatus()

  const applications = data?.data ?? []

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteApp.mutateAsync(deleteId)
      toast({ title: 'Removed', description: 'Application removed.' })
    } catch { toast({ title: 'Error', description: 'Could not remove application.', variant: 'destructive' }) }
    setDeleteId(null)
  }

  const groupedByStatus = KANBAN_COLUMNS.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, col) => {
      acc[col.status] = applications.filter((a) => a.status === col.status)
      return acc
    },
    {} as Record<ApplicationStatus, Application[]>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Applications"
        description={`${applications.length} applications tracked`}
        breadcrumbs={[{ label: 'Placement', href: '/dashboard/placement' }, { label: 'Applications' }]}
        actions={
          <div className="flex items-center border rounded-md h-9">
            <Button variant={applicationsViewMode === 'kanban' ? 'default' : 'ghost'} size="icon-sm" className="rounded-r-none h-9" onClick={() => setApplicationsViewMode('kanban')} aria-label="Kanban view">
              <KanbanSquare className="h-4 w-4" />
            </Button>
            <Button variant={applicationsViewMode === 'table' ? 'default' : 'ghost'} size="icon-sm" className="rounded-l-none h-9" onClick={() => setApplicationsViewMode('table')} aria-label="Table view">
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.slice(0, 4).map((col) => (
            <div key={col.status} className="w-64 shrink-0 space-y-3">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-12 w-12" />} title="No applications yet" description="Start applying to jobs to track them here." />
      ) : applicationsViewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <motion.div key={col.status} className={`w-72 shrink-0 rounded-lg p-3 ${col.color}`} layout>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{groupedByStatus[col.status]?.length ?? 0}</Badge>
              </div>
              <AnimatePresence>
                <div className="space-y-2">
                  {(groupedByStatus[col.status] ?? []).map((app) => (
                    <motion.div key={app.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ApplicationCard application={app} onDelete={(id) => setDeleteId(id)} compact />
                    </motion.div>
                  ))}
                  {(groupedByStatus[col.status] ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                  )}
                </div>
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onDelete={(id) => setDeleteId(id)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Application"
        description="Remove this application from your tracker? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
