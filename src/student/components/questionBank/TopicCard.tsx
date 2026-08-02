// ─── FPRD-16: Question Bank Topic Card ───────────────────────────────────────

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { QuestionBankTopic } from '@/shared/types/questionBank'
import { getTopicMeta } from './topicIcons'

interface TopicCardProps {
  topic: QuestionBankTopic
  /** 0-based index for stagger animation */
  index?: number
}

export function TopicCard({ topic, index = 0 }: TopicCardProps) {
  const meta = getTopicMeta(topic.slug)
  const solved = 0 // placeholder until user progress is wired
  const completion = topic.totalProblems > 0 ? Math.round((solved / topic.totalProblems) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
    >
      <Link
        to={`/dashboard/coding/question-bank/${topic.slug}`}
        className="group block h-full"
        aria-label={`${topic.name} — ${topic.totalProblems} problems`}
      >
        <div
          className={cn(
            'relative flex flex-col h-full rounded-xl border border-border bg-card p-5',
            'shadow-sm transition-all duration-200',
            'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          )}
        >
          {/* Icon + name */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-lg text-xl shrink-0',
                  meta.color,
                )}
                aria-hidden="true"
              >
                {meta.icon}
              </div>
              <div>
                <h3 className={cn('font-semibold text-sm leading-tight', meta.textColor)}>
                  {topic.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {topic.totalProblems > 0
                    ? `${topic.totalProblems} Problems`
                    : 'Coming Soon'}
                </p>
              </div>
            </div>
            <ArrowRight
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200',
                'group-hover:text-primary group-hover:translate-x-0.5',
              )}
              aria-hidden="true"
            />
          </div>

          {/* Difficulty breakdown */}
          {topic.totalProblems > 0 ? (
            <div className="flex items-center gap-3 text-xs mb-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" aria-hidden="true" />
                <span className="text-green-600 dark:text-green-400 font-medium">{topic.easy}</span>
                <span className="text-muted-foreground">Easy</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" aria-hidden="true" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">{topic.medium}</span>
                <span className="text-muted-foreground">Med</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" aria-hidden="true" />
                <span className="text-red-600 dark:text-red-400 font-medium">{topic.hard}</span>
                <span className="text-muted-foreground">Hard</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs text-muted-foreground/60 italic">
                Questions being curated
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{solved} / {topic.totalProblems} Solved</span>
              <span>{completion}%</span>
            </div>
            <div
              className="h-1.5 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${completion}% completed`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  completion === 100 ? 'bg-green-500' : 'bg-primary',
                )}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Continue button */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                'text-muted-foreground group-hover:text-primary',
              )}
            >
              {topic.totalProblems === 0
                ? 'Coming Soon →'
                : solved > 0
                ? 'Continue →'
                : 'Start Solving →'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/** Skeleton placeholder for TopicCard while loading */
export function TopicCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-muted mb-1.5" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-3 mb-3">
        <div className="h-3 w-14 rounded bg-muted" />
        <div className="h-3 w-14 rounded bg-muted" />
        <div className="h-3 w-14 rounded bg-muted" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted" />
    </div>
  )
}
