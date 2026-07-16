import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { Lesson } from '@/shared/types/learning'

interface LessonCardProps {
  lesson: Lesson
  className?: string
  compact?: boolean
}

const statusIcon = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Completed" />,
  in_progress: <PlayCircle className="h-4 w-4 text-primary" aria-label="In progress" />,
  not_started: <Circle className="h-4 w-4 text-muted-foreground" aria-label="Not started" />,
}

export function LessonCard({ lesson, className, compact = false }: LessonCardProps) {
  const status = lesson.status ?? 'not_started'
  const icon = statusIcon[status]

  if (compact) {
    return (
      <Link
        to={`/dashboard/learning/lesson/${lesson.id}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors group',
          status === 'completed' && 'opacity-75',
          className
        )}
      >
        <span className="shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate group-hover:text-primary transition-colors',
            status === 'completed' && 'line-through decoration-muted-foreground/50'
          )}>
            {lesson.title}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lesson.estimatedMinutes}m
        </span>
      </Link>
    )
  }

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link to={`/dashboard/learning/lesson/${lesson.id}`} tabIndex={-1}>
        <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer group', className)}>
          <CardContent className="p-4 flex items-center gap-4">
            <span className="shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                'text-sm font-medium group-hover:text-primary transition-colors truncate',
                status === 'completed' && 'line-through decoration-muted-foreground/50'
              )}>
                {lesson.title}
              </h4>
              {lesson.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{lesson.description}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.estimatedMinutes}m
            </span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
