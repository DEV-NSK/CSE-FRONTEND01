import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, CheckSquare, UserPlus, Flag, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useProjectDashboard } from '@/shared/hooks/useProjects'

export function DashboardProjectWidget() {
  const { data, isLoading } = useProjectDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />
        </CardContent>
      </Card>
    )
  }

  const stats = data?.stats

  const items = [
    {
      label: 'Active Projects',
      value: stats?.totalTeams ?? 0,
      icon: FolderKanban,
      color: 'text-primary',
      href: '/dashboard/projects',
    },
    {
      label: 'Pending Tasks',
      value: (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0),
      icon: CheckSquare,
      color: 'text-amber-500',
      href: '/dashboard/projects',
    },
    {
      label: 'Invitations',
      value: stats?.pendingInvitations ?? 0,
      icon: UserPlus,
      color: 'text-blue-500',
      href: '/dashboard/projects/invitations',
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Project Hub</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
            <Link to="/dashboard/projects">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.label} whileHover={{ scale: 1.02 }}>
                <Link to={item.href}>
                  <div className="rounded-lg border p-3 text-center hover:bg-accent/5 transition-colors">
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} aria-hidden="true" />
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Pending tasks preview */}
        {data?.pendingTasks && data.pendingTasks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Pending Tasks</p>
            {data.pendingTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50">
                <Flag className="h-3 w-3 text-amber-500 shrink-0" aria-hidden="true" />
                <span className="text-xs truncate flex-1">{task.title}</span>
                <Badge variant="outline" className="text-[10px] px-1">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Invitations banner */}
        {(stats?.pendingInvitations ?? 0) > 0 && (
          <Link to="/dashboard/projects/invitations">
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 hover:bg-primary/15 transition-colors">
              <UserPlus className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs text-primary font-medium">
                {stats?.pendingInvitations} pending invitation{(stats?.pendingInvitations ?? 0) > 1 ? 's' : ''}
              </span>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
