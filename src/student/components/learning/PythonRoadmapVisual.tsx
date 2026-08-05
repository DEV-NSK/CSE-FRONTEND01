/**
 * PythonRoadmapVisual — roadmap.sh-style visual roadmap
 *
 * Design language:
 *  • Completed topics   → grayscale (black & white), checkmark badge
 *  • Current topic      → highlighted amber/yellow border + user avatar floating on it
 *  • Upcoming topics    → full color (amber/yellow themed, like the PDF reference)
 *  • Locked topics      → muted gray, lock icon
 *
 * Layout: vertical spine with topic nodes branching left/right like roadmap.sh
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Lock, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { RoadmapSection, Lesson } from '@/shared/types/learning'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PythonRoadmapVisualProps {
  sections: RoadmapSection[]
  currentLessonId?: string
  completedLessons: number
  totalLessons: number
  progress: number
  userAvatar?: string
  userName?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatLessons(sections: RoadmapSection[]) {
  return sections.flatMap((s) => s.lessons)
}

function isAccessible(lessonId: string, allFlat: Lesson[]): boolean {
  const idx = allFlat.findIndex((l) => l.id === lessonId)
  if (idx === 0) return true
  const prev = allFlat[idx - 1]
  return prev?.status === 'completed' || prev?.status === 'in_progress'
}

// ─── User Avatar badge ────────────────────────────────────────────────────────

function UserAvatarBadge({ avatar, name }: { avatar?: string; name?: string }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <motion.div
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      aria-label={`${name ?? 'You'} — currently here`}
    >
      {/* Bounce arrow */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="text-amber-500 mb-0.5"
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
          <path d="M5 8L0 0h10z" />
        </svg>
      </motion.div>

      {/* Avatar circle */}
      <div className="relative">
        <div className="h-8 w-8 rounded-full ring-2 ring-amber-400 ring-offset-1 ring-offset-background overflow-hidden bg-amber-100 shadow-lg">
          {avatar ? (
            <img src={avatar} alt={name ?? 'You'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[10px] font-bold">
              {initials}
            </div>
          )}
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full ring-4 ring-amber-400/30 animate-ping" />
      </div>
    </motion.div>
  )
}

// ─── Topic Node ───────────────────────────────────────────────────────────────

interface TopicNodeProps {
  lesson: Lesson
  isCurrent: boolean
  isLocked: boolean
  userAvatar?: string
  userName?: string
  side: 'left' | 'center' | 'right'
}

function TopicNode({ lesson, isCurrent, isLocked, userAvatar, userName, side }: TopicNodeProps) {
  const status = lesson.status ?? 'not_started'
  const isCompleted = status === 'completed'

  return (
    <div
      className={cn(
        'relative flex',
        side === 'left' && 'justify-end',
        side === 'center' && 'justify-center',
        side === 'right' && 'justify-start',
      )}
    >
      {/* Avatar on current node */}
      {isCurrent && (
        <div className="absolute inset-0 flex justify-center items-start pointer-events-none">
          <div className="relative w-fit" style={{ top: '-28px' }}>
            <UserAvatarBadge avatar={userAvatar} name={userName} />
          </div>
        </div>
      )}

      {isLocked ? (
        /* Locked node */
        <div
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 rounded-lg border',
            'border-border/30 bg-muted/20 opacity-50 cursor-not-allowed select-none',
            'min-w-[140px] max-w-[200px]',
          )}
          aria-disabled="true"
          title="Complete previous lessons to unlock"
        >
          <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          <span className="text-xs text-muted-foreground/60 truncate">{lesson.title}</span>
        </div>
      ) : (
        <Link
          to={`/dashboard/learning/lesson/${lesson.id}`}
          aria-current={isCurrent ? 'step' : undefined}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 group',
            'min-w-[140px] max-w-[220px] no-underline',

            // Completed → grayscale / black-white
            isCompleted && [
              'border-zinc-300 dark:border-zinc-700',
              'bg-zinc-100 dark:bg-zinc-800/60',
              'hover:border-zinc-400 dark:hover:border-zinc-600',
              'grayscale',
            ],

            // Current → amber highlight
            isCurrent && [
              'border-amber-400 dark:border-amber-500',
              'bg-amber-50 dark:bg-amber-900/30',
              'shadow-[0_0_0_3px_rgba(251,191,36,0.25)]',
              'hover:border-amber-500',
              'grayscale-0',
            ],

            // Available (not started) → amber/yellow colored
            !isCompleted && !isCurrent && !isLocked && [
              'border-amber-300/70 dark:border-amber-700/60',
              'bg-amber-50/80 dark:bg-amber-900/20',
              'hover:border-amber-400 dark:hover:border-amber-500',
              'hover:bg-amber-50 dark:hover:bg-amber-900/30',
              'hover:shadow-sm',
            ],
          )}
        >
          {/* Status indicator dot */}
          <div
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              isCompleted && 'bg-zinc-400 dark:bg-zinc-500',
              isCurrent && 'bg-amber-500 animate-pulse',
              !isCompleted && !isCurrent && 'bg-amber-300 dark:bg-amber-600',
            )}
          />

          <span
            className={cn(
              'text-xs font-medium truncate leading-snug',
              isCompleted && 'text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-400/50',
              isCurrent && 'text-amber-700 dark:text-amber-300 font-semibold',
              !isCompleted && !isCurrent && 'text-amber-800 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100',
            )}
          >
            {lesson.title}
          </span>

          {isCompleted && (
            <CheckCircle2 className="h-3 w-3 text-zinc-400 shrink-0 ml-auto" />
          )}
        </Link>
      )}
    </div>
  )
}

