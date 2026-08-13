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
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <Skeleton className="h-16 w-full" />
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── State icon ───────────────────────────────────────────────────────────────

function StateIcon({ state, size = 'sm' }: { state: RoadmapItemState; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-4.5 h-4.5' : 'w-4 h-4'
  switch (state) {
    case 'COMPLETED':
      return <CheckCircle2 className={cn(sz, 'text-emerald-500 shrink-0')} />
    case 'CURRENT':
      return (
        <div className={cn('relative shrink-0', size === 'md' ? 'w-4.5 h-4.5' : 'w-4 h-4')}>
          <span className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
          <Circle className={cn(sz, 'text-blue-500 fill-blue-500/15 relative')} />
        </div>
      )
    case 'UPCOMING':
      return <Circle className={cn(sz, 'text-muted-foreground/35 shrink-0')} />
    case 'LOCKED':
    default:
      return <Lock className={cn(sz, 'text-muted-foreground/20 shrink-0')} />
  }
}

// ─── Legend dot ──────────────────────────────────────────────────────────────

function LegendItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {icon}
      {label}
    </span>
  )
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
        'group w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150',
        clickable
          ? 'border-transparent hover:bg-muted/50 hover:border-border/40 cursor-pointer'
          : 'border-transparent opacity-40 cursor-not-allowed',
        day.state === 'CURRENT' &&
          'bg-blue-500/5 border-blue-500/20! hover:bg-blue-500/8! hover:border-blue-500/30!',
      )}
    >
      {/* Left accent for current */}
      {day.state === 'CURRENT' && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-blue-500" />
      )}

      <StateIcon state={day.state} size="md" />

      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <span
          className={cn(
            'font-mono text-xs font-bold shrink-0',
            day.state === 'CURRENT' ? 'text-blue-500' : 'text-muted-foreground/50',
          )}
        >
          Day {String(day.dayNumber ?? 0).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'text-sm font-medium truncate',
            day.state === 'CURRENT' && 'text-foreground font-semibold',
            day.state === 'COMPLETED' && 'text-foreground/80',
            (day.state === 'UPCOMING' || day.state === 'LOCKED') && 'text-muted-foreground',
          )}
        >
          {day.topicName}
        </span>
        {day.state === 'CURRENT' && (
          <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500 bg-blue-500/5 shrink-0 ml-auto mr-6 hidden sm:inline-flex">
            Current
          </Badge>
        )}
      </div>

      {clickable && (
        <ChevronRight
          className={cn(
            'w-4 h-4 shrink-0 transition-colors ml-auto',
            day.state === 'CURRENT'
              ? 'text-blue-500'
              : 'text-muted-foreground/25 group-hover:text-muted-foreground/60',
          )}
        />
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
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-xl border bg-card overflow-hidden transition-all',
        isActive ? 'border-blue-500/25' : 'border-border',
        allCompleted && 'border-emerald-500/20',
      )}
    >
      {/* Level header */}
      <div
        className={cn(
          'flex items-center gap-4 px-5 py-4 border-b',
          isActive ? 'border-blue-500/15 bg-blue-500/3' : 'border-border/60 bg-muted/20',
          allCompleted && 'border-emerald-500/15 bg-emerald-500/3',
        )}
      >
        {/* Level badge */}
        <div
          className={cn(
            'shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border font-mono font-bold text-sm',
            isActive
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
              : allCompleted
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-muted border-border text-muted-foreground',
          )}
        >
          {String(level.levelNumber ?? 0).padStart(2, '0')}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{level.title}</h3>
            {!level.isActive && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground/60">
                Inactive
              </Badge>
            )}
            {allCompleted && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                ✓ Complete
              </Badge>
            )}
          </div>
          {level.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{level.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="shrink-0 text-right space-y-1.5 hidden sm:block">
          <span className="text-[11px] font-mono text-muted-foreground">
            {level.completedDays}/{level.totalDays} days
          </span>
          <Progress
            value={pct}
            className={cn('h-1.5 w-24 ml-auto', allCompleted && '[&>div]:bg-emerald-500')}
          />
        </div>
      </div>

      {/* Mobile progress */}
      <div className="sm:hidden px-5 py-2 border-b border-border/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Progress</span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {level.completedDays}/{level.totalDays} days
          </span>
        </div>
        <Progress value={pct} className={cn('h-1', allCompleted && '[&>div]:bg-emerald-500')} />
      </div>

      {/* Day rows */}
      <div className="px-3 py-2 space-y-0.5 relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-[28px] top-4 bottom-4 w-px bg-border/50"
          aria-hidden="true"
        />

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
          level.days.map((day) => (
            <div key={day.id} className="relative pl-1">
              <DayRow day={day} />
            </div>
          ))
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
    <div className="space-y-8 pb-10" role="main" aria-label="Learning Roadmap">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Dashboard · Learning · Roadmap
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Learning Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your complete journey, one day at a time.
          </p>
        </div>

        {/* Top-right stats + CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="gap-1.5 py-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
          >
            <CheckCircle2 className="w-3 h-3" />
            {roadmap.totalCompleted} Completed
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1">
            <BookOpen className="w-3 h-3" />
            {roadmap.totalAvailable} Available
          </Badge>
          {dashboard?.currentContent?.id && (
            <Button size="sm" onClick={handleContinue} className="gap-1.5">
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Course Progress Bar ── */}
      <div
        className="rounded-xl border border-border bg-card px-6 py-5 space-y-4"
        style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Course Progress
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{roadmap.totalCompleted}</span>
              <span className="text-base text-muted-foreground">/ {roadmap.totalAvailable} Days</span>
              <span className="text-sm font-mono text-blue-500 font-semibold ml-1">
                {pct.toFixed(1)}% Complete
              </span>
            </div>
          </div>
        </div>

        <Progress value={pct} className="h-2" />

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <LegendItem
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            label="Completed"
          />
          <LegendItem
            icon={
              <div className="relative w-3.5 h-3.5">
                <span className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping" />
                <Circle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/15 relative" />
              </div>
            }
            label="Current"
          />
          <LegendItem
            icon={<Circle className="w-3.5 h-3.5 text-muted-foreground/35" />}
            label="Upcoming"
          />
          <LegendItem
            icon={<Lock className="w-3.5 h-3.5 text-muted-foreground/20" />}
            label="Locked"
          />
        </div>
      </div>

      {/* ── Level sections ── */}
      <div className="space-y-4">
        {roadmap.levels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16">
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
