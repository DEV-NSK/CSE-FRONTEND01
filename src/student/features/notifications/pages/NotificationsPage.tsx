import { useRef, useCallback } from 'react'
import { CheckCheck, Trash2, Bell } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { NotificationCard } from '@/student/components/placement/NotificationCard'
import { NotificationsSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import {
  useInfiniteNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from '@/shared/hooks/useNotifications'
import { useToast } from '@/shared/hooks/useToast'
import type { NotificationType } from '@/shared/types/notifications'

const TABS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'learning', label: 'Learning' },
  { value: 'coding', label: 'Coding' },
  { value: 'projects', label: 'Projects' },
  { value: 'placement', label: 'Placement' },
  { value: 'events', label: 'Events' },
  { value: 'system', label: 'System' },
]

function NotificationList({ type }: { type: NotificationType | 'all' }) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteNotifications(
    type !== 'all' ? { type } : {}
  )
  const markRead = useMarkNotificationRead()
  const deleteNotif = useDeleteNotification()

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loaderRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    })
    observerRef.current.observe(node)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allNotifications = data?.pages.flatMap((p) => p.data) ?? []

  if (isLoading) return <NotificationsSkeleton />

  if (allNotifications.length === 0) return (
    <EmptyState icon={<Bell className="h-12 w-12" />} title="No notifications" description={type === 'all' ? "You're all caught up!" : `No ${type} notifications.`} />
  )

  // Group by date
  const grouped: Record<string, typeof allNotifications> = {}
  allNotifications.forEach((n) => {
    const key = new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(n)
  })

  return (
    <div>
      {Object.entries(grouped).map(([date, notifs]) => (
        <div key={date}>
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">{date}</p>
          </div>
          {notifs.map((n, i) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => deleteNotif.mutate(id)}
              index={i}
            />
          ))}
        </div>
      ))}
      <div ref={loaderRef} className="h-4" />
      {isFetchingNextPage && <div className="py-4 text-center text-xs text-muted-foreground">Loading more…</div>}
    </div>
  )
}

export function NotificationsPage() {
  const markAll = useMarkAllNotificationsRead()
  const deleteRead = useDeleteAllReadNotifications()
  const { toast } = useToast()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        title="Notifications"
        description="Stay up to date with your activity"
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={async () => { await markAll.mutateAsync(); toast({ title: 'All marked as read' }) }}>
              <CheckCheck className="h-4 w-4" />Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"
              onClick={async () => { await deleteRead.mutateAsync(); toast({ title: 'Cleared read notifications' }) }}>
              <Trash2 className="h-4 w-4" />Clear read
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <NotificationList type={tab.value} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
