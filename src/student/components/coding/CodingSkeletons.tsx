import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { Card, CardContent } from '@/shared/components/ui/card'

export function ProblemCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-10" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProblemTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 w-8" />
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="px-4 py-3 text-left hidden md:table-cell">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              <Skeleton className="h-4 w-10" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-4 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-48" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-14 rounded-full" />
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SubmissionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DiscussionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
