import { useNavigate } from 'react-router-dom'
import {
  BookOpen, CheckCircle2, Circle, Lock, ChevronRight,
  Map as RoadmapIcon, Award, TrendingUp,
} from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

function RoadmapSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <div className="pl-6 space-y-2">
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

function DayStateIcon({ state, size = 'sm' }: { state: RoadmapItemState; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  switch (state) {
    case 'COMPLETED':
      return <CheckCircle2 className={cn(cls, 'text-emerald-500 fill-emerald-500/10')} />
    case 'CURRENT':
      return (
        <div className="relative">
          <div className={cn('absolute inset-0 rounded-full bg-primary/30 animate-ping', { 'w-5 h-5': size === 'md', 'w-4 h-4': size === 'sm' })} />
          <Circle className={cn(cls, 'text-primary fill-primary/20')} />
        </div>
      )
    case 'UPCOMING':
      return <Circle className={cn(cls, 'text-muted-foreground/40')} />
    case 'LOCKED':
    default:
      return <Lock className={cn(cls, 'text-muted-foreground/20')} />
  }
}

function DayRow({ day, level }: { day: RoadmapDay; level: RoadmapLevel }) {
  const navigate = useNavigate()
  const clickable = day.state !== 'LOCKED'

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && navigate(`/dashboard/learning/${day.id}`)}
      className={cn(
        'group relative w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-all',
        clickable
          ? 'hover:bg-accent/40 hover:border-border cursor-pointer border-transparent'
          : 'border-transparent opacity-50 cursor-not-allowed',
        day.state === 'CURRENT' && 'bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/40',
      )}
    >
      {day.state === 'CURRENT' && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
      )}
      <div className="flex-shrink-0 pl-0.5">
        <DayStateIcon state={day.state} size="md" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'font-mono text-xs font-semibold',
            day.state === 'CURRENT' ? 'text-primary' : 'text-muted-foreground/70',
          )}>
            Day {day.dayNumber.toString().padStart(2, '0')}
          </span>
          <p className={cn(
            'text-sm font-medium truncate',
            day.state === 'CURRENT' && 'text-foreground',
            day.state === 'COMPLETED' && 'text-foreground/80',
          )}>
            {day.topicName}
          </p>
        </div>
      </div>
      {clickable && (
        <ChevronRight className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          day.state === 'CURRENT' ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground',
        )} />
      )}
    </button>
  )
}

function LevelSection({ level, isFirst }: { level: RoadmapLevel; isFirst: boolean }) {
  return (
    <section className={cn(!isFirst && 'mt-2')}>
      <Card className="overflow-hidden">
        <CardHeader className="py-3.5 px-4 border-b border-border/60 bg-card/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <span className="font-mono font-bold text-primary text-sm">
                  {level.levelNumber.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                  {level.title}
                  {!level.isActive && (
                    <Badge variant="outline" className="text-[10px] border-muted/40 text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </CardTitle>
                {level.description && (
                  <CardDescription className="text-xs mt-0.5 line-clamp-2">
                    {level.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 space-y-1.5">
              <div className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                {level.completedDays}/{level.totalDays} days
              </div>
              <Progress
                value={level.totalDays > 0 ? (level.completedDays / level.totalDays) * 100 : 0}
                className="h-1.5 w-28 ml-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <div
              className="absolute left-[30px] top-0 bottom-0 w-px bg-border/60"
              aria-hidden="true"
            />
            <div className="flex flex-col py-2 space-y-0.5 px-2">
              {level.days.length === 0 && (
                <div className="px-4 py-6">
                  <EmptyState
                    icon={BookOpen}
                    title="No lessons yet"
                    description="Content coming soon."
                    compact
                  />
                </div>
              )}
              {level.days.map((day) => (
                <div key={day.id} className="pl-2">
                  <DayRow day={day} level={level} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

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

  const pct = roadmap.totalAvailable > 0 ? (roadmap.totalCompleted / roadmap.totalAvailable) * 100 : 0

  return (
    <div className="space-y-6" role="main" aria-label="Learning Roadmap">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RoadmapIcon className="w-6 h-6 text-primary" />
            Learning Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your complete journey, one day at a time.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-600">
            <CheckCircle2 className="w-3 h-3" />
            {roadmap.totalCompleted} completed
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1">
            <BookOpen className="w-3 h-3" />
            {roadmap.totalAvailable} available
          </Badge>
          {dashboard?.currentContent?.id && (
            <Button size="sm" onClick={() => navigate(`/dashboard/learning/${dashboard.currentContent.id}`)} className="gap-1.5">
              Continue <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress summary */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Roadmap Progress
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{roadmap.totalCompleted}</span>
                <span className="text-lg text-muted-foreground">/ {roadmap.totalAvailable}</span>
                <span className="text-sm font-mono text-primary">
                  ({pct.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Progress value={pct} className="h-2.5" />
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
                </span>
                <span className="inline-flex items-center gap-1">
                  <Circle className="w-3 h-3 text-primary fill-primary/20" /> Current
                </span>
                <span className="inline-flex items-center gap-1">
                  <Circle className="w-3 h-3 text-muted-foreground/40" /> Upcoming
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-muted-foreground/20" /> Locked
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level sections */}
      <ScrollArea className="h-[calc(100vh-22rem)] rounded-xl pr-2 -mr-2">
        <div className="space-y-4 pb-4">
          {roadmap.levels.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Roadmap is empty"
              description="Content is being prepared. Please check back soon."
            />
          ) : (
            roadmap.levels.map((level, idx) => (
              <LevelSection key={level.id} level={level} isFirst={idx === 0} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
