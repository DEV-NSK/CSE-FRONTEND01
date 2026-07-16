import { motion } from 'framer-motion'
import { Check, Trash2, BookOpen, Code2, FolderKanban, Briefcase, Calendar, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { AppNotification, NotificationType } from '@/shared/types/notifications'

const typeIcon: Record<NotificationType, React.ElementType> = {
  learning: BookOpen,
  coding: Code2,
  projects: FolderKanban,
  placement: Briefcase,
  events: Calendar,
  system: Info,
}

const typeColor: Record<NotificationType, string> = {
  learning: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  coding: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  projects: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  placement: 'text-green-500 bg-green-50 dark:bg-green-950',
  events: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  system: 'text-muted-foreground bg-muted',
}

interface NotificationCardProps {
  notification: AppNotification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  index?: number
}

export function NotificationCard({ notification, onMarkRead, onDelete, index = 0 }: NotificationCardProps) {
  const Icon = typeIcon[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border last:border-0',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div className={cn('p-2 rounded-lg shrink-0', typeColor[notification.type])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>{notification.title}</p>
          {!notification.isRead && <Badge variant="default" className="text-xs shrink-0">New</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.createdAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!notification.isRead && (
          <Button variant="ghost" size="icon-sm" onClick={() => onMarkRead(notification.id)} aria-label="Mark as read" className="h-7 w-7">
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}
