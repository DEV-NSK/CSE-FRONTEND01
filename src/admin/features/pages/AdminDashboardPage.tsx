import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, Code2, FolderKanban, Briefcase, Calendar, BarChart3, Settings, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DashboardStatCard } from '@/shared/components/placement/DashboardStatCard'
import { AnalyticsSkeleton } from '@/shared/components/placement/PlacementSkeletons'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { useAdminStats } from '@/shared/hooks/useAdmin'
import { useAuthStore } from '@/shared/store/authStore'
import { Navigate } from 'react-router-dom'

const mgmtLinks = [
  { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users, desc: 'View, edit, and manage all users' },
  { href: '/dashboard/admin/roadmaps', label: 'Manage Roadmaps', icon: BookOpen, desc: 'Create and update learning roadmaps' },
  { href: '/dashboard/admin/problems', label: 'Manage Problems', icon: Code2, desc: 'Add and edit coding problems' },
  { href: '/dashboard/admin/projects', label: 'Manage Projects', icon: FolderKanban, desc: 'Oversee project submissions' },
  { href: '/dashboard/admin/jobs', label: 'Manage Jobs', icon: Briefcase, desc: 'Post and update job listings' },
  { href: '/dashboard/admin/events', label: 'Manage Events', icon: Calendar, desc: 'Create and manage events' },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: BarChart3, desc: 'Platform analytics and reports' },
  { href: '/dashboard/admin/settings', label: 'Platform Settings', icon: Settings, desc: 'Configure platform settings' },
]

export function AdminDashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading, isError, refetch } = useAdminStats()

  if (user?.role !== 'admin') return <Navigate to="/403" replace />

  if (isLoading) return (
    <div className="space-y-5">
      <PageHeader title="Admin Dashboard" breadcrumbs={[{ label: 'Admin' }]} />
      <AnalyticsSkeleton />
    </div>
  )
  if (isError) return <ErrorState title="Failed to load admin stats" onRetry={refetch} />

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, colorClass: 'text-primary' },
    { title: 'Roadmaps', value: stats?.totalRoadmaps ?? 0, icon: BookOpen, colorClass: 'text-secondary' },
    { title: 'Coding Problems', value: stats?.totalProblems ?? 0, icon: Code2, colorClass: 'text-warning' },
    { title: 'Active Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, colorClass: 'text-success' },
    { title: 'Teams', value: stats?.totalTeams ?? 0, icon: Users, colorClass: 'text-info' },
    { title: 'Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase, colorClass: 'text-primary' },
    { title: 'Events', value: stats?.totalEvents ?? 0, icon: Calendar, colorClass: 'text-warning' },
    { title: 'New This Month', value: stats?.newUsersThisMonth ?? 0, icon: Users, colorClass: 'text-success' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage and monitor the CSE Student Platform"
        breadcrumbs={[{ label: 'Admin' }]}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
            <Shield className="h-4 w-4" />Admin Mode
          </div>
        }
      />

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <DashboardStatCard key={s.title} {...s} index={i} />)}
      </div>

      {/* Active Today */}
      {stats?.activeUsersToday !== undefined && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <p className="text-sm"><span className="font-semibold text-foreground">{stats.activeUsersToday}</span> <span className="text-muted-foreground">users active today</span></p>
          </CardContent>
        </Card>
      )}

      {/* Management Links */}
      <div>
        <h2 className="font-semibold text-foreground mb-4">Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mgmtLinks.map((link, i) => {
            const Icon = link.icon
            return (
              <motion.div key={link.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={link.href}>
                  <Card className="hover:border-primary/50 hover:shadow-sm transition-all h-full">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="p-2.5 rounded-lg bg-muted w-fit">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{link.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
