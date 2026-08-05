/**
 * PythonRoadmapVisual — roadmap.sh-style vertical interactive roadmap
 *
 * States:
 *  • Completed  → grayscale (b&w), ✓ check, line-through title
 *  • Current    → amber glow border, user avatar floats above
 *  • Available  → full amber/yellow color, clickable
 *  • Locked     → muted gray, 🔒 icon, not clickable
 *
 * Layout: vertical spine, lessons fan out left/right like a true skill tree
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

// ─── User Avatar Marker ───────────────────────────────────────────────────────

function AvatarMarker({ avatar, name }: { avatar?: string; name?: string }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'ME'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.2 }}
      className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-30 pointer-events-none"
    >
      {/* Avatar circle */}
      <div className="relative">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="h-7 w-7 rounded-full ring-2 ring-amber-400 ring-offset-1 ring-offset-background overflow-hidden shadow-lg shadow-amber-400/40"
        >
          {avatar ? (
            <img src={avatar} alt={name ?? 'You'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[9px] font-bold">
              {initials}
            </div>
          )}
        </motion.div>
        {/* Ping ring */}
        <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" />
      </div>
      {/* Triangle pointer */}
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400" />
    </motion.div>
  )
}

// ─── Lesson Node ──────────────────────────────────────────────────────────────

interface LessonNodeProps {
  lesson: Lesson
  isCurrent: boolean
  isLocked: boolean
  userAvatar?: string
  userName?: string
}

function LessonNode({ lesson, isCurrent, isLocked, userAvatar, userName }: LessonNodeProps) {
  const status = lesson.status ?? 'not_started'
  const isCompleted = status === 'completed'

  const baseClasses = 'relative flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-200 w-full'

  const content = (
    <>
      {/* Avatar marker on current lesson */}
      {isCurrent && <AvatarMarker avatar={userAvatar} name={userName} />}

      {/* Status dot */}
      <div className={cn(
        'h-2 w-2 rounded-full shrink-0 mt-0.5',
        isCompleted && 'bg-zinc-400',
        isCurrent && 'bg-amber-500 animate-pulse',
        !isCompleted && !isCurrent && !isLocked && 'bg-amber-400',
        isLocked && 'bg-zinc-300 dark:bg-zinc-600',
      )} />

      {/* Title */}
      <span className={cn(
        'text-xs font-medium leading-snug truncate',
        isCompleted && 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-400/50',
        isCurrent && 'text-amber-700 dark:text-amber-300 font-semibold',
        !isCompleted && !isCurrent && !isLocked && 'text-amber-800 dark:text-amber-200',
        isLocked && 'text-zinc-400 dark:text-zinc-500',
      )}>
        {lesson.title}
      </span>

      {/* Completed check */}
      {isCompleted && (
        <CheckCircle2 className="h-3 w-3 text-zinc-400 shrink-0 ml-auto" />
      )}
      {/* Lock icon */}
      {isLocked && (
        <Lock className="h-3 w-3 text-zinc-300 dark:text-zinc-600 shrink-0 ml-auto" />
      )}
    </>
  )

  if (isLocked) {
    return (
      <div
        className={cn(
          baseClasses,
          'border-zinc-200/40 dark:border-zinc-700/30 bg-zinc-50/50 dark:bg-zinc-800/20',
          'opacity-50 cursor-not-allowed select-none',
        )}
        title="Complete previous lessons to unlock"
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      to={`/dashboard/learning/lesson/${lesson.id}`}
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        baseClasses,
        'group no-underline',

        // Completed — grayscale B&W
        isCompleted && [
          'border-zinc-200 dark:border-zinc-700',
          'bg-zinc-100/80 dark:bg-zinc-800/50',
          'hover:border-zinc-300 dark:hover:border-zinc-600',
        ],

        // Current — amber glow
        isCurrent && [
          'border-amber-400 dark:border-amber-500',
          'bg-amber-50 dark:bg-amber-900/25',
          'shadow-[0_0_0_3px_rgba(251,191,36,0.2)]',
        ],

        // Available — amber themed
        !isCompleted && !isCurrent && [
          'border-amber-200/70 dark:border-amber-700/50',
          'bg-amber-50/60 dark:bg-amber-900/15',
          'hover:border-amber-400 dark:hover:border-amber-500',
          'hover:bg-amber-50 dark:hover:bg-amber-900/25',
          'hover:shadow-sm',
        ],
      )}
    >
      {content}
    </Link>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  section: RoadmapSection
  sectionIndex: number
  allFlat: Lesson[]
  currentLessonId?: string
  userAvatar?: string
  userName?: string
  isLast: boolean
}

