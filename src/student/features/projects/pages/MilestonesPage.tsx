import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { MilestoneCard } from '@/student/components/project/MilestoneCard'
import { MilestoneCardSkeleton } from '@/student/components/project/ProjectSkeletons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { useTeam, useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { Milestone, MilestoneStatus } from '@/shared/types/project'

const STATUSES: MilestoneStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

export function MilestonesPage() {
  const { id: teamId } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | ''>('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'PENDING' as MilestoneStatus, completionPercentage: 0 })

  const { data: team } = useTeam(teamId!)
  const { data: milestonesData, isLoading } = useMilestones({ projectId: team?.projectId })
  const { mutate: createMilestone, isPending: creating } = useCreateMilestone()
  const { mutate: updateMilestone, isPending: updating } = useUpdateMilestone()
  const { mutate: deleteMilestone } = useDeleteMilestone()

  const myMembership = team?.members?.find((m) => m.userId === user?.id)
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'LEADER'

  const milestones = (milestonesData?.data ?? []).filter((m) => !statusFilter || m.status === statusFilter)

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((acc, m) => acc + m.completionPercentage, 0) / milestones.length)
    : 0

  const openCreate = () => {
    setEditingMilestone(null)
    setForm({ title: '', description: '', dueDate: '', status: 'PENDING', completionPercentage: 0 })
    setShowDialog(true)
  }

  const openEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setForm({
      title: milestone.title,
      description: milestone.description ?? '',
      dueDate: milestone.dueDate ? milestone.dueDate.substring(0, 10) : '',
      status: milestone.status,
      completionPercentage: milestone.completionPercentage,
    })
    setShowDialog(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim() || !team?.projectId) return
    if (editingMilestone) {
      updateMilestone(
        { id: editingMilestone.id, payload: { ...form, dueDate: form.dueDate || null }, projectId: team.projectId },
        {
          onSuccess: () => { toast({ title: 'Milestone updated' }); setShowDialog(false) },
          onError: () => toast({ title: 'Failed to update milestone', variant: 'destructive' }),
        }
      )
    } else {
      createMilestone(
        { projectId: team.projectId, title: form.title, description: form.description || undefined, dueDate: form.dueDate || undefined, status: form.status },
        {
          onSuccess: () => { toast({ title: 'Milestone created!' }); setShowDialog(false) },
          onError: () => toast({ title: 'Failed to create milestone', variant: 'destructive' }),
        }
      )
    }
  }

  const handleDelete = (milestone: Milestone) => {
    deleteMilestone(
      { id: milestone.id, projectId: team?.projectId },
      {
        onSuccess: () => toast({ title: 'Milestone deleted' }),
        onError: () => toast({ title: 'Failed to delete', variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milestones"
        description={team?.name}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team?.name ?? 'Team', href: `/dashboard/projects/team/${teamId}` },
          { label: 'Milestones' },
        ]}
        actions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Milestone
            </Button>
          ) : undefined
        }
      />

      {/* Progress summary */}
      {milestones.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100}>
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {milestones.filter((m) => m.status === 'COMPLETED').length}/{milestones.length} completed
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MilestoneStatus | '')}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Milestones */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <MilestoneCardSkeleton key={i} />)}</div>
      ) : milestones.length > 0 ? (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          className="space-y-3"
        >
          {milestones.map((m) => (
            <motion.div key={m.id} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
              <MilestoneCard
                milestone={m}
                canManage={canManage}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="No milestones"
          description={statusFilter ? 'No milestones with this status.' : 'Create milestones to track project progress.'}
          action={canManage ? { label: 'Add Milestone', onClick: openCreate } : undefined}
        />
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMilestone ? 'Edit Milestone' : 'Create Milestone'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Milestone title"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as MilestoneStatus }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingMilestone && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Completion % ({form.completionPercentage}%)</label>
                <input
                  type="range" min={0} max={100}
                  value={form.completionPercentage}
                  onChange={(e) => setForm((f) => ({ ...f, completionPercentage: Number(e.target.value) }))}
                  className="w-full"
                  aria-label="Completion percentage"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={creating || updating} disabled={!form.title.trim()}>
              {editingMilestone ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
