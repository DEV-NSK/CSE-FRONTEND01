/**
 * FPRD-20 — Dashboard UI Revamp (Professional Dashboard)
 * All data from real APIs. No hardcoded values.
 *
 * Equal-height rows:
 *   - Grid uses items-stretch on every row
 *   - Each cell is `flex flex-col`
 *   - WidgetErrorBoundary renders `contents` so it doesn't break flex chain
 *   - Each card has h-full w-full
 */

import { motion } from 'framer-motion'
import { WidgetErrorBoundary }   from '@/shared/components/feedback/ErrorBoundary'
import { useLearningStats, useContinueLearning } from '@/shared/hooks/useLearning'
import { useCodingAnalytics, useDailyChallenge } from '@/shared/hooks/useCoding'
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

// Reusable cell wrapper — flex col so h-full propagates to the card inside
function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {children}
    </div>
  )
}

export function DashboardPage() {
  const { data: learningStats,   isLoading: learningStatsLoading } = useLearningStats()
  const { data: codingAnalytics, isLoading: codingStatsLoading   } = useCodingAnalytics()
  const { data: continueLearning                                  } = useContinueLearning()
  const { data: dailyChallenge                                    } = useDailyChallenge()
  const { data: leaderboard,     isLoading: leaderboardLoading    } = useLeaderboard()
  const { data: dailyTasks,      isLoading: dailyTasksLoading     } = useDailyTasks()
  const { data: activityData,    isLoading: activityLoading       } = useDashboardActivity()

  const statsLoading = learningStatsLoading || codingStatsLoading

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-8"
    >
      {/* ── Search ───────────────────────────────────────────────────────── */}
      <DashboardSearchBar />

      {/* ── ROW 1: Greeting | XP | Leaderboard | Daily Tasks ─────────────
           items-stretch makes all 4 cells equal height.
           Each Cell is flex-col so the card's h-full fills it.            */}
      <section aria-label="Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
          <Cell className="lg:col-span-5">
            <WidgetErrorBoundary label="Greeting">
              <GreetingCard />
            </WidgetErrorBoundary>
          </Cell>
          <Cell className="lg:col-span-2">
            <WidgetErrorBoundary label="XP Score">
              <XpCard
                learningStats={learningStats}
                codingAnalytics={codingAnalytics}
                isLoading={statsLoading}
              />
            </WidgetErrorBoundary>
          </Cell>
          <Cell className="lg:col-span-2">
            <WidgetErrorBoundary label="Leaderboard">
              <LeaderboardCard data={leaderboard} isLoading={leaderboardLoading} />
            </WidgetErrorBoundary>
          </Cell>
          <Cell className="lg:col-span-3">
            <WidgetErrorBoundary label="Daily Tasks">
              <DailyTasksCard
                data={dailyTasks}
                dailyChallenge={dailyChallenge as any}
                continueLearning={continueLearning as any}
                isLoading={dailyTasksLoading}
              />
            </WidgetErrorBoundary>
          </Cell>
        </div>
      </section>

      {/* ── ROW 2: Activity Heatmap | Calendar ────────────────────────────
           Both cards now share exactly the same height.                   */}
      <section aria-label="Activity">
        <div className="mb-3"><SectionLabel>Activity</SectionLabel></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <Cell className="lg:col-span-8">
            <WidgetErrorBoundary label="Activity Heatmap">
              <ActivityHeatmap data={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </Cell>
          <Cell className="lg:col-span-4">
            <WidgetErrorBoundary label="Calendar">
              <ActivityCalendar activityData={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </Cell>
        </div>
      </section>

      {/* ── ROW 3: Statistics ─────────────────────────────────────────────── */}
      <section aria-label="Statistics">
        <div className="mb-3"><SectionLabel>Statistics</SectionLabel></div>
        <WidgetErrorBoundary label="Statistics">
          <StatisticsCards
            learningStats={learningStats}
            codingAnalytics={codingAnalytics}
            isLoading={statsLoading}
          />
        </WidgetErrorBoundary>
      </section>

      {/* ── ROW 4: Learning Progress ───────────────────────────────────────── */}
      <section aria-label="Learning progress">
        <div className="mb-3"><SectionLabel>Learning Progress</SectionLabel></div>
        <WidgetErrorBoundary label="Learning Progress">
          <LearningProgressCards
            learningStats={learningStats}
            codingAnalytics={codingAnalytics}
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
