import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, PlayCircle, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { useRecentlyViewed } from '@/shared/hooks/useLearning'
import { formatDate, cn } from '@/shared/lib/utils'

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

// Group items by date
function groupByDate(items: Array<{ viewedAt: string; [key: string]: unknown }>) {
  const groups: Record<string, typeof items> = {}
  for (const item of items) {
    const date = new Date(item.viewedAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    let key: string
    if (date.toDateString() === today.toDateString()) key = 'Today'
    else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday'
    else key = formatDate(item.viewedAt)

    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

export function RecentlyViewedPage() {
  const { data: recentItems, isLoading, isError, refetch } = useRecentlyViewed(50)

  const grouped = recentItems ? groupByDate(recentItems as Array<{ viewedAt: string; [key: string]: unknown }>) : {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recently Viewed"
        description="Pick up where you left off."
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Recently Viewed' },
        ]}
      />

      {isError ? (
        <ErrorState
          title="Couldn't load history"
          message="Failed to fetch recently viewed lessons."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((group) => (
            <div key={group}>
              <Skeleton className="h-5 w-16 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !recentItems?.length ? (
        <EmptyLearningState variant="recent" />
      ) : (
        <div className="relative space-y-8">
          {/* Timeline line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-border to-transparent"
            aria-hidden="true"
          />

          {Object.entries(grouped).map(([dateLabel, items]) => (
            <section key={dateLabel} aria-labelledby={`date-${dateLabel}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center z-10 relative shrink-0">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h2 id={`date-${dateLabel}`} className="font-semibold text-sm text-foreground">
                  {dateLabel}
                </h2>
              </div>

              <div className="pl-12 space-y-3">
                {items.map((viewed: unknown) => {
                  const rv = viewed as {
                    id: string
                    viewedAt: string
                    roadmapTitle?: string
                    lesson: { id: string; title: string; estimatedMinutes: number; status?: string }
                  }

                  const statusColor = {
                    completed: 'text-green-600 dark:text-green-400',
                    in_progress: 'text-primary',
                    not_started: 'text-muted-foreground',
                  }[rv.lesson.status ?? 'not_started']

                  return (
                    <motion.div
                      key={rv.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="hover:shadow-sm transition-shadow group">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {rv.lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {rv.roadmapTitle && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {rv.roadmapTitle}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {rv.lesson.estimatedMinutes}m
                              </span>
                              {rv.lesson.status && (
                                <>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className={cn('text-xs capitalize font-medium', statusColor)}>
                                    {rv.lesson.status.replace('_', ' ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {formatTimeAgo(rv.viewedAt)}
                            </span>
                            <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs">
                              <Link to={`/dashboard/learning/lesson/${rv.lesson.id}`}>
                                <PlayCircle className="h-3.5 w-3.5" />
                                Continue
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