// ─── Section Block ────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: RoadmapSection
  sectionIndex: number
  allFlat: Lesson[]
  currentLessonId?: string
  userAvatar?: string
  userName?: string
  isLast: boolean
}

function SectionBlock({
  section,
  sectionIndex,
  allFlat,
  currentLessonId,
  userAvatar,
  userName,
  isLast,
}: SectionBlockProps) {
  const [collapsed, setCollapsed] = useState(false)

  const sectionCompleted = section.lessons.every((l) => l.status === 'completed')
  const sectionInProgress = section.lessons.some(
    (l) => l.status === 'in_progress' || l.id === currentLessonId,
  )
  const completedCount = section.lessons.filter((l) => l.status === 'completed').length
  const hasCurrentLesson = section.lessons.some((l) => l.id === currentLessonId)

  return (
    <div className="flex flex-col items-center">
      {/* Section header node */}
      <div className="flex flex-col items-center">
        {/* Section circle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            'relative z-10 flex items-center justify-center',
            'h-12 w-12 rounded-full border-2 transition-all duration-200 shadow-md',
            'font-bold text-sm select-none',

            sectionCompleted && [
              'bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-500',
              'text-zinc-500 dark:text-zinc-400',
              'grayscale',
            ],
            sectionInProgress && !sectionCompleted && [
              'bg-amber-400 border-amber-500 text-white',
              'shadow-amber-300/50 shadow-lg',
            ],
            !sectionCompleted && !sectionInProgress && [
              'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-600',
              'text-amber-700 dark:text-amber-300',
            ],
          )}
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${section.title}`}
        >
          {sectionCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : sectionInProgress ? (
            <Zap className="h-5 w-5" />
          ) : (
            <span>{sectionIndex + 1}</span>
          )}

          {/* Collapse indicator */}
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center">
            {collapsed
              ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
              : <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
            }
          </span>
        </button>

        {/* Section label pill */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            'mt-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
            'cursor-pointer select-none',
            sectionCompleted && [
              'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600',
              'text-zinc-500 dark:text-zinc-400 grayscale',
            ],
            sectionInProgress && !sectionCompleted && [
              'bg-amber-400/20 border-amber-400 text-amber-700 dark:text-amber-300',
            ],
            !sectionCompleted && !sectionInProgress && [
              'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
              'text-amber-700 dark:text-amber-300',
            ],
          )}
        >
          {section.title}
          <span className="ml-1.5 opacity-60">
            ({completedCount}/{section.lessons.length})
          </span>
        </button>
      </div>

      {/* Lesson nodes grid */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden w-full"
          >
            {/* Connector from section header to grid */}
            <div className="flex justify-center">
              <div
                className={cn(
                  'w-0.5 h-6',
                  sectionCompleted
                    ? 'bg-zinc-300 dark:bg-zinc-600'
                    : hasCurrentLesson || sectionInProgress
                      ? 'bg-amber-400'
                      : 'bg-amber-200 dark:bg-amber-800/50',
                )}
              />
            </div>

            {/* Lesson nodes — 2-column or 3-column grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 px-4 pb-4 relative">
              {/* Vertical connecting lines between rows */}
              {section.lessons.map((lesson, lIdx) => {
                const accessible = isAccessible(lesson.id, allFlat)
                const isCurrent = lesson.id === currentLessonId
                const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'
                // Alternate placement: odd → left side, even → right side (for visual zigzag)
                const col = lIdx % 2 === 0 ? 'right' : 'left'

                return (
                  <div key={lesson.id} className="relative mt-2">
                    <TopicNode
                      lesson={lesson}
                      isCurrent={isCurrent}
                      isLocked={isLocked}
                      userAvatar={userAvatar}
                      userName={userName}
                      side={col}
                    />
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connector to next section */}
      {!isLast && (
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-0.5 h-10',
              sectionCompleted
                ? 'bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-700'
                : 'bg-gradient-to-b from-amber-300 to-amber-200 dark:from-amber-600 dark:to-amber-800/50',
            )}
          />
          {/* Arrow chevron */}
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            className={cn(
              sectionCompleted ? 'text-zinc-400 dark:text-zinc-600' : 'text-amber-400',
            )}
            fill="currentColor"
          >
            <path d="M6 8L0 0h12z" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function RoadmapProgressHeader({
  progress,
  completedLessons,
  totalLessons,
  sectionsCount,
}: {
  progress: number
  completedLessons: number
  totalLessons: number
  sectionsCount: number
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 mb-8">
      <div className="flex items-center gap-3">
        <span className="text-3xl select-none" aria-hidden="true">🐍</span>
        <div>
          <h3 className="font-bold text-base text-amber-900 dark:text-amber-100">Python Mastery</h3>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
            {totalLessons} Lessons · {sectionsCount} Modules · Beginner → Advanced
          </p>
        </div>
      </div>

      <div className="text-right hidden sm:flex flex-col items-end gap-1">
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
          {progress}%
        </div>
        {/* Progress bar */}
        <div className="w-32 h-2 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden border border-amber-200/50 dark:border-amber-800/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 tabular-nums">
          {completedLessons} / {totalLessons} completed
        </p>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function RoadmapLegend() {
  return (
    <div className="flex items-center justify-center gap-5 pt-6 border-t border-border/40 flex-wrap">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="text-[11px] text-muted-foreground">In progress / Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        <span className="text-[11px] text-muted-foreground">Completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-dashed border-zinc-400" />
        <span className="text-[11px] text-muted-foreground">Locked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">👤</span>
        <span className="text-[11px] text-muted-foreground">You are here</span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PythonRoadmapVisual({
  sections,
  currentLessonId,
  completedLessons,
  totalLessons,
  progress,
  userAvatar,
  userName,
}: PythonRoadmapVisualProps) {
  const allFlat = useMemo(() => flatLessons(sections), [sections])

  return (
    <div className="w-full select-none">
      {/* Progress header */}
      <RoadmapProgressHeader
        progress={progress}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        sectionsCount={sections.length}
      />

      {/* Roadmap spine */}
      <div className="flex flex-col items-center gap-0 px-2 pb-6">
        {sections.map((section, idx) => (
          <SectionBlock
            key={section.id}
            section={section}
            sectionIndex={idx}
            allFlat={allFlat}
            currentLessonId={currentLessonId}
            userAvatar={userAvatar}
            userName={userName}
            isLast={idx === sections.length - 1}
          />
        ))}

        {/* Completion flag */}
        {progress === 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <div className="h-1 w-0.5 bg-amber-400" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400">
              <span className="text-lg">🎉</span>
              <span className="text-sm font-semibold">Python Mastery Complete!</span>
            </div>
          </motion.div>
        )}
      </div>

      <RoadmapLegend />
    </div>
  )
}
