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

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
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

// ─── Compact stat ─────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border border-border bg-card">
      <span className={cn('text-xs font-medium text-muted-foreground', accent)}>{label}</span>
      <span className="text-lg font-bold text-foreground leading-tight">{value}</span>
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

  const {
    studentCurrentDay,
    currentLevel,
    currentContent,
    progress,
    levelProgress,
  } = dashboard

  const currentLevelData = levelProgress.find(
    (lp) => lp.levelNumber === currentLevel?.levelNumber,
  )

  // Days preview for current level — we'll build fake preview rows from roadmap shape
  // Using levelProgress to get % and days
  const previewItems: Array<{
    label: string
    state: RoadmapItemState
  }> = currentLevelData
    ? Array.from({ length: Math.min(currentLevelData.totalDays, 5) }, (_, i) => {
        const dayNum = i + 1
        if (dayNum <= currentLevelData.completedDays) return { label: `Day ${String(dayNum).padStart(2, '0')}`, state: 'COMPLETED' as RoadmapItemState }
        if (dayNum === currentLevelData.completedDays + 1) return { label: `Day ${String(dayNum).padStart(2, '0')}`, state: 'CURRENT' as RoadmapItemState }
        return { label: `Day ${String(dayNum).padStart(2, '0')}`, state: 'UPCOMING' as RoadmapItemState }
      })
    : []

  const handleContinue = () => {
    if (currentContent?.id) navigate(`/dashboard/learning/${currentContent.id}`)
    else if (continueLearning?.contentId) navigate(`/dashboard/learning/${continueLearning.contentId}`)
    else navigate('/dashboard/learning/roadmap')
  }

  const statusColor = (s: string | undefined) => {
    if (s === 'COMPLETED') return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/8'
    if (s === 'IN_PROGRESS') return 'text-blue-500 border-blue-500/30 bg-blue-500/8'
    return 'text-muted-foreground'
  }

  const statusLabel = (s: string | undefined) => {
    if (s === 'COMPLETED') return 'Completed'
    if (s === 'IN_PROGRESS') return 'In Progress'
    return 'Available'
  }

  return (
    <div className="space-y-8 pb-10" role="main" aria-label="Learning Dashboard">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Dashboard · Learning
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Learning Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Continue where you left off. Learn one topic every day.
        </p>
      </div>

      {/* ── Today's Learning — Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)' }}
      >
        {/* Subtle blue top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/60 via-blue-400/40 to-transparent" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            {/* Left content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Label row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-blue-500 bg-blue-500/8 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  LEVEL {String(studentCurrentDay?.levelNumber ?? currentLevel?.levelNumber ?? 0).padStart(2, '0')}
                  {' · '}
                  DAY {String(studentCurrentDay?.dayNumber ?? 0).padStart(2, '0')}
                </span>
                {currentLevel && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentLevel.title}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={cn('text-xs ml-auto sm:ml-0', statusColor(currentContent?.progressStatus))}
                >
                  {statusLabel(currentContent?.progressStatus)}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  {currentContent?.topicName
                    || studentCurrentDay?.topicName
                    || 'Start Your Learning Journey'}
                </h2>
                {currentContent?.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
                    {currentContent.description}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <Button
                  size="default"
                  onClick={handleContinue}
                  className="gap-2 font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Continue Learning
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => navigate('/dashboard/learning/roadmap')}
                  className="text-muted-foreground gap-1.5 text-sm"
                >
                  <RoadmapIcon className="w-3.5 h-3.5" />
                  Roadmap
                </Button>
              </div>
            </div>

            {/* Right: compact progress ring area */}
            {(progress.total ?? 0) > 0 && (
              <div className="shrink-0 sm:w-44 p-4 rounded-xl border border-border/60 bg-muted/30 space-y-3 self-start">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Overall
                    </span>
                    <span className="text-[11px] font-mono text-foreground">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage ?? 0} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {(progress.percentage ?? 0).toFixed(1)}% complete
                  </p>
                </div>
                {currentLevelData && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        This Level
                      </span>
                      <span className="text-[11px] font-mono text-foreground">
                        {currentLevelData.completedDays}/{currentLevelData.totalDays}
                      </span>
                    </div>
                    <Progress value={currentLevelData.percentage ?? 0} className="h-1.5" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Compact Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label="Course Progress"
          value={`${(progress.percentage ?? 0).toFixed(1)}%`}
        />
        <StatPill
          label="Current Level"
          value={currentLevel
            ? `L${String(currentLevel.levelNumber).padStart(2, '0')}`
            : '—'}
        />
        <StatPill
          label="Days Completed"
          value={String(progress.completed ?? 0)}
        />
        <StatPill
          label="Current Streak"
          value={continueLearning ? '🔥 Active' : '—'}
        />
      </div>

      {/* ── Level Progress ── */}
      {currentLevelData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)' }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                    Level {String(currentLevelData.levelNumber).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {currentLevelData.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {currentLevelData.completedDays} / {currentLevelData.totalDays} Days
                </span>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={currentLevelData.percentage ?? 0} className="h-1.5" />
            </div>
          </div>

          {/* Day preview list */}
          <div className="px-6 py-4 space-y-1">
            {previewItems.length > 0 ? (
              previewItems.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    item.state === 'CURRENT'
                      ? 'bg-blue-500/5 border border-blue-500/15'
                      : 'hover:bg-muted/40',
                    item.state === 'LOCKED' && 'opacity-40',
                  )}
                >
                  <DayIcon state={item.state} />
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold mr-1 shrink-0',
                      item.state === 'CURRENT' ? 'text-blue-500' : 'text-muted-foreground/60',
                    )}
                  >
                    {item.label}
                  </span>
                  {item.state === 'CURRENT' && currentContent?.topicName && (
                    <span className="text-sm font-medium text-foreground truncate">
                      {currentContent.topicName}
                    </span>
                  )}
                  {item.state === 'COMPLETED' && (
                    <span className="text-xs text-muted-foreground">Completed</span>
                  )}
                  {item.state === 'UPCOMING' && (
                    <span className="text-xs text-muted-foreground">Upcoming</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">No days available yet.</p>
            )}
          </div>

          <div className="px-6 pb-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/learning/roadmap')}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-1"
            >
              View Full Roadmap
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── All Levels Grid (if multiple levels) ── */}
      {levelProgress.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              All Levels
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground h-7"
              onClick={() => navigate('/dashboard/learning/roadmap')}
            >
              Full roadmap <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {levelProgress.map((lvl) => (
              <div
                key={lvl.levelNumber}
                className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      L{String(lvl.levelNumber).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                      {lvl.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                    {lvl.completedDays}/{lvl.totalDays}
                  </span>
                </div>
                <Progress value={lvl.percentage ?? 0} className="h-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {levelProgress.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16">
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
