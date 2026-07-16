import { Link } from 'react-router-dom'
import { CheckCircle2, TrendingUp, MessageSquare } from 'lucide-react'
import { CodingDifficultyBadge } from './DifficultyBadge'
import { TagChip } from './TagChip'
import { CompanyBadge } from './CompanyBadge'
import { FavoriteButton } from './FavoriteButton'
import { useToggleFavorite } from '@/shared/hooks/useCoding'
import { cn } from '@/shared/lib/utils'
import type { ProblemListItem } from '@/shared/types/coding'

interface ProblemTableProps {
  problems: ProblemListItem[]
  className?: string
}

export function ProblemTable({ problems, className }: ProblemTableProps) {
  const { mutate: toggleFavorite, isPending } = useToggleFavorite()

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm" aria-label="Problems list">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8" aria-label="Status" />
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
              Acceptance
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
              Tags
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">
              Companies
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
              Discussions
            </th>
            <th className="px-2 py-3 w-10" aria-label="Favorite" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {problems.map((problem, idx) => (
            <tr
              key={problem.id}
              className={cn(
                'hover:bg-muted/30 transition-colors group',
                idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
              )}
            >
              {/* Solved indicator */}
              <td className="px-4 py-3 w-8">
                {problem.isSolved ? (
                  <CheckCircle2
                    className="h-4 w-4 text-green-500"
                    aria-label="Solved"
                  />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" aria-label="Unsolved" />
                )}
              </td>

              {/* Title */}
              <td className="px-4 py-3 font-medium">
                <Link
                  to={`/dashboard/coding/problems/${problem.slug}`}
                  className="hover:text-primary transition-colors group-hover:underline"
                >
                  {problem.title}
                </Link>
              </td>

              {/* Difficulty */}
              <td className="px-4 py-3">
                <CodingDifficultyBadge difficulty={problem.difficulty} />
              </td>

              {/* Acceptance rate */}
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  {problem.acceptanceRate.toFixed(1)}%
                </span>
              </td>

              {/* Tags */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {problem.tags.slice(0, 2).map((tag) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                  {problem.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{problem.tags.length - 2}</span>
                  )}
                </div>
              </td>

              {/* Companies */}
              <td className="px-4 py-3 hidden xl:table-cell">
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {problem.companies.slice(0, 2).map((co) => (
                    <CompanyBadge key={co.id} company={co} />
                  ))}
                  {problem.companies.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{problem.companies.length - 2}
                    </span>
                  )}
                </div>
              </td>

              {/* Discussion count */}
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {problem.discussionCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" aria-hidden="true" />
                    {problem.discussionCount}
                  </span>
                )}
              </td>

              {/* Favorite */}
              <td className="px-2 py-3">
                <FavoriteButton
                  isFavorite={problem.isFavorite ?? false}
                  onToggle={() => toggleFavorite(problem.id)}
                  loading={isPending}
                  size="sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
