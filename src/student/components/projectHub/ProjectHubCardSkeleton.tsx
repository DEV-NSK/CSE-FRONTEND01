/**
 * Loading skeleton components for Project Hub cards.
 * Matches the layout of ProjectHubCard exactly so the transition
 * from loading → loaded is smooth with no layout shift.
 */

import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

interface ProjectHubCardSkeletonProps {
  className?: string
  compact?: boolean
}

export function ProjectHubCardSkeleton({
  className,
  compact = false,
}: ProjectHubCardSkeletonProps) {
  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/5 bg-muted animate-pulse rounded" />
            <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-7 w-16 bg-muted animate-pulse rounded shrink-0" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden h-full flex flex-col', className)}>
      {/* Cover image placeholder */}
      <div className="h-40 bg-muted animate-pulse shrink-0" />

      <CardContent className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Title */}
        <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />

        {/* Description */}
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
        </div>

        {/* Tech tags */}
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-12 bg-muted animate-pulse rounded-full"
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 bg-muted animate-pulse rounded-full shrink-0" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
        </div>

        {/* CTA button */}
        <div className="h-8 w-full bg-muted animate-pulse rounded-md mt-1" />
      </CardContent>
    </Card>
  )
}

/** Grid of N skeleton cards — convenience wrapper for the discovery page */
export function ProjectHubGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className,
      )}
      aria-busy="true"
      aria-label="Loading projects"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProjectHubCardSkeleton key={i} />
      ))}
    </div>
  )
}
