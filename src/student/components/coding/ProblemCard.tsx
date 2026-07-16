import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CodingDifficultyBadge } from './DifficultyBadge'
import { TagChip } from './TagChip'
import { FavoriteButton } from './FavoriteButton'
import { useToggleFavorite } from '@/shared/hooks/useCoding'
import { cn } from '@/shared/lib/utils'
import type { ProblemListItem } from '@/shared/types/coding'

interface ProblemCardProps {
  problem: ProblemListItem
  className?: string
}

export function ProblemCard({ problem, className }: ProblemCardProps) {
  const { mutate: toggleFavorite, isPending } = useToggleFavorite()

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'h-full hover:shadow-md transition-shadow cursor-pointer group relative',
          problem.isSolved && 'border-green-200 dark:border-green-900/50',
          className
        )}
      >
        {/* Solved indicator */}
        {problem.isSolved && (
          <div className="absolute top-3 right-10 text-green-500" aria-label="Solved">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-2 right-2">
          <FavoriteButton
            isFavorite={problem.isFavorite ?? false}
            onToggle={() => toggleFavorite(problem.id)}
            loading={isPending}
            size="sm"
          />
        </div>

        <Link to={`/dashboard/coding/problems/${problem.slug}`} className="block h-full">
          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <div className="pr-8">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {problem.title}
              </h3>
            </div>

            {/* Category + Difficulty */}
            <div className="flex items-center gap-2 flex-wrap">
              <CodingDifficultyBadge difficulty={problem.difficulty} />
              <span className="text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                {problem.category.name}
              </span>
            </div>

            {/* Tags */}
            {problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {problem.tags.slice(0, 3).map((tag) => (
                  <TagChip key={tag.id} tag={tag} />
                ))}
                {problem.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{problem.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Footer stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                {problem.acceptanceRate.toFixed(1)}%
              </span>
              {problem.discussionCount !== undefined && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  {problem.discussionCount}
                </span>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}
