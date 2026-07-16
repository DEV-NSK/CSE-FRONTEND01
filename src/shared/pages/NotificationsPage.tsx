import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useNotificationStore } from '@/shared/store/notificationStore'
import { cn } from '@/shared/lib/utils'

const typeColors: Record<string, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Notifications"
        description={`${unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}`}
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card>
        {notifications.length === 0 ? (
          <CardContent className="py-0">
            <EmptyState
              icon={<Bell className="h-12 w-12" aria-hidden="true" />}
              title="No notifications"
              description="You're all caught up! Notifications will appear here when there's activity."
            />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <ul className="divide-y divide-border" role="list">
              {notifications.map((notification, i) => (
                <motion.li
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors',
                    !notification.isRead && 'bg-primary/5'
                  )}
                >
                  <div className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', typeColors[notification.type])} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', !notification.isRead && 'font-medium')}>{notification.title}</p>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => markAsRead(notification.id)}
                        aria-label="Mark as read"
                        className="h-7 w-7"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeNotification(notification.id)}
                      aria-label="Remove notification"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
