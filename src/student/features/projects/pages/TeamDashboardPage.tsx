import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, CheckSquare, Flag, Calendar, Clock, Activity,
  FolderOpen, UserPlus, Settings, BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { MilestoneCard } from '@/student/components/project/MilestoneCard'
import { ActivityItem } from '@/student/components/project/ActivityItem'
import { TaskCard } from '@/student/components/project/TaskCard'
import { FileCard } from '@/student/components/project/FileCard'
import { MemberCard } from '@/student/components/project/MemberCard'
import { KanbanBoard } from '@/student/components/project/KanbanBoard'
import {
  ActivitySkeleton, MilestoneCardSkeleton, MemberCardSkeleton, FileCardSkeleton,
} from '@/student/components/project/ProjectSkeletons'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { getInitials } from '@/shared/lib/utils'
import { useTeam, useTasks, useMilestones, useTeamActivity, useProjectFiles, useUpdateTask } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { TaskStatus } from '@/shared/types/project'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export function TeamDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(id!)
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ teamId: id, limit: 100 })
  const { data: activityData, isLoading: actLoading } = useTeamActivity(id!, { limit: 20 })
  const { data: filesData, isLoading: filesLoading } = useProjectFiles(team?.projectId ?? '')
  const { data: milestonesData, isLoading: mlLoading } = useMilestones({ projectId: team?.projectId })
  const { mutate: updateTask } = useUpdateTask()

  const tasks = tasksData?.data ?? []
  const activity = activityData?.data ?? []
  const files = filesData?.data ?? []
  const milestones = milestonesData?.data ?? []

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const openTasks = tasks.filter((t) => t.status !== 'COMPLETED').length
  const completionPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const nextMilestone = milestones
    .filter((m) => m.status !== 'COMPLETED' && m.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]

  const myMembership = team?.members?.find((m) => m.userId === user?.id)
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'LEADER'

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!id) return
    updateTask(
      { id: taskId, payload: { status: newStatus }, teamId: id },
      { onError: () => toast({ title: 'Failed to update task', variant: 'destructive' }) }
    )
  }

  if (teamLoading) return <TeamDashboardSkeleton />
  if (teamError || !team) {
    return <ErrorState title="Team not found" message="This team doesn't exist or you don't have access." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={team.project?.title}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team.project?.title ?? 'Project', href: `/dashboard/projects/${team.projectId}` },
          { label: team.name },
        ]}
        actions={
          canManage ? (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to={`/dashboard/projects/team/${id}/members`}>
                <UserPlus className="h-4 w-4" /> Invite Members
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Team Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{team.name}</h2>
              <p className="text-sm text-muted-foreground">{team.project?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              {team.members?.slice(0, 5).map((m) => (
                <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={m.user.profileImage} alt={m.user.fullName} />
                  <AvatarFallback className="text-xs">{getInitials(m.user.fullName)}</AvatarFallback>
                </Avatar>
              ))}
              {(team.members?.length ?? 0) > 5 && (
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                  +{(team.members?.length ?? 0) - 5}
                </div>
              )}
            </div>
            <Badge variant="outline">{team.members?.length ?? 0}/{team.maxMembers}</Badge>
            <Badge variant={team.status === 'OPEN' ? 'success' : team.status === 'FULL' ? 'warning' : 'secondary'}>
              {team.status}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{completionPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stat widgets */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Completion', value: `${completionPct}%`, icon: BarChart3, color: 'text-primary' },
          { label: 'Open Tasks', value: openTasks, icon: Flag, color: 'text-amber-500' },
          { label: 'Completed', value: completedTasks, icon: CheckSquare, color: 'text-green-500' },
          { label: 'Members', value: team.members?.length ?? 0, icon: Users, color: 'text-blue-500' },
          { label: 'Next Deadline', value: nextMilestone ? new Date(nextMilestone.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', icon: Calendar, color: 'text-orange-500' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={item}>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <Icon className={`h-3.5 w-3.5 ${s.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main workspace tabs */}
      <Tabs defaultValue="tasks">
        <TabsList className="h-9">
          <TabsTrigger value="tasks" className="text-xs gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" />Tasks
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <Activity className="h-3.5 w-3.5" />Activity
          </TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />Milestones
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />Files
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" />Members
          </TabsTrigger>
        </TabsList>

        {/* Tasks tab */}
        <TabsContent value="tasks" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Task Board</h3>
            <div className="flex gap-2">
              {canManage && (
                <Button size="sm" className="gap-1.5 h-8" asChild>
                  <Link to={`/dashboard/projects/team/${id}/tasks`}>
                    <Flag className="h-3.5 w-3.5" /> Full Board
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {tasksLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {['Todo', 'In Progress', 'Review', 'Done'].map((col) => (
                <div key={col} className="min-w-[240px] rounded-xl bg-muted/30 p-2 space-y-2">
                  <Skeleton className="h-8 rounded-lg" />
                  {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              canManage={canManage}
              onStatusChange={handleStatusChange}
              onAddTask={() => {}}
            />
          )}
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Activity Timeline</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link to={`/dashboard/projects/team/${id}/activity`}>View all</Link>
            </Button>
          </div>
          {actLoading ? (
            <ActivitySkeleton />
          ) : activity.length > 0 ? (
            <div className="divide-y divide-border/50">
              {activity.slice(0, 10).map((a) => <ActivityItem key={a.id} activity={a} />)}
            </div>
          ) : (
            <EmptyState icon={<Clock className="h-8 w-8" />} title="No activity yet" className="py-8" />
          )}
        </TabsContent>

        {/* Milestones tab */}
        <TabsContent value="milestones" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Milestones</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link to={`/dashboard/projects/team/${id}/milestones`}>Manage</Link>
            </Button>
          </div>
          {mlLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <MilestoneCardSkeleton key={i} />)}</div>
          ) : milestones.length > 0 ? (
            <div className="space-y-3">{milestones.slice(0, 5).map((m) => <MilestoneCard key={m.id} milestone={m} />)}</div>
          ) : (
            <EmptyState icon={<Calendar className="h-8 w-8" />} title="No milestones" className="py-8" />
          )}
        </TabsContent>

        {/* Files tab */}
        <TabsContent value="files" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Project Files</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link to={`/dashboard/projects/team/${id}/files`}>Manage Files</Link>
            </Button>
          </div>
          {filesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <FileCardSkeleton key={i} />)}</div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.slice(0, 4).map((f) => (
                <FileCard key={f.id} file={f} currentUserId={user?.id} isOwner={canManage} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<FolderOpen className="h-8 w-8" />} title="No files yet" className="py-8" />
          )}
        </TabsContent>

        {/* Members tab */}
        <TabsContent value="members" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Team Members</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link to={`/dashboard/projects/team/${id}/members`}>Manage</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.members?.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.userId === user?.id}
                canManage={false}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TeamDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-36 rounded-xl" />
      <div className="grid grid-cols-5 gap-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="min-w-[240px] h-60 rounded-xl" />)}</div>
    </div>
  )
}