function Section({ section, sectionIndex, allFlat, currentLessonId, userAvatar, userName, isLast }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  const sectionCompleted = section.lessons.every((l) => l.status === 'completed')
  const sectionInProgress = !sectionCompleted && section.lessons.some(
    (l) => l.status === 'in_progress' || l.id === currentLessonId,
  )
  const completedCount = section.lessons.filter((l) => l.status === 'completed').length

  return (
    <div className="flex flex-col items-center w-full">

      {/* Section circle + label */}
      <div className="flex flex-col items-center">
        {/* Circle node */}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className={cn(
            'relative h-12 w-12 rounded-full border-2 flex items-center justify-center',
            'font-bold text-sm transition-all duration-200 shadow-md z-10',
            sectionCompleted
              ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-500 text-zinc-500 dark:text-zinc-400'
              : sectionInProgress
                ? 'bg-amber-400 border-amber-500 text-white shadow-amber-300/40 shadow-lg'
                : 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
          )}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${section.title}`}
        >
          {sectionCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : sectionInProgress ? (
            <Zap className="h-5 w-5" />
          ) : (
            sectionIndex + 1
          )}

          {/* Collapse chevron badge */}
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
            {collapsed
              ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
              : <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />}
          </span>
        </button>

        {/* Section label pill */}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className={cn(
            'mt-2 px-3 py-1 rounded-full border text-xs font-semibold transition-all',
            sectionCompleted
              ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400'
              : sectionInProgress
                ? 'bg-amber-400/15 border-amber-400 text-amber-700 dark:text-amber-300'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300',
          )}
        >
          {section.title}
          <span className="ml-1.5 opacity-50 text-[10px]">
            {completedCount}/{section.lessons.length}
          </span>
        </button>
      </div>

      {/* Lessons grid — zigzag layout */}
      <AnimatePresence initial={false}>
        {!collapsed && section.lessons.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden w-full"
          >
            {/* Spine connector down into lessons */}
            <div className="flex justify-center">
              <div className={cn(
                'w-0.5 h-5',
                sectionCompleted ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-amber-300 dark:bg-amber-700/60',
              )} />
            </div>

            {/* Lesson grid: up to 3 per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-2 pb-2 pt-1">
              {section.lessons.map((lesson) => {
                const accessible = isAccessible(lesson.id, allFlat)
                const isCurrent = lesson.id === currentLessonId
                const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'

                return (
                  <motion.div
                    key={lesson.id}
                    className="relative"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <LessonNode
                      lesson={lesson}
                      isCurrent={isCurrent}
                      isLocked={isLocked}
                      userAvatar={userAvatar}
                      userName={userName}
                    />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connector to next section */}
      {!isLast && (
        <div className="flex flex-col items-center my-1">
          <div className={cn(
            'w-0.5 h-8',
            sectionCompleted
              ? 'bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-700'
              : 'bg-gradient-to-b from-amber-300 to-amber-200 dark:from-amber-600/80 dark:to-amber-700/40',
          )} />
          {/* Arrow */}
          <svg width="12" height="7" viewBox="0 0 12 7"
            className={sectionCompleted ? 'text-zinc-300 dark:text-zinc-600' : 'text-amber-400 dark:text-amber-600'}
            fill="currentColor">
            <path d="M6 7L0 0h12z" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function ProgressHeader({ progress, completedLessons, totalLessons, sectionsCount }: {
  progress: number
  completedLessons: number
  totalLessons: number
  sectionsCount: number
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border mb-6
      bg-gradient-to-r from-amber-50 via-yellow-50/60 to-amber-50
      dark:from-amber-950/25 dark:via-yellow-950/10 dark:to-amber-950/25
      border-amber-200/50 dark:border-amber-800/30">
      <div className="flex items-center gap-3">
        <span className="text-3xl select-none">🐍</span>
        <div>
          <p className="font-bold text-sm text-amber-900 dark:text-amber-100">Python Mastery</p>
          <p className="text-xs text-amber-700/60 dark:text-amber-400/60">
            {totalLessons} Lessons · {sectionsCount} Modules · Beginner → Advanced
          </p>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1">
        <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
          {progress}%
        </span>
        <div className="w-28 h-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
        <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 tabular-nums">
          {completedLessons} / {totalLessons} done
        </span>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 pt-5 border-t border-border/30 flex-wrap">
      {[
        { dot: 'bg-amber-400', label: 'Available' },
        { dot: 'bg-zinc-400 dark:bg-zinc-500', label: 'Completed' },
        { dot: 'bg-zinc-200 dark:bg-zinc-700 border border-dashed border-zinc-400', label: 'Locked' },
      ].map(({ dot, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn('h-2.5 w-2.5 rounded-full', dot)} />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none">👤</span>
        <span className="text-[11px] text-muted-foreground">You are here</span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
      <ProgressHeader
        progress={progress}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        sectionsCount={sections.length}
      />

      <div className="flex flex-col items-center gap-0 pb-4">
        {sections.map((section, idx) => (
          <Section
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

        {/* Completion trophy */}
        {progress === 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-4 flex flex-col items-center gap-2"
          >
            <div className="w-0.5 h-6 bg-amber-300 dark:bg-amber-700/60" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400">
              <span className="text-lg">🎉</span>
              <span className="text-sm font-semibold">Python Mastery Complete!</span>
            </div>
          </motion.div>
        )}
      </div>

      <Legend />
    </div>
  )
}
