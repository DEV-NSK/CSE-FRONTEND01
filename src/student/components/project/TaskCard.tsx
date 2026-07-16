import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MessageSquare, Flag, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { getInitials, cn } from '@/shared/lib/utils'
import type { Task, TaskPriority } from '@/shared/types/project'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  canManage?: boolean
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  compact?: boolean
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; dotColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-500', dotColor: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', color: 'text-blue-600', dotColor: 'bg-blue-500' },
  HIGH: { label: 'High', color: 'text-amber-600', dotColor: 'bg-amber-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-600', dotColor: 'bg-red-500' },
}

export function TaskCard({ task, isDragging, canManage, onEdit, onDelete, compact }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <Card
        className={cn(
          'hover:shadow-sm transition-all cursor-grab active:cursor-grabbing',
          isDragging && 'shadow-lg ring-2 ring-primary/50 opacity-80',
          task.status === 'COMPLETED' && 'opacity-70'
        )}
        role="article"
        aria-label={`Task: ${task.title}`}
      >
        <CardContent className={cn('p-3', compact && 'p-2')}>
          {/* Header */}
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                className={cn('h-1.5 w-1.5 rounded-full shrink-0 mt-0.5', priorityInfo.dotColor)}
                aria-label={`Priority: ${priorityInfo.label}`}
              />
              <p className={cn(
                'text-sm font-medium leading-snug',
                task.status === 'COMPLETED' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </p>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                    aria-label="Task options"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(task)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(task)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Footer */}
          {!compact && (
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}

                {task._count?.comments !== undefined && task._count.comments > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" aria-hidden="true" />
                    {task._count.comments}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-1.5 py-0 h-4', priorityInfo.color)}
                >
                  <Flag className="h-2.5 w-2.5 mr-0.5" />
                  {priorityInfo.label}
                </Badge>

                {task.assignee && (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.profileImage} alt={task.assignee.fullName} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(task.assignee.fullName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
