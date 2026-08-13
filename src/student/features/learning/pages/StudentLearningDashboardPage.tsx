import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  Lock,
  BookOpen,
  Map as RoadmapIcon,
  Flame,
  Award,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  useStudentLearningDashboard,
  useStudentContinueLearning,
} from '@/shared/hooks/useStudentLearning'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/lib/utils'
import type { RoadmapItemState } from '@/shared/types/learning-cms'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  )
}

// ─── Day state icon ───────────────────────────────────────────────────────────

function DayIcon({ state }: { state: RoadmapItemState }) {
  switch (state) {
    case 'COMPLETED':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
    case 'CURRENT':
      return (
        <div className="relative shrink-0 w-4 h-4">
          <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
          <Circle className="w-4 h-4 text-blue-500 fill-blue-500/20 relative" />
        </div>
      )
    case 'UPCOMING':
      return <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
    case 'LOCKED':
    default:
      return <Lock className="w-4 h-4 text-muted-foreground/25 shrink-0" />
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card min-h-[84px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </span>
        <Icon className={cn('w-3.5 h-3.5 text-muted-foreground/50', accent)} />
      </div>
      <div>
        <p className={cn('text-2xl font-bold leading-none text-foreground', accent)}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentLearningDashboardPage() {
  const navigate = useNavigate()
  const { data: dashboard, isLoading, error } = useStudentLearningDashboard()
  const { data: continueLearning } = useStudentContinueLearning()

  if (isLoading) return <DashboardSkeleton />

  if (error || !dashboard) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Unable to load learning dashboard"
        description="Please try again in a moment."
      />
    )
  }

  const { studentCurrentDay, currentLevel, currentContent, progress, levelProgress } = dashboard

  const currentLevelData = levelProgress.find(
    (lp) => lp.levelNumber === currentLevel?.levelNumber,
  )

  // Build day preview list from level progress data
  const previewItems: Array<{ label: string; topic?: string; state: RoadmapItemState }> =
    currentLevelData
      ? Array.from({ length: Math.min(currentLevelData.totalDays, 5) }, (_, i) => {
          const dayNum = i + 1
          if (dayNum <= currentLevelData.completedDays)
            return { label: `Day ${String(dayNum).padStart(2, '0')}`, state: 'COMPLETED' as RoadmapItemState }
          if (dayNum === currentLevelData.completedDays + 1)
            return {
              label: `Day ${String(dayNum).padStart(2, '0')}`,
              topic: currentContent?.topicName,
              state: 'CURRENT' as RoadmapItemState,
            }
          return { label: `Day ${String(dayNum).padStart(2, '0')}`, state: 'UPCOMING' as RoadmapItemState }
        })
      : []

  const handleContinue = () => {
    if (currentContent?.id) navigate(`/dashboard/learning/${currentContent.id}`)
    else if (continueLearning?.contentId) navigate(`/dashboard/learning/${continueLearning.contentId}`)
    else navigate('/dashboard/learning/roadmap')
  }

  const progressStatus = currentContent?.progressStatus
  const statusLabel =
    progressStatus === 'COMPLETED' ? 'Completed'
    : progressStatus === 'IN_PROGRESS' ? 'In Progress'
    : 'Available'
  const statusCls =
    progressStatus === 'COMPLETED'
      ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/8'
      : progressStatus === 'IN_PROGRESS'
      ? 'text-blue-600 border-blue-500/30 bg-blue-500/8'
      : 'text-muted-foreground border-border'

  return (
    <div className="space-y-5 pb-10" role="main" aria-label="Learning Dashboard">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Learning Journey
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Continue where you left off. Learn one topic every day.
        </p>
      </div>

      {/* ── Today's Learning — Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="relative rounded-2xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.06)' }}
      >
        {/* Blue top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400/60 to-transparent" />

        <div className="p-4 sm:p-6">
          {/* Level · Day badge row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-500/8 border border-blue-500/20 px-2 py-0.5 rounded-md tracking-wide">
              LEVEL&nbsp;{String(studentCurrentDay?.levelNumber ?? currentLevel?.levelNumber ?? 0).padStart(2, '0')}
              &nbsp;·&nbsp;
              DAY&nbsp;{String(studentCurrentDay?.dayNumber ?? 0).padStart(2, '0')}
            </span>
            {currentLevel && (
              <span className="text-[11px] text-muted-foreground font-medium">
                {currentLevel.title}
              </span>
            )}
            <Badge variant="outline" className={cn('text-[11px] ml-auto', statusCls)}>
              {statusLabel}
            </Badge>
          </div>

          {/* Topic title */}
          <h2 className="text-base sm:text-xl font-bold text-foreground leading-snug mb-1">
            {currentContent?.topicName || studentCurrentDay?.topicName || 'Start Your Learning Journey'}
          </h2>

          {/* Description */}
          {currentContent?.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 sm:line-clamp-none">
              {currentContent.description}
            </p>
          )}

          {/* Progress bar inline (mobile-friendly) */}
          {(progress.total ?? 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Overall progress</span>
                <span className="text-[11px] font-mono text-foreground font-semibold">
                  {progress.completed}/{progress.total} · {(progress.percentage ?? 0).toFixed(1)}%
                </span>
              </div>
              <Progress value={progress.percentage ?? 0} className="h-1.5" />
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleContinue}
              className="gap-1.5 font-semibold flex-1 sm:flex-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Continue Learning
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/learning/roadmap')}
              className="gap-1.5 text-muted-foreground"
            >
              <RoadmapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Roadmap</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Progress"
          value={`${(progress.percentage ?? 0).toFixed(0)}%`}
          sub={`${progress.completed} of ${progress.total} days`}
          icon={TrendingUp}
          accent="text-blue-500"
        />
        <StatCard
          label="Level"
          value={
            currentLevel
              ? `L${String(currentLevel.levelNumber).padStart(2, '0')}`
              : '—'
          }
          sub={currentLevel?.title}
          icon={Award}
        />
        <StatCard
          label="Completed"
          value={String(progress.completed ?? 0)}
          sub="days done"
          icon={CheckCircle2}
          accent="text-emerald-500"
        />
        <StatCard
          label="Streak"
          value={continueLearning ? 'Active' : '—'}
          sub={continueLearning ? 'Keep it up!' : 'Start today'}
          icon={Zap}
          accent="text-amber-500"
        />
      </div>

      {/* ── Current Level Progress ── */}
      {currentLevelData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: '0 1px 4px 0 rgb(0 0 0 / 0.05)' }}
        >
          {/* Level header */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border/60">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                Level {String(currentLevelData.levelNumber).padStart(2, '0')}
              </p>
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {currentLevelData.title}
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
              {currentLevelData.completedDays}/{currentLevelData.totalDays}
            </span>
          </div>

          {/* Progress bar */}
          <div className="px-4 sm:px-5 py-3 border-b border-border/40">
            <Progress value={currentLevelData.percentage ?? 0} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {(currentLevelData.percentage ?? 0).toFixed(1)}% of this level complete
            </p>
          </div>

          {/* Day preview list */}
          <div className="divide-y divide-border/40">
            {previewItems.length > 0 ? (
              previewItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors',
                    item.state === 'CURRENT' && 'bg-blue-500/4',
                    item.state === 'LOCKED' && 'opacity-40',
                  )}
                >
                  <DayIcon state={item.state} />
                  <span
                    className={cn(
                      'font-mono text-[11px] font-bold shrink-0 w-14',
                      item.state === 'CURRENT' ? 'text-blue-600' : 'text-muted-foreground/60',
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium truncate flex-1',
                      item.state === 'CURRENT' && 'text-foreground font-semibold',
                      item.state === 'COMPLETED' && 'text-foreground/75',
                      item.state === 'UPCOMING' && 'text-muted-foreground',
                      item.state === 'LOCKED' && 'text-muted-foreground/60',
                    )}
                  >
                    {item.topic || (item.state === 'COMPLETED' ? 'Completed' : item.state === 'UPCOMING' ? 'Upcoming' : '—')}
                  </span>
                  {item.state === 'CURRENT' && (
                    <span className="shrink-0 text-[10px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                      Now
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-muted-foreground">No days available yet.</p>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-4 sm:px-5 py-3 border-t border-border/40 bg-muted/20">
            <button
              type="button"
              onClick={() => navigate('/dashboard/learning/roadmap')}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              View Full Roadmap
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── All Levels (multiple) ── */}
      {levelProgress.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              All Levels
            </h3>
            <button
              type="button"
              onClick={() => navigate('/dashboard/learning/roadmap')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Full roadmap <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {levelProgress.map((lvl) => (
              <div
                key={lvl.levelNumber}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted border border-border font-mono text-xs font-bold text-muted-foreground">
                      {String(lvl.levelNumber).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">
                      {lvl.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground shrink-0 ml-2">
                    {lvl.completedDays}/{lvl.totalDays}
                  </span>
                </div>
                <Progress value={lvl.percentage ?? 0} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {(lvl.percentage ?? 0).toFixed(1)}% complete
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {levelProgress.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14">
          <EmptyState
            icon={Flame}
            title="No content published yet"
            description="Your admin will publish learning content soon. Check back later."
            compact
          />
        </div>
      )}
    </div>
  )
}
