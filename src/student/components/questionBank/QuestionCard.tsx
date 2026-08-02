// ─── FPRD-16: Question Bank — individual question card ───────────────────────

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ArrowRight, Building2, Tag } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { QuestionBankProblem } from '@/shared/types/questionBank'

interface QuestionCardProps {
  problem: QuestionBankProblem
  index?: number
}

const difficultyConfig = {
  easy: {
    label: 'Easy',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  hard: {
    label: 'Hard',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

export function QuestionCard({ problem, index = 0 }: QuestionCardProps) {
  const diff =
    difficultyConfig[(problem.difficulty as keyof typeof difficultyConfig)] ??
    difficultyConfig.easy

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: 'easeOut' }}
    >
      <Link
        to={`/dashboard/coding/problems/${problem.slug}`}
        className="group block"
        aria-label={`${problem.title} — ${diff.label}`}
      >
        <div
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg border border-border bg-card',
            'transition-all duration-200',
            'hover:shadow-sm hover:border-primary/20 hover:bg-accent/5',
          )}
        >
          {/* Status icon */}
          <div className="shrink-0">
            {problem.isSolved ? (
              <CheckCircle2
                className="h-5 w-5 text-green-500"
                aria-label="Solved"
              />
            ) : (
              <Circle
                className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                aria-label="Unsolved"
              />
            )}
          </div>

          {/* Title + metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {problem.title}
              </span>
              <span
                className={cn(
                  'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  diff.badge,
                )}
              >
                {diff.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {/* Acceptance */}
              <span>
                Acceptance{' '}
                <span className="font-medium text-foreground">
                  {problem.acceptanceRate.toFixed(0)}%
                </span>
              </span>

              {/* Companies */}
              {problem.companies.length > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" aria-hidden="true" />
                  {problem.companies
                    .slice(0, 3)
                    .map((c) => c.name)
                    .join(', ')}
                  {problem.companies.length > 3 && (
                    <span className="text-muted-foreground/70">
                      +{problem.companies.length - 3}
                    </span>
                  )}
                </span>
              )}

              {/* Tags */}
              {problem.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span className="truncate max-w-[120px]">
                    {problem.tags
                      .slice(0, 2)
                      .map((t) => t.name)
                      .join(', ')}
                    {problem.tags.length > 2 && (
                      <span className="text-muted-foreground/70">
                        {' '}+{problem.tags.length - 2}
                      </span>
                    )}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Solve arrow */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors">
            <span className="hidden sm:inline">Solve</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/** Skeleton for question cards */
export function QuestionCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card animate-pulse">
      <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-4 w-14 rounded-full bg-muted" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      </div>
      <div className="h-4 w-12 rounded bg-muted shrink-0" />
    </div>
  )
}
