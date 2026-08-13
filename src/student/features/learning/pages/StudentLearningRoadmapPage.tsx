import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Map as RoadmapIcon,
  BookOpen,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  useStudentRoadmap,
  useStudentLearningDashboard,
} from '@/shared/hooks/useStudentLearning'
import type { RoadmapItemState, RoadmapLevel, RoadmapDay } from '@/shared/types/learning-cms'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/lib/utils'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RoadmapSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <Skeleton className="h-16 w-full" />
            <div className="p-3 space-y-px">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── State icon ───────────────────────────────────────────────────────────────

function StateIcon({ state }: { state: RoadmapItemState }) {
  switch (state) {
    case 'COMPLETED':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
    case 'CURRENT':
      return (
        <div className="relative w-4 h-4 shrink-0">
          <span className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
          <Circle className="w-4 h-4 text-blue-500 fill-blue-500/15 relative" />
        </div>
      )
    case 'UPCOMING':
      return <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
    case 'LOCKED':
    default:
      return <Lock className="w-4 h-4 text-muted-foreground/20 shrink-0" />
  }
}

// ─── Day row ─────────────────────────────────────────────────────────────────

function DayRow({ day }: { day: RoadmapDay }) {
  const navigate = useNavigate()
  const clickable = day.state !== 'LOCKED'

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && navigate(`/dashboard/learning/${day.id}`)}
      className={cn(
        'relative w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors duration-150',
        clickable
          ? 'hover:bg-muted/50 cursor-pointer active:bg-muted/70'
          : 'opacity-40 cursor-not-allowed',
        day.state === 'CURRENT' && 'bg-blue-500/4 hover:bg-blue-500/7',
      )}
    >
      {/* Current left pill */}
      {day.state === 'CURRENT' && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-blue-500" />
      )}

      <StateIcon state={day.state} />

      {/* Day number */}
      <span
        className={cn(
          'font-mono text-[11px] font-bold shrink-0 w-12',
          day.state === 'CURRENT' ? 'text-blue-600' : 'text-muted-foreground/50',
        )}
      >
        Day {String(day.dayNumber ?? 0).padStart(2, '0')}
      </span>

      {/* Topic */}
      <span
        className={cn(
          'flex-1 min-w-0 text-sm truncate',
          day.state === 'CURRENT' && 'font-semibold text-foreground',
          day.state === 'COMPLETED' && 'font-medium text-foreground/80',
          day.state === 'UPCOMING' && 'font-normal text-muted-foreground',
          day.state === 'LOCKED' && 'font-normal text-muted-foreground/60',
        )}
      >
        {day.topicName}
      </span>

      {/* Current badge — visible on all screens */}
      {day.state === 'CURRENT' && (
        <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
          Now
        </span>
      )}

      {clickable && day.state !== 'CURRENT' && (
        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/25 group-hover:text-muted-foreground/50" />
      )}
      {day.state === 'CURRENT' && (
        <ChevronRight className="w-4 h-4 shrink-0 text-blue-500" />
      )}
    </button>
  )
}

// ─── Level section ────────────────────────────────────────────────────────────

