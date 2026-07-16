import { motion } from 'framer-motion'
import {
  UserPlus, CheckSquare, Upload, Flag, MessageSquare,
  UserMinus, Send, Users, Pencil, Award,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/utils'
import type { ActivityLog, ActivityAction } from '@/shared/types/project'

interface ActivityItemProps {
  activity: ActivityLog
}

const actionConfig: Record<
  ActivityAction,
  { label: string; icon: typeof UserPlus; color: string }
> = {
  TEAM_CREATED: { label: 'created the team', icon: Users, color: 'text-primary bg-primary/10' },
  MEMBER_JOINED: { label: 'joined the team', icon: UserPlus, color: 'text-green-600 bg-green-100 dark:bg-green-900/40' },
  TASK_ASSIGNED: { label: 'was assigned a task', icon: Flag, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
  TASK_COMPLETED: { label: 'completed a task', icon: CheckSquare, color: 'text-green-600 bg-green-100 dark:bg-green-900/40' },
  MILESTONE_COMPLETED: { label: 'completed a milestone', icon: Award, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
  FILE_UPLOADED: { label: 'uploaded a file', icon: Upload, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
  COMMENT_ADDED: { label: 'added a comment', icon: MessageSquare, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/40' },
  TASK_UPDATED: { label: 'updated a task', icon: Pencil, color: 'text-slate-600 bg-slate-100 dark:bg-slate-900/40' },
  MEMBER_REMOVED: { label: 'was removed from the team', icon: UserMinus, color: 'text-red-600 bg-red-100 dark:bg-red-900/40' },
  INVITATION_SENT: { label: 'sent an invitation', icon: Send, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40' },
  INVITATION_ACCEPTED: { label: 'accepted an invitation', icon: UserPlus, color: 'text-green-600 bg-green-100 dark:bg-green-900/40' },
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = actionConfig[activity.action] ?? {
    label: activity.action.toLowerCase().replace(/_/g, ' '),
    icon: MessageSquare,
    color: 'text-muted-foreground bg-muted',
  }
  const Icon = config.icon

  const metadata = activity.metadata as Record<string, string> | undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 py-3"
    >
      {/* Icon or avatar */}
      <div className="relative shrink-0">
        {activity.user ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.profileImage} alt={activity.user.fullName} />
            <AvatarFallback className="text-xs">{getInitials(activity.user.fullName)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${config.color}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center ${config.color} border-2 border-background`}>
          <Icon className="h-2.5 w-2.5" aria-hidden="true" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.user?.fullName ?? 'Someone'}</span>
          {' '}
          <span className="text-muted-foreground">{config.label}</span>
          {metadata?.taskTitle && (
            <span className="font-medium"> "{metadata.taskTitle}"</span>
          )}
          {metadata?.fileName && (
            <span className="font-medium"> "{metadata.fileName}"</span>
          )}
          {metadata?.milestoneName && (
            <span className="font-medium"> "{metadata.milestoneName}"</span>
          )}
        </p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={activity.createdAt}
        >
          {formatTimeAgo(activity.createdAt)}
        </time>
      </div>
    </motion.div>
  )
}
