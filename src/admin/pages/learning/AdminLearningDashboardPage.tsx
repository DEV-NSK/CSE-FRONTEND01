import {
  BookOpen, FileText, Users, CheckCircle, Clock,
  TrendingUp, Layers, Award, RefreshCw,
} from 'lucide-react'
import { AnalyticsCard } from '@/admin/components/AnalyticsCard'
import { useAdminLearningDashboard } from '@/shared/hooks/useAdminLearning'
import { timeAgo } from '@/shared/lib/time'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { AlertCircle } from 'lucide-react'

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-300 flex-1">Failed to load learning dashboard data.</p>
      <button
        onClick={onRetry}
        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  )
}

export default function AdminLearningDashboardPage() {
  const { data: stats, isLoading, error, refetch, dataUpdatedAt } = useAdminLearningDashboard()

  const lastUpdated = dataUpdatedAt
    ? timeAgo(new Date(dataUpdatedAt).toISOString())
    : null

  return (
    <div className="space-y-6 text-slate-200" role="main" aria-label="Learning CMS Dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Learning CMS</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Content publishing dashboard
            {lastUpdated && <span className="ml-2 text-slate-600">· Updated {lastUpdated}</span>}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Refresh learning dashboard"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && <ErrorCard onRetry={refetch} />}

      {isLoading ? (
        <SectionSkeleton />
      ) : stats && (
        <>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Content Overview
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnalyticsCard
                title="Total Levels"
                value={stats.totalLevels.toString()}
                icon={Layers}
                changeType="neutral"
              />
              <AnalyticsCard
                title="Total Learning Days"
                value={stats.totalLearningDays.toLocaleString()}
                icon={BookOpen}
                changeType="neutral"
              />
              <AnalyticsCard
                title="Published"
                value={stats.publishedCount.toString()}
                sub={`${stats.totalLearningDays > 0 ? Math.round((stats.publishedCount / stats.totalLearningDays) * 100) : 0}% of total`}
                icon={CheckCircle}
                changeType="up"
              />
              <AnalyticsCard
                title="Drafts"
                value={stats.draftsCount.toString()}
                icon={FileText}
                changeType="neutral"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Status Breakdown
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnalyticsCard
                title="Unpublished"
                value={stats.unpublishedCount.toString()}
                icon={Clock}
                changeType="down"
              />
              <AnalyticsCard
                title="Archived"
                value={stats.archivedCount.toString()}
                icon={FileText}
                changeType="neutral"
              />
              <AnalyticsCard
                title="Completion Rate"
                value={`${stats.completionRate.toFixed(1)}%`}
                sub={`${stats.totalCompletedLessons.toLocaleString()} lessons completed`}
                icon={TrendingUp}
                changeType="up"
              />
              <AnalyticsCard
                title="Current Active Day"
                value={stats.currentActiveDay ? `Day ${stats.currentActiveDay.dayNumber}` : '—'}
                sub={stats.currentActiveDay ? `L${stats.currentActiveDay.levelNumber} · ${stats.currentActiveDay.topicName}` : 'No published content'}
                icon={Award}
                changeType="up"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Student Engagement
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnalyticsCard
                title="Students Started"
                value={stats.studentsStarted.toLocaleString()}
                icon={Users}
                changeType="up"
              />
              <AnalyticsCard
                title="Students Completed"
                value={stats.studentsCompleted.toLocaleString()}
                sub={`${stats.studentsStarted > 0 ? Math.round((stats.studentsCompleted / stats.studentsStarted) * 100) : 0}% completion`}
                icon={CheckCircle}
                changeType="up"
              />
            </div>
          </div>

          {stats.levelBreakdown.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Level Progress
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                {stats.levelBreakdown.map((lvl) => {
                  const pct = lvl.totalDays > 0 ? Math.round((lvl.publishedDays / lvl.totalDays) * 100) : 0
                  return (
                    <div key={lvl.levelNumber} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          Level {lvl.levelNumber.toString().padStart(2, '0')} — {lvl.title}
                        </span>
                        <span className="text-slate-500">
                          {lvl.publishedDays}/{lvl.totalDays} published · {lvl.studentsStarted} started · {lvl.studentsCompleted} completed
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
