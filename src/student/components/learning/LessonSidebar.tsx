import { Link } from 'react-router-dom'
import {
  CheckCircle2, Circle, PlayCircle, ChevronDown,
  ChevronLeft, Lock, Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Badge } from '@/shared/components/ui/badge'
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
  // Default: expand the section containing the current lesson
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    sections.forEach((s) => {
      if (s.lessons.some((l) => l.id === currentLessonId)) initial.add(s.id)
    })
    return initial
  })

  const [search, setSearch] = useState('')

  const toggle = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Overall progress
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const completedLessons = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.status === 'completed').length,
    0,
  )
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Filter sections/lessons by search query
  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sections
    return sections
      .map((s) => ({
        ...s,
        lessons: s.lessons.filter((l) => l.title.toLowerCase().includes(q)),
      }))
      .filter((s) => s.lessons.length > 0 || s.title.toLowerCase().includes(q))
  }, [sections, search])

  // Auto-expand matched sections when searching
  const sectionsToExpand = useMemo(() => {
    if (!search.trim()) return expandedSections
    const s = new Set(expandedSections)
    filteredSections.forEach((sec) => s.add(sec.id))
    return s
  }, [search, filteredSections, expandedSections])

  return (
    <div className={cn('flex flex-col h-full bg-card border-r border-border', className)}>
      {/* ── Header ── */}
      <div className="px-3 py-3 border-b border-border shrink-0 space-y-2.5">
        {/* Back to roadmap */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors -ml-0.5 font-medium"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          Back to Roadmap
        </button>

        {/* Roadmap title */}
        <h2 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
          {roadmapTitle}
        </h2>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground tabular-nums text-[11px]">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">{progressPct}% complete</p>
        </div>

        {/* Search box */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons..."
            aria-label="Search lessons"
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-[11px] rounded-md',
              'bg-muted/60 border border-border',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'transition-colors duration-150',
            )}
          />
        </div>
      </div>

      {/* ── Lesson list ── */}
      <ScrollArea className="flex-1">
        <nav aria-label="Lesson navigation" className="py-1.5 px-1.5">
          {filteredSections.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 px-4">
              No lessons match &ldquo;{search}&rdquo;
            </p>
          ) : (
            filteredSections.map((section) => {
              const isExpanded = sectionsToExpand.has(section.id)
              const completedInSection = section.lessons.filter(
                (l) => l.status === 'completed',
              ).length
              const sectionDone = completedInSection === section.lessons.length && section.lessons.length > 0

              return (
                <div key={section.id} className="mb-0.5">
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => toggle(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left',
                      'transition-colors duration-150 hover:bg-accent/60 group',
                    )}
                    aria-expanded={isExpanded}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.18 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </motion.div>
                    <span
                      className={cn(
                        'flex-1 text-[10px] font-bold uppercase tracking-[0.1em] truncate',
                        sectionDone
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground',
                      )}
                    >
                      {section.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] shrink-0 h-3.5 px-1 font-semibold"
                    >
                      {completedInSection}/{section.lessons.length}
                    </Badge>
                  </button>

                  {/* Lesson items */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <ul className="pl-1 pb-0.5">
                          {section.lessons.map((lesson) => {
                            const isCurrent = lesson.id === currentLessonId
                            const status = lesson.status ?? 'not_started'
                            const isCompleted = status === 'completed'
                            const isInProgress = status === 'in_progress'
                            const isLocked = false

                            return (
                              <li key={lesson.id}>
                                <Link
                                  to={`/dashboard/learning/lesson/${lesson.id}`}
                                  className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px]',
                                    'transition-all duration-150 group',
                                    isCurrent
                                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary sidebar-active-glow'
                                      : isCompleted
                                      ? 'text-muted-foreground hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-foreground border-l-2 border-transparent'
                                      : isLocked
                                      ? 'text-muted-foreground/40 cursor-not-allowed pointer-events-none border-l-2 border-transparent'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 border-l-2 border-transparent',
                                  )}
                                  aria-current={isCurrent ? 'page' : undefined}
                                  aria-disabled={isLocked}
                                  tabIndex={isLocked ? -1 : undefined}
                                >
                                  {/* Status icon */}
                                  <span className="shrink-0">
                                    {isLocked ? (
                                      <Lock className="h-3 w-3 text-muted-foreground/30" />
                                    ) : isCompleted ? (
                                      <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400" />
                                    ) : isCurrent ? (
                                      <PlayCircle className="h-3 w-3 text-primary" />
                                    ) : isInProgress ? (
                                      <span className="flex h-3 w-3 items-center justify-center">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                      </span>
                                    ) : (
                                      <Circle className="h-3 w-3 text-muted-foreground/40" />
                                    )}
                                  </span>

                                  {/* Title */}
                                  <span
                                    className={cn(
                                      'flex-1 truncate leading-snug',
                                      isCompleted && !isCurrent && 'opacity-60',
                                    )}
                                  >
                                    {lesson.title}
                                  </span>

                                  {/* Duration */}
                                  {lesson.estimatedMinutes > 0 && (
                                    <span className="shrink-0 text-[10px] text-muted-foreground/60 tabular-nums">
                                      {lesson.estimatedMinutes}m
                                    </span>
                                  )}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </nav>
      </ScrollArea>
    </div>
  )
}
