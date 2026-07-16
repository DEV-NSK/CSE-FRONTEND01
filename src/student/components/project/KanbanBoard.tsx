import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { TaskCard } from './TaskCard'
import { cn } from '@/shared/lib/utils'
import type { Task, TaskStatus } from '@/shared/types/project'

interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
  headerColor: string
}

const COLUMNS: KanbanColumn[] = [
  { id: 'TODO', title: 'Todo', color: 'bg-slate-50 dark:bg-slate-900/30', headerColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20', headerColor: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' },
  { id: 'REVIEW', title: 'Review', color: 'bg-amber-50 dark:bg-amber-900/20', headerColor: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-green-50 dark:bg-green-900/20', headerColor: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' },
]

interface SortableTaskCardProps {
  task: Task
  canManage: boolean
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

function SortableTaskCard({ task, canManage, onEdit, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task, status: task.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group"
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        canManage={canManage}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  tasks: Task[]
  canManage: boolean
  onAddTask?: (status: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
}

function KanbanColumnComponent({ column, tasks, canManage, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl min-w-[260px] flex-1 max-w-sm',
        column.color
      )}
      role="region"
      aria-label={`${column.title} column`}
    >
      {/* Column header */}
      <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-xl', column.headerColor)}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{column.title}</span>
          <span className="text-xs font-medium rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        {canManage && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10"
            onClick={() => onAddTask?.(column.id)}
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 px-2 py-2 space-y-2 min-h-[120px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                canManage={canManage}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <p className="text-xs text-muted-foreground">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  tasks: Task[]
  canManage: boolean
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onAddTask?: (status: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
}

export function KanbanBoard({
  tasks,
  canManage,
  onStatusChange,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks)

  // Sync with prop changes
  if (tasks !== optimisticTasks && !activeTask) {
    setOptimisticTasks(tasks)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const task = optimisticTasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }, [optimisticTasks])

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const overStatus = COLUMNS.find((c) => c.id === overId)?.id
    if (overStatus) {
      setOptimisticTasks((prev) =>
        prev.map((t) => t.id === activeId ? { ...t, status: overStatus } : t)
      )
    } else {
      const overTask = optimisticTasks.find((t) => t.id === overId)
      if (overTask) {
        setOptimisticTasks((prev) =>
          prev.map((t) => t.id === activeId ? { ...t, status: overTask.status } : t)
        )
      }
    }
  }, [optimisticTasks])

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const activeTask = optimisticTasks.find((t) => t.id === activeId)
    if (!activeTask) return

    const originalTask = tasks.find((t) => t.id === activeId)
    if (!originalTask) return

    if (activeTask.status !== originalTask.status) {
      onStatusChange(activeId, activeTask.status)
    }
  }, [optimisticTasks, tasks, onStatusChange])

  const getColumnTasks = useCallback(
    (status: TaskStatus) => optimisticTasks.filter((t) => t.status === status),
    [optimisticTasks]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-3 overflow-x-auto pb-4"
        role="group"
        aria-label="Kanban board"
      >
        {COLUMNS.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            tasks={getColumnTasks(column.id)}
            canManage={canManage}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-1">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
