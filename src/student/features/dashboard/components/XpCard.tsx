import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { LearningStats } from '@/shared/types/learning'
import type { CodingAnalyticsSummary } from '@/shared/types/analytics'

const XP_PER_LEVEL = 500

function getLevel(xp: number) { return Math.floor(xp / XP_PER_LEVEL) + 1 }
function getXpInLevel(xp: number) { return xp % XP_PER_LEVEL }
function getXpToNext(xp: number) { return XP_PER_LEVEL - getXpInLevel(xp) }

function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (target === prev.current) return
    const start = prev.current
    prev.current = target
    const t0 = performance.now()
    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

interface XpCardProps {
  learningStats?: LearningStats
  codingStats?: CodingAnalyticsSummary
  isLoading?: boolean
}

export const XpCard = memo(function XpCard({ learningStats, codingStats, isLoading }: XpCardProps) {
  // XP = completed lessons × 10  +  accepted problems × 20
  const completedLessons = learningStats?.totalLessonsCompleted ?? 0
  const problemsSolved   = codingStats?.totalSolved ?? 0
  const rawXp = completedLessons * 10 + problemsSolved * 20

  const level      = getLevel(rawXp)
  const xpInLevel  = getXpInLevel(rawXp)
  const xpToNext   = getXpToNext(rawXp)
  const percentage = Math.round((xpInLevel / XP_PER_LEVEL) * 100)
  const animatedXp = useAnimatedCounter(rawXp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full bg-card border border-border shadow-sm"
      role="region"
      aria-label="XP Score"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-violet-500/15" aria-hidden="true">
          <Zap className="h-4 w-4 text-violet-500" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          XP SCORE
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      ) : (
        <>
          {/* XP number */}
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold tabular-nums leading-none text-foreground" aria-live="polite">
              {animatedXp.toLocaleString()}
            </span>
            <span className="text-sm font-semibold pb-0.5 text-violet-500">XP</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {xpToNext.toLocaleString()} XP to Level {level + 1}
              </span>
              <span className="text-xs font-bold text-violet-500">{percentage}%</span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden bg-muted"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${percentage}% progress to level ${level + 1}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
              />
            </div>
          </div>

          {/* Level badge */}
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
              Level {level}
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
})
