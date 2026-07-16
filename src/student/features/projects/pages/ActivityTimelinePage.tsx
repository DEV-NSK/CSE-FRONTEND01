import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ActivityItem } from '@/student/components/project/ActivityItem'
import { ActivitySkeleton } from '@/student/components/project/ProjectSkeletons'
import { Button } from '@/shared/components/ui/button'
import { useTeam, useTeamActivity } from '@/shared/hooks/useProjects'

function groupByDate(items: Array<{ createdAt: string; id: string }>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<string, typeof items> = { Today: [], Yesterday: [], Earlier: [] }
  items.forEach((item) => {
    const d = new Date(item.createdAt)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === today.getTime()) groups['Today'].push(item)
    else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(item)
    else groups['Earlier'].push(item)
  })
  return groups
}

export function ActivityTimelinePage() {
  const { id: teamId } = useParams<{ id: string }>()
  const { data: team } = useTeam(teamId!)
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useTeamActivity(teamId!, { limit: 30 }) as any

  if (isError) return <ErrorState title="Failed to load activity" message="Please try again." />

  const activities = data?.data ?? []
  const groups = groupByDate(activities)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Timeline"
        description={team?.name}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team?.name ?? 'Team', href: `/dashboard/projects/team/${teamId}` },
          { label: 'Activity' },
        ]}
      />

      {isLoading ? (
        <ActivitySkeleton />
      ) : activities.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groups).map(([group, items]) =>
            items.length === 0 ? null : (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                  {group}
                </h3>
                <div className="pl-4 border-l-2 border-border/50 divide-y divide-border/30">
                  {items.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity as any} />
                  ))}
                </div>
              </motion.div>
            )
          )}
          {hasNextPage && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={fetchNextPage} loading={isFetchingNextPage}>
                Load more
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Activity className="h-10 w-10" />}
          title="No activity yet"
          description="Team activity will appear here as members take actions."
        />
      )}
    </div>
  )
}
