import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Clock, Calendar, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { CodingDifficultyBadge } from '@/student/components/coding/DifficultyBadge'
import { useDailyChallenge, usePreviousChallenges } from '@/shared/hooks/useCoding'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { formatDate } from '@/shared/lib/utils'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

const PAGE_SIZE = 10

export function DailyChallengePage() {
  const [page, setPage] = useState(1)
  const { data: daily, isLoading: dailyLoading, isError: dailyError, refetch } = useDailyChallenge()
  const { data: previousData, isLoading: prevLoading } = usePreviousChallenges({ page, limit: PAGE_SIZE })
  const timeLeft = useCountdown(daily?.expiresAt ?? null)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Daily Challenge"
        description="Solve today's problem and earn XP rewards."
        breadcrumbs={[{ label: 'Coding', href: '/dashboard/coding' }, { label: 'Daily Challenge' }]}
      />

      {/* Today's Challenge */}
      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="text-lg font-semibold text-foreground mb-4">
          Today's Challenge
        </h2>

        {dailyError ? (
          <ErrorState
            title="Couldn't load today's challenge"
            message="Please try again."
            onRetry={() => refetch()}
          />
        ) : dailyLoading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ) : !daily ? (
          <EmptyState
            icon={<Zap className="h-12 w-12" />}
            title="No challenge today"
            description="Check back later for today's challenge."
          />
        ) : (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className={cn(
                'overflow-hidden border-primary/30',
                daily.isSolved && 'border-green-300 dark:border-green-800'
              )}
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                        <Zap className="h-4 w-4 fill-primary" aria-hidden="true" />
                        Daily Challenge
                      </span>
                      {daily.isSolved && (
                        <Badge variant="success" className="text-xs">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>

                    {/* Problem title */}
                    <h3 className="text-xl font-bold text-foreground">{daily.problem.title}</h3>

                    {/* Meta */}
                    <div className="flex items-center flex-wrap gap-3">
                      <CodingDifficultyBadge difficulty={daily.problem.difficulty} />
                      <span className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                        +{daily.rewardXp} XP reward
                      </span>
                      {timeLeft && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {timeLeft} remaining
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {daily.problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {daily.problem.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button asChild size="lg" className="gap-2">
                      <Link to={`/dashboard/coding/problems/${daily.problem.slug}`}>
                        {daily.isSolved ? 'Review Solution' : 'Solve Now'}
                        <Zap className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {formatDate(daily.date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>

      {/* Previous Challenges */}
      <section aria-labelledby="previous-heading">
        <h2 id="previous-heading" className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Previous Challenges
        </h2>

        {prevLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !previousData?.data?.length ? (
          <EmptyState
            icon={<Trophy className="h-12 w-12" />}
            title="No previous challenges"
            description="Past daily challenges will appear here."
          />
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {previousData.data.map((challenge) => (
                <motion.div key={challenge.id} variants={item}>
                  <Card className={cn('hover:shadow-sm transition-shadow', challenge.isSolved && 'border-green-200 dark:border-green-900/40')}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/dashboard/coding/problems/${challenge.problem.slug}`}
                              className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate"
                            >
                              {challenge.problem.title}
                            </Link>
                            {challenge.isSolved && (
                              <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CodingDifficultyBadge difficulty={challenge.problem.difficulty} />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(challenge.date)}
                            </span>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              +{challenge.rewardXp} XP
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/coding/problems/${challenge.problem.slug}`}>
                            {challenge.isSolved ? 'Review' : 'Solve'}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {previousData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4" role="navigation" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {previousData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= previousData.totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
