import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface ProgressRingProps {
  progress: number // 0–100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  labelClassName?: string
  color?: string
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  className,
  showLabel = true,
  labelClassName,
  color,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset = circumference - (clampedProgress / 100) * circumference

  const strokeColor = color || (clampedProgress === 100 ? '#22c55e' : undefined)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clampedProgress}%`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={strokeColor || 'hsl(var(--primary))'}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute text-center font-semibold leading-none',
            size < 48 ? 'text-[10px]' : size < 64 ? 'text-xs' : 'text-sm',
            clampedProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-foreground',
            labelClassName
          )}
        >
          {clampedProgress}%
        </span>
      )}
    </div>
  )
}
