import { Skeleton } from '@/shared/components/feedback/Skeleton'

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function RoadmapCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-3 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function LessonCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-10 shrink-0" />
    </div>
  )
}

export function ResourceCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    </div>
  )
}

export function RoadmapDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            {[1, 2, 3].map((j) => (
              <LessonCardSkeleton key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function LessonViewerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '5/6'}`} />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

export function BookmarkCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((group) => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-5 w-28" />
          {[1, 2].map((item) => (
            <div key={item} className="rounded-lg border bg-card p-4 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
