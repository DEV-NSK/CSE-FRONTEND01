/**
 * LessonSidebar — W3Schools-inspired clean navigation
 * Left panel: course title, overall progress, chapter list with lesson items
 */
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import type { RoadmapSection } from '@/shared/types/learning'

interface LessonSidebarProps {
  sections: RoadmapSection[]
  currentLessonId: string
  roadmapTitle: string
  roadmapSlug: string
  className?: string
}

export function LessonSidebar({
  sections,
  currentLessonId,
  roadmapTitle,
  roadmapSlug,
  className,
}: LessonSidebarProps) {
  // Auto-expand the section containing the current lesson
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    sections.forEach((s) => {
      if (s.lessons.some((l) => l.id === currentLessonId)) initial.add(s.id)
    })
    // Also expand first section by default if nothing is active
    if (initial.size === 0 && sections[0]) initial.add(sections[0].id)
    return initial
  })

  const toggle = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const completedLessons = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.status === 'completed').length,
    0,
  )
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className={cn('flex flex-col h-full bg-background border-r border-border', className)}>

      {/* ── Course header ── */}
      <div className="px-4 py-4 border-b border-border bg-muted/30 shrink-0">
        <Link
          to={`/dashboard/learning/roadmaps/${roadmapSlug}`}
          className="block text-xs font-bold uppercase tracking-widest text-primary mb-1 hover:underline"
        >
          🐍 Python Course
        </Link>
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {roadmapTitle}
        </p>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{completedLessons}/{totalLessons} Lessons</span>
            <span className="font-semibold text-foreground">{progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ── Chapter / lesson list ── */}
      <ScrollArea className="flex-1">
        <nav aria-label="Course navigation" className="py-2">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            const completedInSection = section.lessons.filter(
              (l) => l.status === 'completed',
            ).length
            const hasCurrentLesson = section.lessons.some((l) => l.id === currentLessonId)

            return (
              <div key={section.id}>
                {/* ── Chapter heading ── */}
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-left',
                    'text-xs font-bold uppercase tracking-wider',
                    'transition-colors hover:bg-muted/60',
                    hasCurrentLesson
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground',
                  )}
                  aria-expanded={isExpanded}
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <motion.span
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.18 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </motion.span>
                    <span className="truncate">{section.title}</span>
                  </span>
                  <span className="shrink-0 ml-2 text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {completedInSection}/{section.lessons.length}
                  </span>
                </button>

                {/* ── Lessons inside chapter ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {section.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId
                        const isCompleted = lesson.status === 'completed'
                        const isInProgress = lesson.status === 'in_progress'
                        const isLocked = false

                        return (
                          <li key={lesson.id}>
                            <Link
                              to={`/dashboard/learning/lesson/${lesson.id}`}
                              className={cn(
                                'flex items-center gap-3 pl-8 pr-4 py-2 text-sm',
                                'border-l-2 transition-all duration-150',
                                isCurrent
                                  ? 'border-l-primary bg-primary/8 text-primary font-semibold'
                                  : isCompleted
                                  ? 'border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                  : isLocked
                                  ? 'border-l-transparent text-muted-foreground/40 pointer-events-none'
                                  : 'border-l-transparent text-foreground/80 hover:bg-muted/50 hover:text-foreground',
                              )}
                              aria-current={isCurrent ? 'page' : undefined}
                            >
                              {/* Status icon */}
                              <span className="shrink-0 w-4 flex justify-center">
                                {isLocked ? (
                                  <Lock className="h-3 w-3 text-muted-foreground/30" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                ) : isCurrent ? (
                                  <PlayCircle className="h-3.5 w-3.5 text-primary" />
                                ) : isInProgress ? (
                                  <span className="h-2 w-2 rounded-full bg-amber-400 mt-0.5" />
                                ) : (
                                  <Circle className="h-3 w-3 text-muted-foreground/40" />
                                )}
                              </span>

                              {/* Lesson title */}
                              <span className={cn(
                                'flex-1 truncate leading-snug',
                                isCompleted && !isCurrent && 'line-through opacity-60',
                              )}>
                                {lesson.title}
                              </span>

                              {/* Duration */}
                              {lesson.estimatedMinutes > 0 && (
                                <span className="shrink-0 text-[10px] text-muted-foreground/50 tabular-nums">
                                  {lesson.estimatedMinutes}m
                                </span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
