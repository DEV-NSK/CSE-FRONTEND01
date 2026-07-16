import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderKanban, ArrowRight, Plus, Users, Bell, Flag, Calendar,
  Compass, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProjectCard, ProjectCardSkeleton } from '@/student/components/project/ProjectCard'
import { TeamCard } from '@/student/components/project/TeamCard'
import { InvitationCard } from '@/student/components/project/InvitationCard'
import { MilestoneCard } from '@/student/components/project/MilestoneCard'
import { ActivityItem } from '@/student/components/project/ActivityItem'
import { TeamCardSkeleton, MilestoneCardSkeleton, ActivitySkeleton } from '@/student/components/project/ProjectSkeletons'
import { useProjects, useMyTeams, useMyInvitations, useProjectDashboard, useRespondToInvitation } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function ProjectHubHomePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: featuredProjects, isLoading: projLoading, isError: projError } = useProjects({ limit: 4, isPublished: true })
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams()
  const { data: invitations, isLoading: invLoading } = useMyInvitations('received')
  const { data: dashboard, isLoading: dashLoading } = useProjectDashboard()

  const { mutate: respond, isPending: respondPending } = useRespondToInvitation()

  const pendingInvitations = invitations?.filter((i) => i.status === 'PENDING') ?? []
  const upcomingMilestones = dashboard?.upcomingMilestones ?? []
  const recentActivity = dashboard?.recentActivity ?? []

  const handleAccept = (id: string) => {
    respond({ id, status: 'ACCEPTED' }, {
      onSuccess: () => toast({ title: 'Invitation accepted!', variant: 'default' }),
      onError: () => toast({ title: 'Failed to accept', variant: 'destructive' }),
    })
  }

  const handleReject = (id: string) => {
    respond({ id, status: 'REJECTED' }, {
      onSuccess: () => toast({ title: 'Invitation rejected' }),
      onError: () => toast({ title: 'Failed to reject', variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Project Hub"
        description="Discover projects, collaborate with teammates, and build something great."
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <Button size="sm" className="gap-1.5" asChild>
            <Link to="/dashboard/projects/explore">
              <Compass className="h-4 w-4" />
              Explore Projects
            </Link>
          </Button>
        }
      />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/60 p-8 text-white"
      >
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 20%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FolderKanban className="h-6 w-6" aria-hidden="true" />
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h2>
          <p className="text-white/80 text-sm mb-5">
            {myTeams && myTeams.length > 0
              ? `You're part of ${myTeams.length} team${myTeams.length > 1 ? 's' : ''}. Keep building!`
              : 'Join or create a team to start collaborating on real projects.'}
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button size="sm" variant="secondary" className="gap-1.5" asChild>
              <Link to="/dashboard/projects/explore">
                <Compass className="h-4 w-4" /> Browse Projects
              </Link>
            </Button>
            {myTeams && myTeams.length > 0 && (
              <Button size="sm" variant="outline" className="gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to={`/dashboard/projects/team/${myTeams[0].id}`}>
                  <ArrowRight className="h-4 w-4" /> My Team
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {dashboard && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Active Teams', value: dashboard.stats?.totalTeams ?? 0, icon: Users, color: 'text-primary' },
            { label: 'Open Tasks', value: (dashboard.stats?.totalTasks ?? 0) - (dashboard.stats?.completedTasks ?? 0), icon: Flag, color: 'text-amber-500' },
            { label: 'Completed Tasks', value: dashboard.stats?.completedTasks ?? 0, icon: Flag, color: 'text-green-500' },
            { label: 'Invitations', value: dashboard.stats?.pendingInvitations ?? 0, icon: Bell, color: 'text-blue-500' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <motion.div key={s.label} variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <Icon className={`h-4 w-4 ${s.color}`} aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pending Invitations */}
      {(pendingInvitations.length > 0 || invLoading) && (
        <section aria-labelledby="invitations-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="invitations-heading" className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
              Pending Invitations
              {pendingInvitations.length > 0 && (
                <Badge variant="destructive" className="text-xs">{pendingInvitations.length}</Badge>
              )}
            </h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link to="/dashboard/projects/invitations">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingInvitations.slice(0, 3).map((inv) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                type="received"
                onAccept={handleAccept}
                onReject={handleReject}
                isLoading={respondPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* Continue Working / My Teams */}
      <section aria-labelledby="my-teams-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="my-teams-heading" className="text-lg font-semibold">My Teams</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link to="/dashboard/projects/explore">
              <Plus className="h-3.5 w-3.5" /> Join a project
            </Link>
          </Button>
        </div>
        {teamsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <TeamCardSkeleton key={i} />)}
          </div>
        ) : myTeams && myTeams.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.map((team) => (
              <motion.div key={team.id} variants={item}>
                <TeamCard team={team} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No teams yet"
            description="Explore projects and join or create a team to start collaborating."
            action={{ label: 'Explore Projects', onClick: () => navigate('/dashboard/projects/explore') }}
          />
        )}
      </section>

      {/* Featured Projects */}
      <section aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="featured-heading" className="text-lg font-semibold">Featured Projects</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link to="/dashboard/projects/explore">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {projError ? (
          <ErrorState title="Couldn't load projects" message="Please refresh the page." />
        ) : projLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : featuredProjects?.data && featuredProjects.data.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProjects.data.map((proj) => (
              <motion.div key={proj.id} variants={item}>
                <ProjectCard project={proj} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState icon={<FolderKanban className="h-10 w-10" />} title="No projects yet" />
        )}
      </section>

      {/* Two-column: Upcoming Milestones + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Milestones */}
        <section aria-labelledby="milestones-heading">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                  Upcoming Milestones
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {dashLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <MilestoneCardSkeleton key={i} />)}
                </div>
              ) : upcomingMilestones.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMilestones.slice(0, 3).map((m) => (
                    <MilestoneCard key={m.id} milestone={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No upcoming milestones"
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Team Activity Feed */}
        <section aria-labelledby="activity-heading">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {dashLoading ? (
                <ActivitySkeleton />
              ) : recentActivity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentActivity.slice(0, 6).map((act) => (
                    <ActivityItem key={act.id} activity={act} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="h-8 w-8" />}
                  title="No recent activity"
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
