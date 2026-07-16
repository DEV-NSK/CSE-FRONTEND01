import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, Circle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { Milestone, MilestoneStatus } from '@/shared/types/project'

interface MilestoneCardProps {
  milestone: Milestone
  canManage?: boolean
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestone: Milestone) => void
}

const statusConfig: Record<MilestoneStatus, { label: string; icon: typeof CheckCircle2; color: string; variant: 'success' | 'info' | 'outline' }> = {
  PENDING: { label: 'Pending', icon: Circle, color: 'text-muted-foreground', variant: 'outline' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-500', variant: 'info' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500', variant: 'success' },
}

export function MilestoneCard({ milestone, canManage, onEdit, onDelete }: MilestoneCardProps) {
  const config = statusConfig[milestone.status]
  const Icon = config.icon
  const isOverdue =
    milestone.dueDate &&
    new Date(milestone.dueDate) < new Date() &&
    milestone.status !== 'COMPLETED'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className={cn('hover:shadow-sm transition-shadow', milestone.status === 'COMPLETED' && 'opacity-80')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon
              className={cn('h-5 w-5 shrink-0 mt-0.5', config.color)}
              aria-hidden="true"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={cn(
                  'font-medium text-sm',
                  milestone.status === 'COMPLETED' && 'line-through text-muted-foreground'
                )}>
                  {milestone.title}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={config.variant} className="text-xs">
                    {config.label}
                  </Badge>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="h-6 w-6" aria-label="Milestone options">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(milestone)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete?.(milestone)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {milestone.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {milestone.description}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium">{Math.round(milestone.completionPercentage)}%</span>
                </div>
                <div
                  className="h-1.5 w-full bg-muted rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={milestone.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${milestone.title} progress`}
                >
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      milestone.status === 'COMPLETED'
                        ? 'bg-green-500'
                        : milestone.completionPercentage >= 70
                        ? 'bg-blue-500'
                        : 'bg-primary'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.completionPercentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {milestone.dueDate && (
                <p
                  className={cn(
                    'flex items-center gap-1 text-xs mt-2',
                    isOverdue ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  Due {new Date(milestone.dueDate).toLocaleDateString()}
                  {isOverdue && ' · Overdue'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
