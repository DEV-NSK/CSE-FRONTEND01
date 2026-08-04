/**
 * FPRD-20 — Dashboard UI Revamp
 * Professional developer-platform dashboard.
 * Layout: Greeting | XP | Leaderboard | Daily Tasks
 *         Activity Heatmap | Calendar
 *         Statistics Cards
 *         Learning Progress Cards
 *         Quick Access Cards
 *
 * Rules:
 *  - No backend API modifications.
 *  - No hardcoded values — all data from real APIs.
 *  - Dark theme (#070B17 bg, #0F1629 cards).
 *  - Glass cards, rounded-[18px], soft shadows.
 *  - Framer Motion 200 ms transitions, subtle, no flash.
 */

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { WidgetErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'
import { useOverallAnalytics } from '@/shared/hooks/useAnalytics'
import { useDailyChallenge } from '@/shared/hooks/useCoding'
import { useContinueLearning } from '@/shared/hooks/useLearning'
import { useLeaderboard, useDailyTasks, useDashboardActivity } from '@/shared/hooks/useDashboard'

import { GreetingCard } from '../components/GreetingCard'
import { XpCard } from '../components/XpCard'
import { LeaderboardCard } from '../components/LeaderboardCard'
import { DailyTasksCard } from '../components/DailyTasksCard'
import { ActivityHeatmap } from '../components/ActivityHeatmap'
import { ActivityCalendar } from '../components/ActivityCalendar'
import { StatisticsCards } from '../components/StatisticsCards'
import { LearningProgressCards } from '../components/LearningProgressCards'
import { QuickAccessCards } from '../components/QuickAccessCards'
import { DashboardSearchBar } from '../components/DashboardSearchBar'

// Section label — keeps consistent typography
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: 'rgba(255,255,255,0.35)' }}
    >
      {children}
    </h2>
  )
}

// Stagger container
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function DashboardPage() {
  // ── Data hooks ────────────────────────────────────────────────────────────
  const { data: analytics, isLoading: analyticsLoading } = useOverallAnalytics()
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard()
  const { data: dailyTasks, isLoading: dailyTasksLoading } = useDailyTasks()
  const { data: dailyChallenge } = useDailyChallenge()
  const { data: continueLearning } = useContinueLearning()
  const { data: activityData, isLoading: activityLoading } = useDashboardActivity()

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
      style={{ minHeight: '100vh' }}
    >
      {/* ── TOP BAR: Search ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <DashboardSearchBar />
      </div>

      {/* ── ROW 1: Greeting | XP | Leaderboard | Daily Tasks ─────────────── */}
      <section aria-label="Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Greeting — spans 5 cols on lg */}
          <div className="lg:col-span-5">
            <WidgetErrorBoundary label="Greeting">
              <GreetingCard />
            </WidgetErrorBoundary>
          </div>

          {/* XP — spans 2 cols on lg */}
          <div className="lg:col-span-2">
            <WidgetErrorBoundary label="XP Score">
              <XpCard analytics={analytics} isLoading={analyticsLoading} />
            </WidgetErrorBoundary>
          </div>

          {/* Leaderboard — spans 2 cols on lg */}
          <div className="lg:col-span-2">
            <WidgetErrorBoundary label="Leaderboard">
              <LeaderboardCard data={leaderboard} isLoading={leaderboardLoading} />
            </WidgetErrorBoundary>
          </div>

          {/* Daily Tasks — spans 3 cols on lg */}
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

      {/* ── ROW 2: Activity Heatmap | Calendar ───────────────────────────── */}
      <section aria-label="Activity">
        <div className="mb-3">
          <SectionLabel>Activity</SectionLabel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Heatmap — 8 cols */}
          <div className="lg:col-span-8">
            <WidgetErrorBoundary label="Activity Heatmap">
              <ActivityHeatmap data={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </div>
          {/* Calendar — 4 cols */}
          <div className="lg:col-span-4">
            <WidgetErrorBoundary label="Calendar">
              <ActivityCalendar activityData={activityData} isLoading={activityLoading} />
            </WidgetErrorBoundary>
          </div>
        </div>
      </section>

      {/* ── ROW 3: Statistics Cards ───────────────────────────────────────── */}
      <section aria-label="Statistics">
        <div className="mb-3">
          <SectionLabel>Statistics</SectionLabel>
        </div>
        <WidgetErrorBoundary label="Statistics">
          <StatisticsCards analytics={analytics} isLoading={analyticsLoading} />
        </WidgetErrorBoundary>
      </section>

      {/* ── ROW 4: Learning Progress Cards ───────────────────────────────── */}
      <section aria-label="Learning progress">
        <div className="mb-3">
          <SectionLabel>Learning Progress</SectionLabel>
        </div>
        <WidgetErrorBoundary label="Learning Progress">
          <LearningProgressCards
            analytics={analytics}
            continueLearning={continueLearning as any}
            isLoading={analyticsLoading}
          />
        </WidgetErrorBoundary>
      </section>

      {/* ── ROW 5: Quick Access Cards ─────────────────────────────────────── */}
      <section aria-label="Quick access">
        <div className="mb-3">
          <SectionLabel>Quick Access</SectionLabel>
        </div>
        <WidgetErrorBoundary label="Quick Access">
          <QuickAccessCards />
        </WidgetErrorBoundary>
      </section>
    </motion.div>
  )
}
