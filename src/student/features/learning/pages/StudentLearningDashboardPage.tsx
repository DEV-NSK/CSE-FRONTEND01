import { useNavigate } from 'react-router-dom'
import {
  BookOpen, TrendingUp, Award, Play, ChevronRight,
  Radio, Zap, BarChart3, Target,
} from 'lucide-react'
import {
  useStudentLearningDashboard,
  useStudentContinueLearning,
} from '@/shared/hooks/useStudentLearning'
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
import { cn } from '@/shared/lib/utils'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

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

  const { platformCurrentDay, studentCurrentDay, currentLevel, currentContent, progress, levelProgress } = dashboard

  return (
    <div className="space-y-6" role="main" aria-label="Learning Dashboard">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learning Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Continue where you left off. Every day, one new Reel + Notes.
        </p>
      </div>

      {/* ── KPI Row: Platform + Student day ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/0 border-pink-500/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-400/80 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Live Course Day
              </span>
            </div>
            {platformCurrentDay ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-pink-400">
                    Day {platformCurrentDay.dayNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-pink-400/60 font-mono">
                    L{platformCurrentDay.levelNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {platformCurrentDay.topicName}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No published content yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Your Progress
              </span>
            </div>
            {studentCurrentDay ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-emerald-400">
                    Day {studentCurrentDay.dayNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-emerald-400/60 font-mono">
                    L{studentCurrentDay.levelNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {studentCurrentDay.topicName}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start Day 01 to begin your journey
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400/80 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Overall
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{progress.completed}</span>
              <span className="text-lg text-muted-foreground">/ {progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              {progress.percentage.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400/80 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Current Level
              </span>
            </div>
            {currentLevel ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-indigo-400">
                    L{currentLevel.levelNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{currentLevel.title}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assign a level first</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Continue Learning Hero Card ── */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-transparent">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 p-6 lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                {continueLearning?.progressStatus === 'IN_PROGRESS'
                  ? 'Resume where you left off'
                  : 'Ready to learn?'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                    L{studentCurrentDay?.levelNumber.toString().padStart(2, '0') ?? '00'} · Day {studentCurrentDay?.dayNumber.toString().padStart(2, '0') ?? '01'}
                  </Badge>
                  {currentLevel && (
                    <Badge variant="outline" className="text-xs">
                      {currentLevel.title}
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  {currentContent?.topicName || studentCurrentDay?.topicName || 'Welcome to Your Learning Journey'}
                </h2>
                {currentContent?.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {currentContent.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    if (currentContent?.id) navigate(`/dashboard/learning/${currentContent.id}`)
                    else if (continueLearning?.contentId) navigate(`/dashboard/learning/${continueLearning.contentId}`)
                    else navigate('/dashboard/learning/roadmap')
                  }}
                  className="gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Continue Learning
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/dashboard/learning/roadmap')} className="gap-2 text-sm">
                  View Roadmap
                </Button>
              </div>
            </div>

            {progress.total > 0 && (
              <div className="lg:w-64 flex flex-col justify-center gap-3 p-4 lg:p-6 bg-card/50 rounded-xl border border-border/60 lg:border-0 lg:bg-transparent">
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-mono text-foreground">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {progress.percentage.toFixed(1)}%
                  </p>
                </div>
                {continueLearning?.progressStatus === 'IN_PROGRESS' && (
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Today's lesson
                      </span>
                      <span className="text-xs font-mono text-primary">
                        {continueLearning.percentageThroughDay}%
                      </span>
                    </div>
                    <Progress value={continueLearning.percentageThroughDay} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Level Progress ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Level Progress
            </span>
          </h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={() => navigate('/dashboard/learning/roadmap')}>
            Full roadmap <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {levelProgress.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-8">
                  <EmptyState
                    icon={Award}
                    title="No levels created yet"
                    description="Your SUPER_ADMIN will publish learning content soon."
                    compact
                  />
                </CardContent>
              </Card>
            </div>
          )}
          {levelProgress.map((lvl) => (
            <Card key={lvl.levelNumber} className="hover:border-border transition-colors">
              <CardHeader className="py-3 px-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary font-mono text-xs">
                      {lvl.levelNumber.toString().padStart(2, '0')}
                    </span>
                    {lvl.title}
                  </CardTitle>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {lvl.completedDays}/{lvl.totalDays}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-0 pb-4 space-y-1.5">
                <Progress value={lvl.percentage} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  {lvl.percentage.toFixed(1)}% complete
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
