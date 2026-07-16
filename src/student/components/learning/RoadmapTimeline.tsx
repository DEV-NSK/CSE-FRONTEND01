import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, PlayCircle, ChevronDown, Clock, Lock,
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { RoadmapSection, Lesson } from '@/shared/types/learning'

interface RoadmapTimelineProps {
  sections: RoadmapSection[]
  currentLessonId?: string
  className?: string
}

export function RoadmapTimeline({ sections, currentLessonId, className }: RoadmapTimelineProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)) // all expanded by default
  )

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div
        className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/40 via-border to-transparent"
        aria-hidden="true"
      />

      <div className="space-y-6">
        {sections.map((section, sectionIdx) => {
          const isExpanded = expandedSections.has(section.id)
          const sectionCompleted = section.lessons.every((l) => l.status === 'completed')
          const completedCount = section.lessons.filter((l) => l.status === 'completed').length

          return (
            <div key={section.id} className="relative pl-12">
              {/* Section dot */}
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'absolute left-0 top-1 h-10 w-10 rounded-full flex items-center justify-center transition-all',
                  'border-2 z-10',
                  sectionCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-background border-primary/50 text-primary'
                )}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} section: ${section.title}`}
              >
                <span className="text-sm font-bold">{sectionIdx + 1}</span>
              </button>

              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full text-left group mb-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className={cn(
                      'font-semibold text-foreground group-hover:text-primary transition-colors',
                      sectionCompleted && 'text-green-600 dark:text-green-400'
                    )}>
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={sectionCompleted ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {completedCount}/{section.lessons.length}
                    </Badge>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>
              </button>

              {/* Lesson list */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pb-2">
                      {section.lessons.map((lesson, lessonIdx) => (
                        <LessonTimelineItem
                          key={lesson.id}
                          lesson={lesson}
                          index={lessonIdx + 1}
                          isCurrent={lesson.id === currentLessonId}
                          isLast={lessonIdx === section.lessons.length - 1}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Individual lesson item in timeline ──────────────────────────────────────

interface LessonTimelineItemProps {
  lesson: Lesson
  index: number
  isCurrent: boolean
  isLast: boolean
}

function LessonTimelineItem({ lesson, index, isCurrent, isLast }: LessonTimelineItemProps) {
  const status = lesson.status ?? 'not_started'

  const statusDot = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
    in_progress: <PlayCircle className="h-4 w-4 text-primary shrink-0" />,
    not_started: <Circle className="h-4 w-4 text-muted-foreground shrink-0" />,
  }[status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        to={`/dashboard/learning/lesson/${lesson.id}`}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
          isCurrent
            ? 'bg-primary/10 border border-primary/30 shadow-sm'
            : 'hover:bg-accent/10',
          status === 'completed' && !isCurrent && 'opacity-75'
        )}
        aria-current={isCurrent ? 'step' : undefined}
      >
        {statusDot}

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium transition-colors truncate',
            isCurrent ? 'text-primary' : 'text-foreground group-hover:text-primary',
            status === 'completed' && 'line-through decoration-muted-foreground/40'
          )}>
            {lesson.title}
          </p>
          {isCurrent && (
            <p className="text-xs text-primary/70 mt-0.5">Current lesson</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCurrent && (
            <Badge variant="default" className="text-xs">
              Current
            </Badge>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.estimatedMinutes}m
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
