/**
 * FPRD-20 — Dashboard UI Revamp (Professional Dashboard)
 *
 * Data flow (real backend data, no hardcoded values):
 *  - Greeting          → authStore.user
 *  - XP                → learningStats.totalLessonsCompleted + codingStats.totalSolved
 *  - Leaderboard       → GET /api/leaderboard
 *  - Daily Tasks       → GET /api/dashboard/daily-tasks (falls back to /coding/daily + /learning/continue)
 *  - Activity Heatmap  → GET /api/dashboard/activity (falls back to /analytics/heatmap)
 *  - Statistics:
 *      Learning Streak → GET /learning/stats  (currentStreak)
 *      Problems Solved → GET /coding/analytics (totalSolved / easySolved / mediumSolved / hardSolved)
 *  - Learning Progress:
 *      Learning card   → GET /learning/continue (roadmap title + progress %)
 *      Coding card     → GET /coding/analytics  (totalSolved + currentStreak)
 */

import { motion } from 'framer-motion'
import { WidgetErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'
import { useLearningStats } from '@/shared/hooks/useLearning'
import { useCodingAnalytics } from '@/shared/hooks/useCoding'
import { useDailyChallenge } from '@/shared/hooks/useCoding'
import { useContinueLearning } from '@/shared/hooks/useLearning'
import { useLeaderboard, useDailyTasks, useDashboardActivity } from '@/shared/hooks/useDashboard'

import { GreetingCard }          from '../components/GreetingCard'
import { XpCard }                from '../components/XpCard'
import { LeaderboardCard }       from '../components/LeaderboardCard'
import { DailyTasksCard }        from '../components/DailyTasksCard'
import { ActivityHeatmap }       from '../components/ActivityHeatmap'
import { ActivityCalendar }      from '../components/ActivityCalendar'
import { StatisticsCards }       from '../components/StatisticsCards'
import { LearningProgressCards } from '../components/LearningProgressCards'
import { QuickAccessCards }      from '../components/QuickAccessCards'
import { DashboardSearchBar }    from '../components/DashboardSearchBar'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  )
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function DashboardPage() {
  // ── Real data hooks ───────────────────────────────────────────────────────
  const { data: learningStats,   isLoading: learningStatsLoading   } = useLearningStats()
  const { data: codingStats,     isLoading: codingStatsLoading      } = useCodingAnalytics()
  const { data: continueLearning                                    } = useContinueLearning()
  const { data: dailyChallenge                                      } = useDailyChallenge()
  const { data: leaderboard,     isLoading: leaderboardLoading      } = useLeaderboard()
  const { data: dailyTasks,      isLoading: dailyTasksLoading       } = useDailyTasks()
  const { data: activityData,    isLoading: activityLoading         } = useDashboardActivity()

  // Combined loading state for stats/progress rows
  const statsLoading = learningStatsLoading || codingStatsLoading

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <DashboardSearchBar />
      </div>

      {/* ── ROW 1: Greeting | XP | Leaderboard | Daily Tasks ─────────────── */}
      <section aria-label="Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <WidgetErrorBoundary label="Greeting">
              <GreetingCard />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <WidgetErrorBoundary label="XP Score">
              <XpCard
                learningStats={learningStats}
                codingStats={codingStats}
                isLoading={statsLoading}
              />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <WidgetErrorBoundary label="Leaderboard">
              <LeaderboardCard data={leaderboard} isLoading={leaderboardLoading} />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-3">
            <WidgetErrorBoundary label="Daily Tasks">
              <DailyTasksCard
                data={dailyTasks}
                dailyChallenge={dailyChallenge as any}
                continueLearning={continueLearning as any}
                isLoading={dailyTasksLoading}
              />
            </WidgetErrorBoundary>
          </div>
        </div>
      </section>

      {/* ── ROW 2: Heatmap | Calendar ─────────────────────────────────────── */}
      <section aria-label="Activity">
        <div className="mb-3"><SectionLabel>Activity</SectionLabel></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <WidgetErrorBoundary label="Activity Heatmap">
              <ActivityHeatmap data={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-4">
            <WidgetErrorBoundary label="Calendar">
              <ActivityCalendar activityData={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </div>
        </div>
      </section>

      {/* ── ROW 3: Statistics ─────────────────────────────────────────────── */}
      <section aria-label="Statistics">
        <div className="mb-3"><SectionLabel>Statistics</SectionLabel></div>
        <WidgetErrorBoundary label="Statistics">
          {/* Pass the correct sources:
              - learningStats → currentStreak (from /learning/stats)
              - codingStats   → totalSolved / easySolved / mediumSolved / hardSolved (from /coding/analytics) */}
          <StatisticsCards
            learningStats={learningStats}
            codingStats={codingStats}
            isLoading={statsLoading}
          />
        </WidgetErrorBoundary>
      </section>

      {/* ── ROW 4: Learning Progress ───────────────────────────────────────── */}
      <section aria-label="Learning progress">
        <div className="mb-3"><SectionLabel>Learning Progress</SectionLabel></div>
        <WidgetErrorBoundary label="Learning Progress">
          {/* Learning card: continueLearning gives roadmap title + progress %
              Coding card:   codingStats gives totalSolved + currentStreak */}
          <LearningProgressCards
            learningStats={learningStats}
            codingStats={codingStats}
            continueLearning={continueLearning as any}
            isLoading={statsLoading}
          />
        </WidgetErrorBoundary>
      </section>

      {/* ── ROW 5: Quick Access ────────────────────────────────────────────── */}
      <section aria-label="Quick access">
        <div className="mb-3"><SectionLabel>Quick Access</SectionLabel></div>
        <WidgetErrorBoundary label="Quick Access">
          <QuickAccessCards />
        </WidgetErrorBoundary>
      </section>
    </motion.div>
  )
}
