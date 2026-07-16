import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Building2, FileText, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DashboardStatCard } from '@/student/components/placement/DashboardStatCard'
import { JobCard } from '@/student/components/placement/JobCard'
import { JobCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { usePlacementStats, useRecommendedJobs, useApplications } from '@/shared/hooks/usePlacement'

export function PlacementDashboardPage() {
  const { data: stats, isLoading: statsLoading } = usePlacementStats()
  const { data: recommended, isLoading: jobsLoading } = useRecommendedJobs(4)
  const { data: applications, isLoading: appsLoading } = useApplications({ limit: 5 })

  const statCards = [
    { title: 'Applications Sent', value: stats?.applicationsSent ?? 0, icon: Briefcase, colorClass: 'text-primary' },
    { title: 'Interviews', value: stats?.interviewsScheduled ?? 0, icon: Target, colorClass: 'text-warning' },
    { title: 'Offers Received', value: stats?.offersReceived ?? 0, icon: CheckCircle, colorClass: 'text-success' },
    { title: 'Resume Score', value: stats ? `${stats.resumeScore}%` : '—', icon: FileText, colorClass: 'text-secondary' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Dashboard"
        description="Track your placement journey and job applications"
        breadcrumbs={[{ label: 'Placement' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/resume">Build Resume</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/dashboard/placement/jobs">Browse Jobs</Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5 space-y-2">
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent></Card>
            ))
          : statCards.map((s, i) => <DashboardStatCard key={s.title} {...s} index={i} />)
        }
      </div>

      {/* Profile Completion */}
      {stats && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">Profile Completion</p>
              <span className="text-sm font-bold text-primary">{stats.profileCompletion}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.profileCompletion}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {stats.profileCompletion < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to improve visibility to recruiters.{' '}
                <Link to="/dashboard/profile/edit" className="text-primary hover:underline">Complete now →</Link>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recommended Jobs</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/placement/jobs">View all →</Link>
            </Button>
          </div>
          {jobsLoading
            ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            : recommended && recommended.length > 0
              ? recommended.map((job) => <JobCard key={job.id} job={job} />)
              : <EmptyState icon={<Briefcase className="h-10 w-10" />} title="No recommendations yet" description="Complete your profile to get personalized job recommendations." />
          }
        </div>

        {/* Recent Applications + Deadlines */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Applications
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/placement/applications">All →</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {appsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-9 w-9 bg-muted rounded animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                : applications?.data && applications.data.length > 0
                  ? applications.data.map((app) => (
                      <div key={app.id} className="flex items-center gap-3 py-1">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{app.job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.job.company.name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                          {app.status}
                        </Badge>
                      </div>
                    ))
                  : <p className="text-sm text-muted-foreground text-center py-4">No applications yet</p>
              }
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { label: 'Browse Companies', href: '/dashboard/placement/companies', icon: Building2 },
                { label: 'Track Applications', href: '/dashboard/placement/applications', icon: TrendingUp },
                { label: 'Update Resume', href: '/dashboard/resume', icon: FileText },
                { label: 'Upcoming Events', href: '/dashboard/events', icon: Clock },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} to={href} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 text-sm transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
