/**
 * PythonRoadmapVisual
 *
 * roadmap.sh / PDF mind-map layout:
 *  • Central vertical spine with section nodes
 *  • Lessons branch LEFT and RIGHT from each section node
 *  • Dashed curved SVG lines connect branches to section node
 *  • Completed  → grayscale (black & white)
 *  • Current    → amber glow + floating user avatar
 *  • Available  → amber/yellow fill
 *  • Locked     → muted, 🔒
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Zap } from 'lucide-react'
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

// ─── Avatar Marker ────────────────────────────────────────────────────────────

function AvatarMarker({ avatar, name }: { avatar?: string; name?: string }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'ME'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
      className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="h-8 w-8 rounded-full ring-2 ring-amber-400 ring-offset-1 ring-offset-background overflow-hidden shadow-md shadow-amber-300/50">
          {avatar ? (
            <img src={avatar} alt={name ?? 'You'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[9px] font-bold">
              {initials}
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full animate-ping bg-amber-300/40 pointer-events-none" />
      </motion.div>
      {/* Downward arrow */}
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400 mt-0.5" />
    </motion.div>
  )
}

// ─── Lesson Node Card ─────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: Lesson
  isCurrent: boolean
  isLocked: boolean
  userAvatar?: string
  userName?: string
}

function LessonCard({ lesson, isCurrent, isLocked, userAvatar, userName }: LessonCardProps) {
  const status = lesson.status ?? 'not_started'
  const isCompleted = status === 'completed'

  const classes = cn(
    'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium',
    'w-[150px] sm:w-[168px] leading-snug transition-all duration-150',

    // Completed → grayscale
    isCompleted && 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500',

    // Current → amber glow
    isCurrent && 'border-amber-400 bg-amber-50 dark:bg-amber-900/25 text-amber-800 dark:text-amber-200 shadow-[0_0_0_3px_rgba(251,191,36,0.2)] font-semibold',

    // Available
    !isCompleted && !isCurrent && !isLocked && 'border-amber-300/80 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 hover:border-amber-400 hover:shadow-sm cursor-pointer',

    // Locked
    isLocked && 'border-zinc-200/50 dark:border-zinc-700/30 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed',
  )

  const inner = (
    <>
      {isCurrent && <AvatarMarker avatar={userAvatar} name={userName} />}

      {/* Status indicator */}
      {isCompleted ? (
        <CheckCircle2 className="h-3 w-3 text-zinc-400 shrink-0" />
      ) : isLocked ? (
        <Lock className="h-3 w-3 text-zinc-300 dark:text-zinc-600 shrink-0" />
      ) : (
        <div className={cn(
          'h-2 w-2 rounded-full shrink-0',
          isCurrent ? 'bg-amber-500 animate-pulse' : 'bg-amber-400',
        )} />
      )}

      <span className={cn(
        'truncate',
        isCompleted && 'line-through decoration-zinc-400/40',
      )}>
        {lesson.title}
      </span>
    </>
  )

  if (isLocked || isCompleted) {
    return (
      <div className={classes}>{inner}</div>
    )
  }

  return (
    <Link to={`/dashboard/learning/lesson/${lesson.id}`} className={classes} aria-current={isCurrent ? 'step' : undefined}>
      {inner}
    </Link>
  )
}

// ─── Section Row ──────────────────────────────────────────────────────────────
// Renders:  [left lessons]  ←dashed lines→  [center circle+label]  ←dashed lines→  [right lessons]

interface SectionRowProps {
  section: RoadmapSection
  sectionIndex: number
  allFlat: Lesson[]
  currentLessonId?: string
  userAvatar?: string
  userName?: string
  isFirst: boolean
  isLast: boolean
}

