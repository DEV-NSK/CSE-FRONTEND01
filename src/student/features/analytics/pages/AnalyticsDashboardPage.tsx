import { useState } from 'react'
import { BarChart3, BookOpen, Code2, FolderKanban, Briefcase, Flame, Target, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DashboardStatCard } from '@/student/components/placement/DashboardStatCard'
import { AnalyticsChartCard } from '@/student/components/placement/AnalyticsChartCard'
import { ActivityHeatmap } from '@/student/components/placement/ActivityHeatmap'
import { AnalyticsSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { useOverallAnalytics, useHeatmap } from '@/shared/hooks/useAnalytics'

export function AnalyticsDashboardPage() {
  const { data, isLoading } = useOverallAnalytics()
  const { data: heatmap } = useHeatmap()
  const [year] = useState(new Date().getFullYear())

  if (isLoading) return (
    <div className="space-y-5">
      <PageHeader title="Analytics" breadcrumbs={[{ label: 'Analytics' }]} />
      <AnalyticsSkeleton />
    </div>
  )

  const learning = data?.learning
  const coding = data?.coding
  const projects = data?.projects
  const placement = data?.placement

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Track your progress across all activities"
        breadcrumbs={[{ label: 'Analytics' }]}
      />

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard title="Problems Solved" value={coding?.totalSolved ?? 0} icon={Code2} colorClass="text-primary" index={0} />
        <DashboardStatCard title="Current Streak" value={`${coding?.currentStreak ?? 0}d`} icon={Flame} colorClass="text-warning" index={1} />
        <DashboardStatCard title="Study Hours" value={learning?.studyTimeHours ?? 0} icon={Clock} colorClass="text-secondary" index={2} />
        <DashboardStatCard title="Applications" value={placement?.totalApplications ?? 0} icon={Briefcase} colorClass="text-success" index={3} />
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity Heatmap — {year}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ActivityHeatmap data={heatmap ?? []} year={year} />
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <Tabs defaultValue="learning">
        <TabsList>
          <TabsTrigger value="learning" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Learning</TabsTrigger>
          <TabsTrigger value="coding" className="gap-1.5"><Code2 className="h-3.5 w-3.5" />Coding</TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5"><FolderKanban className="h-3.5 w-3.5" />Projects</TabsTrigger>
          <TabsTrigger value="placement" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" />Placement</TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatCard title="Completed" value={learning?.totalCompleted ?? 0} icon={BookOpen} colorClass="text-primary" index={0} />
            <DashboardStatCard title="Roadmaps" value={learning?.totalRoadmaps ?? 0} icon={Target} colorClass="text-secondary" index={1} />
            <DashboardStatCard title="Study Hours" value={learning?.studyTimeHours ?? 0} icon={Clock} colorClass="text-warning" index={2} />
            <DashboardStatCard title="Streak" value={`${learning?.currentStreak ?? 0}d`} icon={Flame} colorClass="text-success" index={3} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChartCard title="Weekly Study Time" type="bar" data={learning?.weeklyStudyTime ?? []} dataKeys={[{ key: 'hours', name: 'Hours', color: '#6366f1' }]} xKey="day" />
            <AnalyticsChartCard title="Monthly Progress" type="area" data={learning?.monthlyActivity ?? []} dataKeys={[{ key: 'hours', name: 'Hours', color: '#22c55e' }]} xKey="month" />
          </div>
        </TabsContent>

        <TabsContent value="coding" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatCard title="Total Solved" value={coding?.totalSolved ?? 0} icon={Code2} colorClass="text-primary" index={0} />
            <DashboardStatCard title="Easy" value={coding?.easySolved ?? 0} icon={TrendingUp} colorClass="text-success" index={1} />
            <DashboardStatCard title="Medium" value={coding?.mediumSolved ?? 0} icon={TrendingUp} colorClass="text-warning" index={2} />
            <DashboardStatCard title="Hard" value={coding?.hardSolved ?? 0} icon={TrendingUp} colorClass="text-destructive" index={3} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChartCard title="Difficulty Distribution" type="pie"
              data={(coding?.difficultyDistribution ?? []).map((d) => ({ name: d.difficulty, value: d.solved }))}
              dataKeys={[{ key: 'value', name: 'Solved' }]} />
            <AnalyticsChartCard title="Language Usage" type="bar"
              data={(coding?.languageDistribution ?? []).map((d) => ({ name: d.language, count: d.count }))}
              dataKeys={[{ key: 'count', name: 'Problems', color: '#6366f1' }]} xKey="name" />
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardStatCard title="Total Projects" value={projects?.totalProjects ?? 0} icon={FolderKanban} colorClass="text-primary" index={0} />
            <DashboardStatCard title="Completed Tasks" value={projects?.completedTasks ?? 0} icon={Target} colorClass="text-success" index={1} />
            <DashboardStatCard title="Open Tasks" value={projects?.openTasks ?? 0} icon={BarChart3} colorClass="text-warning" index={2} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChartCard title="Task Progress Over Time" type="line"
              data={projects?.taskProgress ?? []}
              dataKeys={[{ key: 'completed', name: 'Completed', color: '#22c55e' }, { key: 'opened', name: 'Opened', color: '#6366f1' }]}
              xKey="week" />
            <AnalyticsChartCard title="Team Contributions" type="bar"
              data={(projects?.teamContributions ?? []).map((c) => ({ name: c.member, tasks: c.tasks }))}
              dataKeys={[{ key: 'tasks', name: 'Tasks', color: '#8b5cf6' }]} xKey="name" />
          </div>
        </TabsContent>

        <TabsContent value="placement" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <DashboardStatCard title="Applications" value={placement?.totalApplications ?? 0} icon={Briefcase} colorClass="text-primary" index={0} />
            <DashboardStatCard title="Interviews" value={placement?.interviews ?? 0} icon={Target} colorClass="text-warning" index={1} />
            <DashboardStatCard title="Offers" value={placement?.offers ?? 0} icon={TrendingUp} colorClass="text-success" index={2} />
            <DashboardStatCard title="Rejections" value={placement?.rejections ?? 0} icon={BarChart3} colorClass="text-destructive" index={3} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChartCard title="Placement Pipeline" type="pie"
              data={(placement?.pipelineData ?? []).map((p) => ({ name: p.status, value: p.count }))}
              dataKeys={[{ key: 'value', name: 'Count' }]} />
            <AnalyticsChartCard title="Monthly Applications" type="area"
              data={placement?.monthlyApplications ?? []}
              dataKeys={[{ key: 'applications', name: 'Applications', color: '#6366f1' }, { key: 'interviews', name: 'Interviews', color: '#f59e0b' }]}
              xKey="month" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
