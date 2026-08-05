/**
 * PythonRoadmapVisual
 *
 * Exact reference design:
 *  • Vertical dashed center spine
 *  • Numbered section circles on spine → label pill below
 *  • Lessons fan LEFT and RIGHT with horizontal dashed connectors
 *  • Completed  → grayscale
 *  • Current    → amber border + bouncing user avatar
 *  • Available  → amber outline + amber dot
 *  • Locked     → muted + lock icon
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { RoadmapSection, Lesson } from '@/shared/types/learning'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PythonRoadmapVisualProps {
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
    ? name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
    : 'ME'
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
      className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40 pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="h-8 w-8 rounded-full ring-2 ring-amber-400 ring-offset-1 ring-offset-background overflow-hidden shadow-lg shadow-amber-300/50">
          {avatar
            ? <img src={avatar} alt={name ?? 'You'} className="h-full w-full object-cover" />
            : <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[9px] font-bold">{initials}</div>
          }
        </div>
        <div className="absolute inset-0 rounded-full animate-ping bg-amber-300/30" />
      </motion.div>
      {/* Downward triangle */}
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400 mt-0.5" />
    </motion.div>
  )
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: Lesson
  isCurrent: boolean
  isLocked: boolean
  side: 'left' | 'right'
  userAvatar?: string
  userName?: string
}

function LessonCard({ lesson, isCurrent, isLocked, side, userAvatar, userName }: LessonCardProps) {
  const status = lesson.status ?? 'not_started'
  const isCompleted = status === 'completed'

  // Base card style
  const cardBase = cn(
    'relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium',
    'w-[162px] leading-snug transition-all duration-150',
    // Completed → grayscale
    isCompleted && 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500',
    // Current → amber glow
    isCurrent && 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 shadow-[0_0_0_3px_rgba(251,191,36,0.18)] font-semibold',
    // Available
    !isCompleted && !isCurrent && !isLocked && 'border-amber-300/80 dark:border-amber-700/50 bg-white dark:bg-card text-amber-800 dark:text-amber-200 hover:border-amber-400 hover:shadow-sm cursor-pointer',
    // Locked
    isLocked && 'border-zinc-200/40 dark:border-zinc-700/30 bg-zinc-50/30 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed',
    // RTL flip for left side
    side === 'left' && 'flex-row-reverse text-right',
  )

  const inner = (
    <>
      {/* Avatar on current */}
      {isCurrent && <AvatarMarker avatar={userAvatar} name={userName} />}

      {/* Icon */}
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
        'truncate flex-1',
        isCompleted && 'line-through decoration-zinc-300',
      )}>
        {lesson.title}
      </span>
    </>
  )

  if (isLocked || isCompleted) {
    return <div className={cardBase}>{inner}</div>
  }

  return (
    <Link
      to={`/dashboard/learning/lesson/${lesson.id}`}
      className={cardBase}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {inner}
    </Link>
  )
}

// ─── Dashed horizontal connector line ─────────────────────────────────────────

function HConnector({ side, color }: { side: 'left' | 'right'; color: string }) {
  return (
    <div
      className="flex-1 h-px"
      style={{
        backgroundImage: `repeating-linear-gradient(to ${side === 'right' ? 'right' : 'left'}, ${color} 0, ${color} 5px, transparent 5px, transparent 9px)`,
        opacity: 0.7,
      }}
    />
  )
}