function SectionRow({
  section,
  sectionIndex,
  allFlat,
  currentLessonId,
  userAvatar,
  userName,
  isFirst,
  isLast,
}: SectionRowProps) {
  const sectionCompleted = section.lessons.every((l) => l.status === 'completed')
  const sectionInProgress = !sectionCompleted && section.lessons.some(
    (l) => l.status === 'in_progress' || l.id === currentLessonId,
  )
  const completedCount = section.lessons.filter((l) => l.status === 'completed').length

  // Split lessons: left side gets odd-indexed (1,3,5…), right side even (0,2,4…) — or split half/half
  const lessons = section.lessons
  const leftLessons: Lesson[] = []
  const rightLessons: Lesson[] = []
  lessons.forEach((l, i) => {
    if (i % 2 === 0) rightLessons.push(l)
    else leftLessons.push(l)
  })

  // SVG connector: horizontal dashed line from center node to lesson card column
  // We use inline SVG positioned absolutely. The center node is at cx=50%

  const centerNodeColor = sectionCompleted
    ? { bg: 'bg-zinc-200 dark:bg-zinc-700', border: 'border-zinc-400 dark:border-zinc-500', text: 'text-zinc-500 dark:text-zinc-400' }
    : sectionInProgress
      ? { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-white' }
      : { bg: 'bg-amber-50 dark:bg-amber-900/25', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' }

  const labelColor = sectionCompleted
    ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
    : sectionInProgress
      ? 'border-amber-400 bg-amber-400/10 text-amber-700 dark:text-amber-300'
      : 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'

  const connectorColor = sectionCompleted ? '#a1a1aa' : '#f59e0b'

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top connector from previous section */}
      {!isFirst && (
        <div className="flex flex-col items-center">
          <div className={cn(
            'w-0.5 h-8',
            sectionCompleted
              ? 'bg-zinc-300 dark:bg-zinc-600'
              : 'bg-amber-400 dark:bg-amber-600',
          )} />
          {/* Arrow */}
          <svg width="10" height="6" viewBox="0 0 10 6" fill={connectorColor}>
            <path d="M5 6L0 0h10z" />
          </svg>
        </div>
      )}

      {/* Main row: left col | center | right col */}
      <div className="relative flex items-start justify-center w-full gap-0">

        {/* Left lessons column */}
        <div className="flex flex-col items-end gap-2 pt-3 pr-3 w-[180px] sm:w-[200px] shrink-0">
          {leftLessons.map((lesson) => {
            const accessible = isAccessible(lesson.id, allFlat)
            const isCurrent = lesson.id === currentLessonId
            const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCurrent={isCurrent}
                isLocked={isLocked}
                userAvatar={userAvatar}
                userName={userName}
              />
            )
          })}
        </div>

        {/* SVG dashed connectors — left side */}
        {leftLessons.length > 0 && (
          <svg
            className="absolute pointer-events-none"
            style={{ left: 0, top: 0, width: '200px', height: '100%' }}
            preserveAspectRatio="none"
          >
            {leftLessons.map((_, i) => {
              const y = 22 + i * 36
              return (
                <line
                  key={i}
                  x1="192" y1={y} x2="200" y2={y}
                  stroke={connectorColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
              )
            })}
          </svg>
        )}

        {/* Center: circle + label */}
        <div className="flex flex-col items-center shrink-0 px-2">
          {/* Circle node */}
          <div className={cn(
            'h-12 w-12 rounded-full border-2 flex items-center justify-center',
            'font-bold text-sm shadow-md z-10',
            centerNodeColor.bg, centerNodeColor.border, centerNodeColor.text,
          )}>
            {sectionCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : sectionInProgress ? (
              <Zap className="h-5 w-5" />
            ) : (
              sectionIndex + 1
            )}
          </div>

          {/* Label pill below circle */}
          <div className={cn(
            'mt-2 px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap',
            labelColor,
          )}>
            {section.title}
            <span className="ml-1.5 opacity-50 font-normal text-[10px]">
              {completedCount}/{section.lessons.length}
            </span>
          </div>
        </div>

        {/* SVG dashed connectors — right side */}
        {rightLessons.length > 0 && (
          <svg
            className="absolute pointer-events-none"
            style={{ right: 0, top: 0, width: '200px', height: '100%' }}
            preserveAspectRatio="none"
          >
            {rightLessons.map((_, i) => {
              const y = 22 + i * 36
              return (
                <line
                  key={i}
                  x1="0" y1={y} x2="8" y2={y}
                  stroke={connectorColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
              )
            })}
          </svg>
        )}

        {/* Right lessons column */}
        <div className="flex flex-col items-start gap-2 pt-3 pl-3 w-[180px] sm:w-[200px] shrink-0">
          {rightLessons.map((lesson) => {
            const accessible = isAccessible(lesson.id, allFlat)
            const isCurrent = lesson.id === currentLessonId
            const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCurrent={isCurrent}
                isLocked={isLocked}
                userAvatar={userAvatar}
                userName={userName}
              />
            )
          })}
        </div>
      </div>

      {/* Bottom connector if not last */}
      {!isLast && (
        <div className="flex justify-center mt-1">
          <div className={cn(
            'w-0.5 h-4',
            sectionCompleted ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-amber-400 dark:bg-amber-600',
          )} />
        </div>
      )}
    </div>
  )
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function ProgressHeader({ progress, completedLessons, totalLessons, sectionsCount }: {
  progress: number; completedLessons: number; totalLessons: number; sectionsCount: number
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 rounded-xl border mb-8
      bg-gradient-to-r from-amber-50/80 via-yellow-50/40 to-amber-50/80
      dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-amber-950/20
      border-amber-200/60 dark:border-amber-800/30">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">🐍</span>
        <div>
          <p className="font-bold text-sm text-amber-900 dark:text-amber-100">Python Mastery</p>
          <p className="text-[11px] text-amber-700/60 dark:text-amber-400/60">
            {totalLessons} Lessons · {sectionsCount} Modules · Beginner → Advanced
          </p>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1">
        <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">{progress}%</span>
        <div className="w-24 h-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
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
    <div className="flex items-center justify-center gap-5 pt-5 mt-2 border-t border-border/30 flex-wrap">
      {[
        { cls: 'bg-amber-400 border-amber-400', label: 'Available' },
        { cls: 'bg-zinc-300 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-600', label: 'Completed' },
        { cls: 'bg-zinc-100 dark:bg-zinc-800 border-dashed border-zinc-300 dark:border-zinc-600', label: 'Locked' },
      ].map(({ cls, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn('h-2.5 w-2.5 rounded border', cls)} />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="text-xs">👤</span>
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
    <div className="w-full overflow-x-auto">
      <div className="min-w-[420px] px-2 pb-6">
        <ProgressHeader
          progress={progress}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          sectionsCount={sections.length}
        />

        {/* Vertical spine with section rows */}
        <div className="relative flex flex-col items-center">
          {/* The continuous center spine line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 z-0"
            style={{
              background: 'repeating-linear-gradient(to bottom, #f59e0b 0, #f59e0b 6px, transparent 6px, transparent 12px)',
            }}
            aria-hidden="true"
          />

          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              className="w-full z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
            >
              <SectionRow
                section={section}
                sectionIndex={idx}
                allFlat={allFlat}
                currentLessonId={currentLessonId}
                userAvatar={userAvatar}
                userName={userName}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
              />
            </motion.div>
          ))}

          {/* Completion flag */}
          {progress === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="mt-6 z-10 flex flex-col items-center gap-2"
            >
              <div className="w-0.5 h-6 bg-green-400" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/25 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400">
                <span>🎉</span>
                <span className="text-sm font-semibold">Python Mastery Complete!</span>
              </div>
            </motion.div>
          )}
        </div>

        <Legend />
      </div>
    </div>
  )
}
