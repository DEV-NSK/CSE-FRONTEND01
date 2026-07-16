import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { ProgressRing } from './ProgressRing'
import { cn } from '@/shared/lib/utils'
import type { ContinueLearning } from '@/shared/types/learning'

interface ContinueLearningCardProps {
  data: ContinueLearning
  className?: string
  compact?: boolean
}

export function ContinueLearningCard({ data, className, compact = false }: ContinueLearningCardProps) {
  const { roadmap, lesson, progress } = data

  if (compact) {
    return (
      <Card className={cn('hover:shadow-sm transition-shadow', className)}>
        <CardContent className="p-4 flex items-center gap-4">
          <ProgressRing progress={progress} size={48} strokeWidth={4} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{roadmap.title}</p>
            <p className="text-sm font-medium truncate">{lesson.title}</p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1">
            <Link to={`/dashboard/learning/lesson/${lesson.id}`}>
              <PlayCircle className="h-3.5 w-3.5" />
              Resume
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={cn(
        'hover:shadow-md transition-shadow overflow-hidden',
        'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20',
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ProgressRing progress={progress} size={64} strokeWidth={6} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary/80 uppercase tracking-wide mb-1">
                Continue Learning
              </p>
              <h3 className="font-semibold text-foreground mb-0.5 truncate">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 truncate">{roadmap.title}</p>
              <div className="flex items-center gap-3">
                <Button asChild size="sm" className="gap-1.5">
                  <Link to={`/dashboard/learning/lesson/${lesson.id}`}>
                    <PlayCircle className="h-4 w-4" />
                    Resume Lesson
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedMinutes}m left
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