function LevelSection({ level }: { level: RoadmapLevel }) {
  const pct =
    (level.totalDays ?? 0) > 0
      ? ((level.completedDays ?? 0) / (level.totalDays ?? 1)) * 100
      : 0

  const allCompleted = level.completedDays > 0 && level.completedDays === level.totalDays
  const isActive = level.days.some((d) => d.state === 'CURRENT')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        'rounded-xl border bg-card overflow-hidden',
        isActive ? 'border-blue-500/25' : 'border-border',
        allCompleted && 'border-emerald-500/20',
      )}
    >
      {/* Level header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3.5 border-b',
          isActive
            ? 'border-blue-500/15 bg-blue-500/3'
            : allCompleted
            ? 'border-emerald-500/15 bg-emerald-500/3'
            : 'border-border/60 bg-muted/20',
        )}
      >
        {/* Level number badge */}
        <div
          className={cn(
            'shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border font-mono font-bold text-sm',
            isActive
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
              : allCompleted
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
              : 'bg-muted border-border text-muted-foreground',
          )}
        >
          {String(level.levelNumber ?? 0).padStart(2, '0')}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground leading-snug">{level.title}</h3>
            {allCompleted && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                Done
              </span>
            )}
            {!level.isActive && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground/50 h-4 px-1.5">
                Inactive
              </Badge>
            )}
          </div>
          {level.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 leading-snug">
              {level.description}
            </p>
          )}
        </div>

        {/* Days count */}
        <span className="shrink-0 text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {level.completedDays}/{level.totalDays}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2.5 border-b border-border/40">
        <Progress
          value={pct}
          className={cn('h-1.5', allCompleted && '[&>div]:bg-emerald-500')}
        />
      </div>

      {/* Day list */}
      <div className="divide-y divide-border/40">
        {level.days.length === 0 ? (
          <div className="py-8 px-4">
            <EmptyState
              icon={BookOpen}
              title="No content yet"
              description="Lessons will appear here when published."
              compact
            />
          </div>
        ) : (
          level.days.map((day) => <DayRow key={day.id} day={day} />)
        )}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentLearningRoadmapPage() {
  const navigate = useNavigate()
  const { data: roadmap, isLoading, error } = useStudentRoadmap()
  const { data: dashboard } = useStudentLearningDashboard()

  if (isLoading) return <RoadmapSkeleton />

  if (error || !roadmap) {
    return (
      <EmptyState
        icon={RoadmapIcon}
        title="Unable to load roadmap"
        description="Please try again in a moment."
      />
    )
  }

  const pct =
    roadmap.totalAvailable > 0
      ? (roadmap.totalCompleted / roadmap.totalAvailable) * 100
      : 0

  const handleContinue = () => {
    if (dashboard?.currentContent?.id) {
      navigate(`/dashboard/learning/${dashboard.currentContent.id}`)
    }
  }

  return (
    <div className="space-y-5 pb-10" role="main" aria-label="Learning Roadmap">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Your complete journey, one day at a time.
          </p>
        </div>

        {/* Continue button — always visible */}
        {dashboard?.currentContent?.id && (
          <Button size="sm" onClick={handleContinue} className="shrink-0 gap-1.5 mt-1">
            Continue
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* ── Course progress card ── */}
      <div
        className="rounded-xl border border-border bg-card px-4 sm:px-5 py-4 space-y-3"
        style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Course Progress
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold text-foreground leading-none">
                {roadmap.totalCompleted}
              </span>
              <span className="text-sm text-muted-foreground">
                / {roadmap.totalAvailable} Days
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-600 leading-none">
              {pct.toFixed(1)}%
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">complete</p>
          </div>
        </div>

        {/* Bar */}
        <Progress value={pct} className="h-2" />

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {[
            {
              icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
              label: 'Completed',
            },
            {
              icon: (
                <div className="relative w-3 h-3">
                  <span className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
                  <Circle className="w-3 h-3 text-blue-500 fill-blue-500/15 relative" />
                </div>
              ),
              label: 'Current',
            },
            {
              icon: <Circle className="w-3 h-3 text-muted-foreground/35" />,
              label: 'Upcoming',
            },
            {
              icon: <Lock className="w-3 h-3 text-muted-foreground/20" />,
              label: 'Locked',
            },
          ].map(({ icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats row (mobile: 2 pills) ── */}
      <div className="flex items-center gap-2 sm:hidden">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-700 leading-none">
              {roadmap.totalCompleted}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">completed</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground leading-none">
              {roadmap.totalAvailable}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">available</p>
          </div>
        </div>
      </div>

      {/* ── Desktop badge row ── */}
      <div className="hidden sm:flex items-center gap-2">
        <Badge
          variant="outline"
          className="gap-1.5 py-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 font-semibold"
        >
          <CheckCircle2 className="w-3 h-3" />
          {roadmap.totalCompleted} Completed
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1 font-semibold">
          <BookOpen className="w-3 h-3" />
          {roadmap.totalAvailable} Available
        </Badge>
      </div>

      {/* ── Level sections ── */}
      <div className="space-y-3">
        {roadmap.levels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14">
            <EmptyState
              icon={RoadmapIcon}
              title="Roadmap is empty"
              description="Content is being prepared. Please check back soon."
            />
          </div>
        ) : (
          roadmap.levels.map((level) => (
            <LevelSection key={level.id} level={level} />
          ))
        )}
      </div>
    </div>
  )
}
