/**
 * FPRD-20: Python Roadmap Visual
 * roadmap.sh style — vertical node graph with animated connections,
 * completed/current/locked states per lesson.
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, Clock, Lock, PlayCircle, Zap } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { RoadmapSection } from '@/shared/types/learning'

interface PythonRoadmapVisualProps {
  sections: RoadmapSection[]
  currentLessonId?: string
  completedLessons: number
  totalLessons: number
  progress: number
}

// Build a flat ordered list of all lessons across all sections
function flatLessons(sections: RoadmapSection[]) {
  return sections.flatMap((s) => s.lessons)
}

// A lesson is "accessible" if a prior lesson is completed or it's the very first
function isAccessible(
  lessonId: string,
  sections: RoadmapSection[],
  allFlat: ReturnType<typeof flatLessons>,
): boolean {
  const idx = allFlat.findIndex((l) => l.id === lessonId)
  if (idx === 0) return true
  const prev = allFlat[idx - 1]
  return prev?.status === 'completed' || prev?.status === 'in_progress'
}

export function PythonRoadmapVisual({
  sections,
  currentLessonId,
  completedLessons,
  totalLessons,
  progress,
}: PythonRoadmapVisualProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  )

  const allFlat = useMemo(() => flatLessons(sections), [sections])

  const toggle = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 via-blue-500/10 to-indigo-500/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <div>
            <h3 className="font-bold text-lg">Python Mastery</h3>
            <p className="text-xs text-muted-foreground">
              {totalLessons} Lessons · {sections.length} Modules · Beginner → Advanced
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-2xl font-black text-primary">{progress}%</div>
          <div className="w-28 h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {completedLessons} / {totalLessons} done
          </p>
        </div>
      </div>

      {/* Roadmap nodes */}
      <div className="relative">
        {sections.map((section, sIdx) => {
          const isOpen = expandedSections.has(section.id)
          const sectionCompleted = section.lessons.every((l) => l.status === 'completed')
          const sectionInProgress = section.lessons.some((l) => l.status === 'in_progress')
          const completedCount = section.lessons.filter((l) => l.status === 'completed').length
          const isLast = sIdx === sections.length - 1

          return (
            <div key={section.id} className="relative">
              {/* Animated vertical connector between sections */}
              {!isLast && (
                <div className="absolute left-[22px] top-[44px] w-0.5 z-0" style={{ height: 'calc(100% - 44px)' }}>
                  <motion.div
                    className={cn(
                      'w-full h-full rounded-full',
                      sectionCompleted
                        ? 'bg-gradient-to-b from-green-400 to-green-300'
                        : sectionInProgress
                          ? 'bg-gradient-to-b from-primary to-primary/20'
                          : 'bg-border',
                    )}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: sIdx * 0.05 }}
                    style={{ transformOrigin: 'top' }}
                  />
                </div>
              )}

              <div className="relative z-10 flex gap-4 mb-2">
                {/* Section node circle */}
                <button
                  onClick={() => toggle(section.id)}
                  className={cn(
                    'h-11 w-11 rounded-full flex items-center justify-center shrink-0',
                    'border-2 transition-all shadow-sm font-bold text-sm',
                    sectionCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : sectionInProgress
                        ? 'bg-primary border-primary text-white'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground',
                  )}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${section.title}`}
                >
                  {sectionCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : sectionInProgress ? (
                    <Zap className="h-5 w-5" />
                  ) : (
                    <span>{sIdx + 1}</span>
                  )}
                </button>

                {/* Section header */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => toggle(section.id)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <h4
                          className={cn(
                            'font-semibold text-sm group-hover:text-primary transition-colors',
                            sectionCompleted && 'text-green-600 dark:text-green-400',
                          )}
                        >
                          {section.title}
                        </h4>
                        {section.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {section.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={sectionCompleted ? 'success' : sectionInProgress ? 'info' : 'secondary'}
                          className="text-xs"
                        >
                          {completedCount}/{section.lessons.length}
                        </Badge>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  {/* Lesson nodes */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 pb-4 pt-1 pl-0">
                          {section.lessons.map((lesson, lIdx) => {
                            const accessible = isAccessible(lesson.id, sections, allFlat)
                            const isCurrent = lesson.id === currentLessonId
                            const status = lesson.status ?? 'not_started'
                            const isLocked = !accessible && status === 'not_started'
                            const isLastLesson = lIdx === section.lessons.length - 1

                            return (
                              <div key={lesson.id} className="relative flex gap-3">
                                {/* Lesson connector line */}
                                {!isLastLesson && (
                                  <div className="absolute left-[14px] top-7 bottom-0 w-0.5 z-0">
                                    <div
                                      className={cn(
                                        'w-full h-full',
                                        status === 'completed'
                                          ? 'bg-green-300 dark:bg-green-700'
                                          : 'bg-border',
                                      )}
                                    />
                                  </div>
                                )}

                                {/* Lesson dot */}
                                <div
                                  className={cn(
                                    'relative z-10 h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1.5 border transition-all',
                                    status === 'completed'
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : isCurrent
                                        ? 'bg-primary border-primary text-white animate-pulse'
                                        : isLocked
                                          ? 'bg-muted border-muted-foreground/20 text-muted-foreground/40'
                                          : 'bg-background border-muted-foreground/40 text-muted-foreground',
                                  )}
                                >
                                  {status === 'completed' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : isCurrent ? (
                                    <PlayCircle className="h-3.5 w-3.5" />
                                  ) : isLocked ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5" />
                                  )}
                                </div>

                                {/* Lesson card */}
                                <motion.div
                                  className="flex-1 min-w-0"
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: lIdx * 0.04 }}
                                >
                                  {isLocked ? (
                                    <div
                                      className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-lg border',
                                        'border-border/40 bg-muted/30 opacity-60',
                                      )}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">
                                          {lesson.title}
                                        </p>
                                      </div>
                                      <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    </div>
                                  ) : (
                                    <Link
                                      to={`/dashboard/learning/lesson/${lesson.id}`}
                                      className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all group',
                                        isCurrent
                                          ? 'border-primary/50 bg-primary/5 shadow-sm'
                                          : status === 'completed'
                                            ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'
                                            : 'border-border/60 bg-card hover:bg-accent/10',
                                      )}
                                      aria-current={isCurrent ? 'step' : undefined}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={cn(
                                            'text-xs font-medium truncate transition-colors',
                                            isCurrent
                                              ? 'text-primary'
                                              : status === 'completed'
                                                ? 'text-green-700 dark:text-green-400'
                                                : 'group-hover:text-primary',
                                          )}
                                        >
                                          {status === 'completed' && '✓ '}
                                          {lesson.title}
                                        </p>
                                        {isCurrent && (
                                          <p className="text-[10px] text-primary/70 mt-0.5">
                                            🟢 Current
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                                        <Clock className="h-2.5 w-2.5" />
                                        {lesson.estimatedMinutes}m
                                      </span>
                                    </Link>
                                  )}
                                </motion.div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/40 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <PlayCircle className="h-3.5 w-3.5" /> 🟢 Current
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className="h-3.5 w-3.5" /> ⚪ Available
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
          <Lock className="h-3.5 w-3.5" /> Locked
        </span>
      </div>
    </div>
  )
}
