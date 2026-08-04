import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { OverallAnalytics } from '@/shared/types/analytics'

// XP_PER_LEVEL: 500 XP per level (simple linear progression)
const XP_PER_LEVEL = 500

function getLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function getXpInCurrentLevel(xp: number) {
  return xp % XP_PER_LEVEL
}

function getXpToNextLevel(xp: number) {
  return XP_PER_LEVEL - getXpInCurrentLevel(xp)
}

// Animated counter hook
function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    const start = prevTarget.current
    prevTarget.current = target
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return value
}

interface XpCardProps {
  analytics?: OverallAnalytics
  isLoading?: boolean
}

export const XpCard = memo(function XpCard({ analytics, isLoading }: XpCardProps) {
  // XP comes from learning streak/hours as a proxy; real XP from analytics if available
  // Using coding + learning totalCompleted as XP source
  const rawXp = analytics
    ? (analytics.learning?.totalCompleted ?? 0) * 10 +
      (analytics.coding?.totalSolved ?? 0) * 20
    : 0

  const level = getLevel(rawXp)
  const xpInLevel = getXpInCurrentLevel(rawXp)
  const xpToNext = getXpToNextLevel(rawXp)
  const percentage = Math.round((xpInLevel / XP_PER_LEVEL) * 100)
  const animatedXp = useAnimatedCounter(rawXp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      role="region"
      aria-label="XP Score"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,92,252,0.15)' }}
          aria-hidden="true"
        >
          <Zap className="h-4 w-4" style={{ color: '#7C5CFC' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
          XP SCORE
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-9 w-28 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
      ) : (
        <>
          {/* XP number */}
          <div className="flex items-end gap-2">
            <span
              className="text-3xl font-extrabold tabular-nums leading-none"
              style={{ color: '#fff' }}
              aria-live="polite"
            >
              {animatedXp.toLocaleString()}
            </span>
            <span className="text-sm font-semibold pb-0.5" style={{ color: '#7C5CFC' }}>
              XP
            </span>
          </div>

          {/* Progress to next level */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {xpToNext.toLocaleString()} XP to Level {level + 1}
              </span>
              <span className="text-xs font-bold" style={{ color: '#7C5CFC' }}>
                {percentage}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
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
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7C5CFC, #A78BFA)' }}
              />
            </div>
          </div>

          {/* Level badge */}
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,92,252,0.18)', color: '#A78BFA' }}
            >
              Level {level}
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
})
