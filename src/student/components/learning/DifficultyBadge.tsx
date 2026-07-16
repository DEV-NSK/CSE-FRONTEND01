import { Badge } from '@/shared/components/ui/badge'
import type { Difficulty } from '@/shared/types/learning'
import { cn } from '@/shared/lib/utils'

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

const config: Record<Difficulty, { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  },
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const { label, className: colorClass } = config[difficulty] ?? config.beginner
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', colorClass, className)}
    >
      {label}
    </Badge>
  )
}
