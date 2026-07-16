import { Link } from 'react-router-dom'
import { Zap, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { CodingDifficultyBadge } from './DifficultyBadge'
import { useDailyChallenge } from '@/shared/hooks/useCoding'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { cn } from '@/shared/lib/utils'

interface DailyChallengeCardProps {
  className?: string
}

export function DailyChallengeCard({ className }: DailyChallengeCardProps) {
  const { data: daily, isLoading } = useDailyChallenge()
  const timeLeft = useCountdown(daily?.expiresAt ?? null)

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!daily) return null

  return (
    <Card
      className={cn(
        'overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-transparent',
        daily.isSolved && 'border-green-300 dark:border-green-800',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4 fill-primary" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide">Daily Challenge</span>
              </div>
              {daily.isSolved && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Solved</span>
              )}
            </div>

            {/* Problem title */}
            <Link
              to={`/dashboard/coding/problems/${daily.problem.slug}`}
              className="block text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {daily.problem.title}
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <CodingDifficultyBadge difficulty={daily.problem.difficulty} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                +{daily.rewardXp} XP
              </span>
              {timeLeft && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {timeLeft} left
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            variant={daily.isSolved ? 'outline' : 'default'}
            asChild
            className="shrink-0"
          >
            <Link to={`/dashboard/coding/problems/${daily.problem.slug}`}>
              {daily.isSolved ? 'Review' : 'Solve'}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
