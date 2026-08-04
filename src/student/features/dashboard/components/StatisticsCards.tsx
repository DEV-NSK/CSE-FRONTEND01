import { memo } from 'react'
import { motion } from 'framer-motion'
import type { LearningStats } from '@/shared/types/learning'
import type { CodingAnalyticsSummary } from '@/shared/types/analytics'

// ── Streak Card ───────────────────────────────────────────────────────────────
function StreakCard({ streak, isLoading }: { streak: number; isLoading?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.28 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 bg-card border border-border shadow-sm"
      role="region"
      aria-label="Learning Streak"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🔥</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Learning Streak
        </span>
      </div>
      {isLoading ? (
        <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
      ) : (
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-extrabold tabular-nums leading-none text-foreground">
            {streak}
          </span>
          <span className="text-xs font-medium pb-0.5 text-yellow-500">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── Problems Solved Card ──────────────────────────────────────────────────────
interface ProblemsBreakdownProps {
  easy: number
  medium: number
  hard: number
  total: number
  isLoading?: boolean
}

function ProblemsBreakdown({ easy, medium, hard, total, isLoading }: ProblemsBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.32 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 bg-card border border-border shadow-sm"
      role="region"
      aria-label="Problems solved breakdown"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">💻</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Problems Solved
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-9 w-16 rounded-lg bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums leading-none text-foreground">
              {total}
            </span>
            <span className="text-xs font-medium pb-0.5 text-muted-foreground">
              total
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              { label: 'Easy', count: easy, color: 'bg-green-500', textColor: 'text-green-500' },
              { label: 'Medium', count: medium, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
              { label: 'Hard', count: hard, color: 'bg-red-500', textColor: 'text-red-500' },
            ].map(({ label, count, color, textColor }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] w-12 shrink-0 text-muted-foreground">
                    {label}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${count} problems`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.42 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                  <span className={`text-[10px] w-5 text-right tabular-nums font-semibold ${textColor}`}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Coming Soon Card ──────────────────────────────────────────────────────────
function ComingSoonCard({ icon, label, delay = 0 }: { icon: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[18px] p-5 flex flex-col items-center justify-center gap-2 bg-muted/40 border border-border/50"
      role="region"
      aria-label={`${label} — coming soon`}
    >
      <span className="text-2xl opacity-40" aria-hidden="true">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
      <span className="text-xs font-medium text-muted-foreground/50 flex items-center gap-1">
        🚧 Coming Soon
      </span>
    </motion.div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
interface StatisticsCardsProps {
  learningStats?: LearningStats
  codingStats?: CodingAnalyticsSummary
  isLoading?: boolean
}

export const StatisticsCards = memo(function StatisticsCards({
  learningStats,
  codingStats,
  isLoading,
}: StatisticsCardsProps) {
  const streak = learningStats?.currentStreak ?? 0

  // codingStats from /coding/analytics
  const easy = codingStats?.easySolved ?? 0
  const medium = codingStats?.mediumSolved ?? 0
  const hard = codingStats?.hardSolved ?? 0
  const total = codingStats?.totalSolved ?? 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StreakCard streak={streak} isLoading={isLoading} />
      <ProblemsBreakdown
        easy={easy}
        medium={medium}
        hard={hard}
        total={total}
        isLoading={isLoading}
      />
      <ComingSoonCard icon="📁" label="Projects" delay={0.36} />
      <ComingSoonCard icon="🏢" label="Placement" delay={0.4} />
    </div>
  )
})
