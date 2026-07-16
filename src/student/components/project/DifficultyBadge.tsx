import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { ProjectDifficulty } from '@/shared/types/project'

interface DifficultyBadgeProps {
  difficulty: ProjectDifficulty
  className?: string
}

const difficultyConfig: Record<ProjectDifficulty, { label: string; variant: 'success' | 'info' | 'warning' | 'destructive' }> = {
  BEGINNER: { label: 'Beginner', variant: 'success' },
  INTERMEDIATE: { label: 'Intermediate', variant: 'info' },
  ADVANCED: { label: 'Advanced', variant: 'warning' },
  EXPERT: { label: 'Expert', variant: 'destructive' },
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty]
  return (
    <Badge variant={config.variant} className={cn('text-xs', className)}>
      {config.label}
    </Badge>
  )
}