// ─── Section Row ──────────────────────────────────────────────────────────────

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

  // Split lessons: evens go right, odds go left
  const leftLessons: Lesson[] = []
  const rightLessons: Lesson[] = []
  section.lessons.forEach((l, i) => {
    if (i % 2 === 0) rightLessons.push(l)
    else leftLessons.push(l)
  })

  const spineColor = sectionCompleted ? '#a1a1aa' : '#f59e0b'
  const connectorColor = sectionCompleted ? '#d4d4d8' : '#fbbf24'

  // Section node styles
  const nodeStyle = cn(
    'h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-md shrink-0',
    sectionCompleted && 'bg-zinc-100 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-500 text-zinc-500 dark:text-zinc-400',
    sectionInProgress && !sectionCompleted && 'bg-amber-400 border-amber-500 text-white shadow-amber-300/50',
    !sectionCompleted && !sectionInProgress && 'bg-amber-50 dark:bg-amber-900/25 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
  )

  const labelStyle = cn(
    'px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap mt-1.5',
    sectionCompleted && 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
    sectionInProgress && !sectionCompleted && 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    !sectionCompleted && !sectionInProgress && 'border-amber-200 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300',
  )

  // Row height for SVG connector calculation
  const rowHeight = Math.max(leftLessons.length, rightLessons.length) * 44 + 64

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Top solid arrow from previous section */}
      {!isFirst && (
        <div className="flex flex-col items-center">
          <div className="w-px h-8" style={{ background: spineColor }} />
          <svg width="10" height="6" viewBox="0 0 10 6" fill={spineColor}>
            <path d="M5 6L0 0h10z" />
          </svg>
        </div>
      )}

      {/* Three-column layout: left-lessons | center-spine | right-lessons */}
      <div
        className="relative w-full flex items-start"
        style={{ minHeight: rowHeight }}
      >
        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 flex flex-col items-end gap-3 pt-1 pr-0">
          {leftLessons.map((lesson, i) => {
            const accessible = isAccessible(lesson.id, allFlat)
            const isCurrent = lesson.id === currentLessonId
            const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'
            return (
              <div key={lesson.id} className="flex items-center w-full justify-end" style={{ paddingTop: i === 0 ? 14 : 0 }}>
                <LessonCard lesson={lesson} isCurrent={isCurrent} isLocked={isLocked} side="left" userAvatar={userAvatar} userName={userName} />
                <HConnector side="right" color={connectorColor} />
              </div>
            )
          })}
        </div>

        {/* ── CENTER SPINE ── */}
        <div className="flex flex-col items-center shrink-0 w-[72px] relative">
          {/* Dashed spine line running through center */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, ${spineColor} 0, ${spineColor} 6px, transparent 6px, transparent 12px)`,
            }}
            aria-hidden="true"
          />

          {/* Section circle */}
          <div className="relative z-10 pt-2">
            <div className={nodeStyle}>
              {sectionCompleted
                ? <CheckCircle2 className="h-5 w-5" />
                : sectionInProgress
                  ? <Zap className="h-5 w-5" />
                  : sectionIndex + 1
              }
            </div>
          </div>

          {/* Label pill */}
          <div className={labelStyle}>
            {section.title}
            <span className="ml-1 opacity-50 font-normal text-[9px]">
              {completedCount}/{section.lessons.length}
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 flex flex-col items-start gap-3 pt-1 pl-0">
          {rightLessons.map((lesson, i) => {
            const accessible = isAccessible(lesson.id, allFlat)
            const isCurrent = lesson.id === currentLessonId
            const isLocked = !accessible && (lesson.status ?? 'not_started') === 'not_started'
            return (
              <div key={lesson.id} className="flex items-center w-full" style={{ paddingTop: i === 0 ? 14 : 0 }}>
                <HConnector side="left" color={connectorColor} />
                <LessonCard lesson={lesson} isCurrent={isCurrent} isLocked={isLocked} side="right" userAvatar={userAvatar} userName={userName} />
              </div>
            )
          })}
        </div>
      </div>
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
    <div className="flex items-center justify-between px-5 py-3.5 rounded-xl border mb-10
      bg-gradient-to-r from-amber-50/90 to-amber-50/60
      dark:from-amber-950/20 dark:to-amber-950/10
      border-amber-200/50 dark:border-amber-800/30">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <span className="text-xl">🐍</span>
        </div>
        <div>
          <p className="font-bold text-sm text-amber-900 dark:text-amber-100">Python Mastery</p>
          <p className="text-[11px] text-amber-700/60 dark:text-amber-400/60">
            {totalLessons} Lessons · {sectionsCount} Modules · Beginner → Advanced
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
          {progress}%
        </span>
        <div className="w-28 h-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 tabular-nums">
          {completedLessons} / {totalLessons} done
        </p>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 pt-5 mt-4 border-t border-border/30 flex-wrap">
      {[
        { cls: 'bg-amber-400 border-amber-500', label: 'Available' },
        { cls: 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600', label: 'Completed' },
        { cls: 'bg-zinc-100 dark:bg-zinc-800 border-dashed border-zinc-300 dark:border-zinc-600', label: 'Locked' },
      ].map(({ cls, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn('h-3 w-3 rounded-full border', cls)} />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">👤</span>
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
    <div className="w-full overflow-x-auto">
      <div className="min-w-[480px] max-w-[800px] mx-auto px-4 pb-8">
        <ProgressHeader
          progress={progress}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          sectionsCount={sections.length}
        />

        {/* Roadmap spine */}
        <div className="relative flex flex-col items-center gap-0">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              className="w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
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

          {/* End node */}
          <div className="flex flex-col items-center mt-2">
            <div className="w-px h-6 bg-amber-400/50" />
            {progress === 100 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
              >
                <span>🎉</span>
                <span className="text-sm font-semibold">Python Mastery Complete!</span>
              </motion.div>
            ) : (
              <div className="h-3 w-3 rounded-full border-2 border-amber-300/40 bg-amber-50/30 dark:bg-amber-900/10" />
            )}
          </div>
        </div>

        <Legend />
      </div>
    </div>
  )
}
