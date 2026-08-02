// ─── FPRD-16: Collapsible Difficulty Section ─────────────────────────────────

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { QuestionBankProblem } from '@/shared/types/questionBank'
import { QuestionCard, QuestionCardSkeleton } from './QuestionCard'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DifficultySectionProps {
  difficulty: Difficulty
  problems: QuestionBankProblem[]
  totalCount: number
  isLoading?: boolean
  defaultOpen?: boolean
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; countClass: string; headerClass: string; dotClass: string }
> = {
  easy: {
    label: 'Easy',
    countClass: 'text-green-600 dark:text-green-400',
    headerClass:
      'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10',
    dotClass: 'bg-green-500',
  },
  medium: {
    label: 'Medium',
    countClass: 'text-yellow-600 dark:text-yellow-400',
    headerClass:
      'border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10',
    dotClass: 'bg-yellow-500',
  },
  hard: {
    label: 'Hard',
    countClass: 'text-red-600 dark:text-red-400',
    headerClass:
      'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10',
    dotClass: 'bg-red-500',
  },
}

export function DifficultySection({
  difficulty,
  problems,
  totalCount,
  isLoading = false,
  defaultOpen = true,
}: DifficultySectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const cfg = difficultyConfig[difficulty]

  return (
    <section aria-labelledby={`section-${difficulty}`}>
      {/* Header / toggle */}
      <button
        id={`section-${difficulty}`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-lg border',
          'transition-colors cursor-pointer select-none',
          cfg.headerClass,
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn('h-2.5 w-2.5 rounded-full shrink-0', cfg.dotClass)}
            aria-hidden="true"
          />
          <span className={cn('font-semibold text-sm', cfg.countClass)}>
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {totalCount} problem{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </motion.div>
      </button>

      {/* Problems list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2 pb-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <QuestionCardSkeleton key={i} />
                ))
              ) : problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-3xl mb-2" aria-hidden="true">
                    {difficulty === 'easy' ? '🌱' : difficulty === 'medium' ? '🔥' : '💎'}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {cfg.label} questions are being curated.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Check back soon — thousands of problems are on the way!
                  </p>
                </div>
              ) : (
                problems.map((problem, idx) => (
                  <QuestionCard key={problem.id} problem={problem} index={idx} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
