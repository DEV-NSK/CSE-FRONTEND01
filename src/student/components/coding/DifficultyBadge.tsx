import { cn } from '@/shared/lib/utils'
import type { ProblemDifficulty } from '@/shared/types/coding'

interface DifficultyBadgeProps {
  difficulty: ProblemDifficulty
  className?: string
}

const difficultyConfig: Record<ProblemDifficulty, { label: string; className: string }> = {
  easy: {
    label: 'Easy',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  hard: {
    label: 'Hard',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

export function CodingDifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
