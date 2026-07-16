import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { Card, CardContent } from '@/shared/components/ui/card'

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-36 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-6 rounded-full border-2 border-background" />
          ))}
        </div>
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-8 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

export function TaskCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MilestoneCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FileCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 py-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MemberCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InvitationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {['Todo', 'In Progress', 'Review', 'Completed'].map((col) => (
        <div key={col} className="flex flex-col rounded-xl min-w-[260px] flex-1 max-w-sm bg-muted/30">
          <div className="px-3 py-2 rounded-t-xl bg-muted">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
