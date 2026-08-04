import { memo } from 'react'
import { motion } from 'framer-motion'
import type { OverallAnalytics } from '@/shared/types/analytics'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
  delay?: number
  comingSoon?: boolean
}

function StatCard({ icon, label, value, sub, color, delay = 0, comingSoon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[18px] p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: comingSoon ? 'rgba(15,22,41,0.5)' : '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: comingSoon ? 'none' : '0 4px 24px rgba(0,0,0,0.3)',
        opacity: comingSoon ? 0.55 : 1,
      }}
      role="region"
      aria-label={label}
    >
      {comingSoon && (
        <div
          className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
          aria-label="Coming soon"
        >
          🚧 Soon
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        <span
          className="text-3xl font-extrabold tabular-nums leading-none"
          style={{ color: comingSoon ? 'rgba(255,255,255,0.2)' : '#fff' }}
        >
          {comingSoon ? '—' : value}
        </span>
        {sub && !comingSoon && (
          <span className="text-xs font-medium pb-0.5" style={{ color }}>
            {sub}
          </span>
        )}
      </div>
    </motion.div>
  )
}

interface ProblemsBreakdownProps {
  easy: number
  medium: number
  hard: number
  total: number
  delay?: number
}

function ProblemsBreakdown({ easy, medium, hard, total, delay = 0 }: ProblemsBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[18px] p-5 flex flex-col gap-3 col-span-1 sm:col-span-2 lg:col-span-1"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      role="region"
      aria-label="Problems solved breakdown"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">💻</span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Problems Solved
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-extrabold tabular-nums leading-none" style={{ color: '#fff' }}>
          {total}
        </span>
        <span className="text-xs font-medium pb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          total
        </span>
      </div>

      {/* Difficulty bars */}
      <div className="space-y-1.5">
        {[
          { label: 'Easy', count: easy, color: '#22C55E' },
          { label: 'Medium', count: medium, color: '#FACC15' },
          { label: 'Hard', count: hard, color: '#EF4444' },
        ].map(({ label, count, color }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] w-12 shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {label}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${count} problems`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
              <span className="text-[10px] w-5 text-right tabular-nums" style={{ color }}>
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface StatisticsCardsProps {
  analytics?: OverallAnalytics
  isLoading?: boolean
}

export const StatisticsCards = memo(function StatisticsCards({
  analytics,
  isLoading,
}: StatisticsCardsProps) {
  const streak = analytics?.learning?.currentStreak ?? 0
  const easy = analytics?.coding?.easySolved ?? 0
  const medium = analytics?.coding?.mediumSolved ?? 0
  const hard = analytics?.coding?.hardSolved ?? 0
  const total = analytics?.coding?.totalSolved ?? 0

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[18px] h-32 animate-pulse"
            style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Learning Streak */}
      <StatCard
        icon="🔥"
        label="Learning Streak"
        value={streak}
        sub={streak === 1 ? 'day' : 'days'}
        color="#FACC15"
        delay={0.28}
      />

      {/* Problems Solved breakdown */}
      <ProblemsBreakdown
        easy={easy}
        medium={medium}
        hard={hard}
        total={total}
        delay={0.32}
      />

      {/* Projects — Coming Soon */}
      <StatCard
        icon="📁"
        label="Projects"
        value="—"
        color="#7C5CFC"
        delay={0.36}
        comingSoon
      />

      {/* Placement — Coming Soon */}
      <StatCard
        icon="🏢"
        label="Placement"
        value="—"
        color="#22C55E"
        delay={0.4}
        comingSoon
      />
    </div>
  )
})
