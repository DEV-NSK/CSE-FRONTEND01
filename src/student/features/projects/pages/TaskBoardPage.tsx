import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, LayoutGrid, List, Calendar, Search, Filter,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { KanbanBoard } from '@/student/components/project/KanbanBoard'
import { TaskCard } from '@/student/components/project/TaskCard'
import { KanbanSkeleton, TaskCardSkeleton } from '@/student/components/project/ProjectSkeletons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { useTeam, useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/shared/hooks/useProjects'
import { useProjectStore } from '@/shared/store/projectStore'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import { debounce } from '@/shared/lib/utils'
import type { Task, TaskStatus, TaskPriority } from '@/shared/types/project'

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']

export function TaskBoardPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { taskViewMode, setTaskViewMode } = useProjectStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [createStatus, setCreateStatus] = useState<TaskStatus>('TODO')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM' as TaskPriority, dueDate: '' })

  const { data: team } = useTeam(id!)
  const { data: tasksData, isLoading, isError } = useTasks({ teamId: id, limit: 100 })
  const { mutate: createTask, isPending: creating } = useCreateTask()
  const { mutate: updateTask, isPending: updating } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()

  const myMembership = team?.members?.find((m) => m.userId === user?.id)
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'LEADER'

  const allTasks = tasksData?.data ?? []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(debounce((v: string) => setSearch(v), 300), [])

  const filteredTasks = allTasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || t.status === statusFilter
    const matchPriority = !priorityFilter || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!id) return
    updateTask(
      { id: taskId, payload: { status: newStatus }, teamId: id },
      { onError: () => toast({ title: 'Failed to update task', variant: 'destructive' }) }
    )
  }

  const openCreateTask = (status: TaskStatus = 'TODO') => {
    setCreateStatus(status)
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
    setEditingTask(null)
    setShowCreateTask(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    })
    setShowCreateTask(true)
  }

  const handleSubmitTask = () => {
    if (!taskForm.title.trim() || !id) return
    if (editingTask) {
      updateTask(
        {
          id: editingTask.id,
          payload: { title: taskForm.title, description: taskForm.description || undefined, priority: taskForm.priority, dueDate: taskForm.dueDate || null },
          teamId: id,
        },
        {
          onSuccess: () => { toast({ title: 'Task updated' }); setShowCreateTask(false) },
          onError: () => toast({ title: 'Failed to update task', variant: 'destructive' }),
        }
      )
    } else {
      createTask(
        { teamId: id, title: taskForm.title, description: taskForm.description || undefined, priority: taskForm.priority, status: createStatus, dueDate: taskForm.dueDate || undefined },
        {
          onSuccess: () => { toast({ title: 'Task created!' }); setShowCreateTask(false) },
          onError: () => toast({ title: 'Failed to create task', variant: 'destructive' }),
        }
      )
    }
  }

  const handleDeleteTask = (task: Task) => {
    if (!id) return
    deleteTask(
      { id: task.id, teamId: id },
      {
        onSuccess: () => toast({ title: 'Task deleted' }),
        onError: () => toast({ title: 'Failed to delete task', variant: 'destructive' }),
      }
    )
  }

  if (isError) return <ErrorState title="Failed to load tasks" message="Please try again." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Board"
        description={team?.name}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team?.name ?? 'Team', href: `/dashboard/projects/team/${id}` },
          { label: 'Tasks' },
        ]}
        actions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => openCreateTask()}>
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          ) : undefined
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            onChange={(e) => debouncedSetSearch(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | '')}>
          <SelectTrigger className="w-36 h-10 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | '')}>
          <SelectTrigger className="w-36 h-10 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center border border-input rounded-lg overflow-hidden">
          {([['kanban', LayoutGrid, 'Kanban'], ['table', List, 'Table']] as const).map(([mode, Icon, label]) => (
            <button
              key={mode}
              onClick={() => setTaskViewMode(mode)}
              className={`p-2 transition-colors ${taskViewMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              aria-label={`${label} view`}
              aria-pressed={taskViewMode === mode}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        taskViewMode === 'kanban' ? <KanbanSkeleton /> : <div className="space-y-2">{[1,2,3,4,5].map((i) => <TaskCardSkeleton key={i} />)}</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks"
          description={search || statusFilter || priorityFilter ? 'Try adjusting your filters.' : 'No tasks yet. Create one to get started.'}
          action={canManage ? { label: 'Create Task', onClick: () => openCreateTask() } : undefined}
        />
      ) : taskViewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          canManage={canManage}
          onStatusChange={handleStatusChange}
          onAddTask={openCreateTask}
          onEditTask={openEditTask}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border overflow-hidden"
          role="table" aria-label="Tasks table"
        >
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b" role="row">
            <span role="columnheader">Title</span>
            <span role="columnheader">Priority</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Due Date</span>
            <span role="columnheader">Assignee</span>
          </div>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/20 transition-colors items-center"
              role="row"
            >
              <span className="text-sm font-medium truncate" role="cell">{task.title}</span>
              <Badge variant="outline" className="text-xs w-fit" role="cell">{task.priority}</Badge>
              <Badge variant={task.status === 'COMPLETED' ? 'success' : 'info'} className="text-xs w-fit" role="cell">
                {task.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground" role="cell">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]" role="cell">
                {task.assignee?.fullName ?? '—'}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm((f) => ({ ...f, priority: v as TaskPriority }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button onClick={handleSubmitTask} loading={creating || updating} disabled={!taskForm.title.trim()}>
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
