import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import type { LeaderboardResponse } from '@/shared/services/dashboard.service'

interface LeaderboardCardProps {
  data?: LeaderboardResponse
  isLoading?: boolean
}

function getRankSuffix(rank: number) {
  if (rank === 1) return 'st'
  if (rank === 2) return 'nd'
  if (rank === 3) return 'rd'
  return 'th'
}

function getTopPercent(rank: number, total: number) {
  if (!total) return ''
  const pct = Math.ceil((rank / total) * 100)
  if (pct <= 1) return 'Top 1%'
  if (pct <= 5) return 'Top 5%'
  if (pct <= 10) return 'Top 10%'
  if (pct <= 25) return 'Top 25%'
  return `Top ${pct}%`
}

export const LeaderboardCard = memo(function LeaderboardCard({ data, isLoading }: LeaderboardCardProps) {
  const rank   = data?.currentUserRank ?? 0
  const total  = data?.totalUsers ?? 0
  const topPct = rank && total ? getTopPercent(rank, total) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full bg-card border border-border shadow-sm"
      role="region"
      aria-label="Leaderboard ranking"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-yellow-500/15" aria-hidden="true">
          <Trophy className="h-4 w-4 text-yellow-500" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Leaderboard
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-9 w-20 rounded-lg bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-7 w-full rounded-lg bg-muted" />
        </div>
      ) : rank ? (
        <>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-extrabold tabular-nums leading-none text-foreground">
              #{rank}
            </span>
            <span className="text-sm font-medium pb-0.5 text-muted-foreground">
              {getRankSuffix(rank)}
            </span>
          </div>

          {topPct && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              {topPct}
            </span>
          )}

          <Link
            to="/dashboard/coding/analytics"
            className="mt-auto text-xs font-semibold text-violet-500 hover:text-violet-400 transition-colors duration-200 flex items-center gap-1"
            aria-label="View full leaderboard"
          >
            View Leaderboard →
          </Link>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">No ranking yet</span>
          <Link to="/dashboard/coding" className="text-xs font-semibold text-violet-500 hover:text-violet-400">
            Start solving →
          </Link>
        </div>
      )}
    </motion.div>
  )
})
