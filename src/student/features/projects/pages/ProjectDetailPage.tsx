import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GitBranch, ExternalLink, BookOpen, Code2, Target, Users,
  Clock, ArrowRight, Plus, FolderKanban, CheckSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DifficultyBadge } from '@/student/components/project/DifficultyBadge'
import { TechnologyBadge } from '@/student/components/project/TechnologyBadge'
import { TeamCard } from '@/student/components/project/TeamCard'
import { MilestoneCard } from '@/student/components/project/MilestoneCard'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog'
import { useProject, useCreateTeam, useMilestones, useMyTeams } from '@/shared/hooks/useProjects'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const { data: project, isLoading, isError } = useProject(id!)
  const { data: milestones, isLoading: mlLoading } = useMilestones({ projectId: id })
  const { data: myTeams } = useMyTeams()
  const { mutate: createTeam, isPending: creating } = useCreateTeam()

  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [maxMembers, setMaxMembers] = useState(5)

  const userTeamForProject = myTeams?.find((t) => t.projectId === id)

  const handleCreateTeam = () => {
    if (!teamName.trim() || !id) return
    createTeam(
      { projectId: id, name: teamName.trim(), maxMembers },
      {
        onSuccess: (res) => {
          toast({ title: 'Team created!' })
          setShowCreateTeam(false)
          navigate(`/dashboard/projects/team/${res.data.data.id}`)
        },
        onError: () => toast({ title: 'Failed to create team', variant: 'destructive' }),
      }
    )
  }

  if (isLoading) return <ProjectDetailSkeleton />
  if (isError || !project) return (
    <ErrorState title="Project not found" message="This project doesn't exist or has been removed." />
  )

  const teams = project.teams ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: 'Explore', href: '/dashboard/projects/explore' },
          { label: project.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left sidebar */}
        <aside className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1 space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {project.overview ?? project.description ?? 'No overview provided.'}
            </CardContent>
          </Card>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <TechnologyBadge key={t.technology.id} name={t.technology.name} icon={t.technology.icon} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Learning Outcomes */}
          {project.learningOutcomes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Learning Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.learningOutcomes}
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {project.requirements && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" /> Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.requirements}
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(project.githubRepository || project.liveDemo || project.documentationUrl) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" /> Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.githubRepository && (
                  <a href={project.githubRepository} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <GitBranch className="h-4 w-4" /> GitHub Repository
                  </a>
                )}
                {project.liveDemo && (
                  <a href={project.liveDemo} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
                {project.documentationUrl && (
                  <a href={project.documentationUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <BookOpen className="h-4 w-4" /> Documentation
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Center content */}
        <div className="order-1 lg:order-2 lg:col-start-1 lg:row-start-1 space-y-6" style={{ gridColumn: '1', gridRow: '1' }}>
          {/* Thumbnail */}
          {project.thumbnail && (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {project.description ?? 'No description provided.'}
            </CardContent>
          </Card>

          {/* Milestones */}
          <section aria-labelledby="project-milestones">
            <h2 id="project-milestones" className="text-base font-semibold mb-3">Milestones</h2>
            {mlLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : milestones?.data && milestones.data.length > 0 ? (
              <div className="space-y-3">
                {milestones.data.map((m) => <MilestoneCard key={m.id} milestone={m} />)}
              </div>
            ) : (
              <EmptyState icon={<CheckSquare className="h-8 w-8" />} title="No milestones" className="py-8" />
            )}
          </section>

          {/* Teams */}
          <section aria-labelledby="project-teams">
            <div className="flex items-center justify-between mb-3">
              <h2 id="project-teams" className="text-base font-semibold">Teams</h2>
              {user && !userTeamForProject && (
                <Button size="sm" className="gap-1.5" onClick={() => setShowCreateTeam(true)}>
                  <Plus className="h-4 w-4" /> Create Team
                </Button>
              )}
              {userTeamForProject && (
                <Button size="sm" variant="outline" className="gap-1.5" asChild>
                  <Link to={`/dashboard/projects/team/${userTeamForProject.id}`}>
                    My Team <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((team) => <TeamCard key={team.id} team={team} />)}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="No teams yet"
                description="Be the first to create a team for this project."
                action={user ? { label: 'Create Team', onClick: () => setShowCreateTeam(true) } : undefined}
                className="py-8"
              />
            )}
          </section>
        </div>

        {/* Right sticky panel */}
        <aside className="order-3 space-y-4">
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-5 space-y-4">
              <DifficultyBadge difficulty={project.difficulty} />

              {project.estimatedDuration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{project.estimatedDuration}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{project._count?.teams ?? teams.length} team{(project._count?.teams ?? teams.length) !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FolderKanban className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="capitalize">{project.category?.name}</span>
              </div>

              {/* Progress - based on milestones */}
              {milestones?.data && milestones.data.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Project Progress</span>
                    <span className="font-medium">
                      {Math.round(
                        milestones.data.reduce((acc, m) => acc + m.completionPercentage, 0) /
                        milestones.data.length
                      )}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          milestones.data.reduce((acc, m) => acc + m.completionPercentage, 0) /
                          milestones.data.length
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!userTeamForProject ? (
                <Button className="w-full gap-1.5" onClick={() => setShowCreateTeam(true)} disabled={!user}>
                  <Plus className="h-4 w-4" />
                  {user ? 'Join / Create Team' : 'Login to Join'}
                </Button>
              ) : (
                <Button className="w-full gap-1.5" variant="secondary" asChild>
                  <Link to={`/dashboard/projects/team/${userTeamForProject.id}`}>
                    Open My Team <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="team-name" className="block text-sm font-medium mb-1.5">Team Name</label>
              <input
                id="team-name"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Code Wizards"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={60}
              />
            </div>
            <div>
              <label htmlFor="max-members" className="block text-sm font-medium mb-1.5">Max Members (2–10)</label>
              <input
                id="max-members"
                type="number"
                min={2}
                max={10}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} loading={creating} disabled={!teamName.trim()}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}
