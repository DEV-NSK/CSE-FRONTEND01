import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import type { LeaderboardResponse } from '@/shared/services/dashboard.service'

interface LeaderboardCardProps {
  data?: LeaderboardResponse
  isLoading?: boolean
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return 'st'
  if (rank === 2) return 'nd'
  if (rank === 3) return 'rd'
  return 'th'
}

function getTopPercent(rank: number, total: number): string {
  if (!total) return ''
  const pct = Math.ceil((rank / total) * 100)
  if (pct <= 1) return 'Top 1%'
  if (pct <= 5) return 'Top 5%'
  if (pct <= 10) return 'Top 10%'
  if (pct <= 25) return 'Top 25%'
  return `Top ${pct}%`
}

export const LeaderboardCard = memo(function LeaderboardCard({
  data,
  isLoading,
}: LeaderboardCardProps) {
  const rank = data?.currentUserRank ?? 0
  const total = data?.totalUsers ?? 0
  const topPercent = rank && total ? getTopPercent(rank, total) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      role="region"
      aria-label="Leaderboard ranking"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(250,204,21,0.12)' }}
          aria-hidden="true"
        >
          <Trophy className="h-4 w-4" style={{ color: '#FACC15' }} />
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Leaderboard
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-9 w-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-4 w-16 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-7 w-full rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
      ) : rank ? (
        <>
          {/* Rank display */}
          <div className="flex items-end gap-1">
            <span
              className="text-3xl font-extrabold tabular-nums leading-none"
              style={{ color: '#fff' }}
            >
              #{rank}
            </span>
            <span className="text-sm font-medium pb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {getRankSuffix(rank)}
            </span>
          </div>

          {topPercent && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
              style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}
            >
              {topPercent}
            </span>
          )}

          <Link
            to="/dashboard/coding/analytics"
            className="mt-auto text-xs font-medium transition-colors duration-200 flex items-center gap-1"
            style={{ color: '#7C5CFC' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = '#9377FF')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = '#7C5CFC')
            }
            aria-label="View full leaderboard"
          >
            View Leaderboard →
          </Link>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No ranking yet
          </span>
          <Link
            to="/dashboard/coding"
            className="text-xs font-medium"
            style={{ color: '#7C5CFC' }}
            aria-label="Start solving problems to get ranked"
          >
            Start solving →
          </Link>
        </div>
      )}
    </motion.div>
  )
})
