import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Button } from '@/shared/components/ui/button'
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => {
      // Auto-expand section containing current lesson
      const initial = new Set<string>()
      sections.forEach((s) => {
        if (s.lessons.some((l) => l.id === currentLessonId)) {
          initial.add(s.id)
        }
      })
      return initial
    }
  )

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
    0
  )

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-1 h-7 text-xs gap-1 text-muted-foreground">
          <Link to={`/dashboard/learning/roadmaps/${roadmapSlug}`}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Roadmap
          </Link>
        </Button>
        <h2 className="font-semibold text-sm text-foreground line-clamp-2 mb-2">{roadmapTitle}</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {completedLessons}/{totalLessons}
          </span>
        </div>
      </div>

      {/* Sections */}
      <ScrollArea className="flex-1">
        <nav aria-label="Lesson navigation" className="p-2">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            const completedInSection = section.lessons.filter((l) => l.status === 'completed').length
            const sectionDone = completedInSection === section.lessons.length

            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggle(section.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors',
                    'hover:bg-accent/10 group'
                  )}
                  aria-expanded={isExpanded}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </motion.div>
                  <span className={cn(
                    'flex-1 text-xs font-semibold uppercase tracking-wide truncate',
                    sectionDone ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                  )}>
                    {section.title}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0 h-4 px-1">
                    {completedInSection}/{section.lessons.length}
                  </Badge>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-2">
                        {section.lessons.map((lesson) => {
                          const isCurrent = lesson.id === currentLessonId
                          const status = lesson.status ?? 'not_started'

                          return (
                            <li key={lesson.id}>
                              <Link
                                to={`/dashboard/learning/lesson/${lesson.id}`}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all group',
                                  isCurrent
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10',
                                  status === 'completed' && !isCurrent && 'opacity-60'
                                )}
                                aria-current={isCurrent ? 'page' : undefined}
                              >
                                {status === 'completed' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                ) : isCurrent ? (
                                  <PlayCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 shrink-0" />
                                )}
                                <span className={cn(
                                  'flex-1 truncate',
                                  status === 'completed' && 'line-through decoration-muted-foreground/40'
                                )}>
                                  {lesson.title}
                                </span>
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
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
