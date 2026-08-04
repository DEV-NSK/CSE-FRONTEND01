import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, BookOpen, Code2, ArrowRight } from 'lucide-react'
import type { DailyTasksResponse } from '@/shared/services/dashboard.service'
import type { DailyChallenge } from '@/shared/types/coding'

interface DailyTasksCardProps {
  data?: DailyTasksResponse
  dailyChallenge?: DailyChallenge
  continueLearning?: {
    lesson?: { id: string; title: string } | null
    roadmap?: { title: string } | null
    progress?: number
  }
  isLoading?: boolean
}

const difficultyClass: Record<string, string> = {
  Easy:   'bg-green-500/15 text-green-600 dark:text-green-400',
  Medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  Hard:   'bg-red-500/15 text-red-500',
}

function TaskRow({
  icon: Icon,
  label,
  title,
  badge,
  badgeClass,
  href,
  completed,
}: {
  icon: typeof BookOpen
  label: string
  title: string
  badge?: string
  badgeClass?: string
  href: string
  completed?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/60">
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${completed ? 'bg-green-500/15' : 'bg-violet-500/12'}`} aria-hidden="true">
          {completed
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <Icon className="h-4 w-4 text-violet-500" />}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            {label}
          </p>
          <p className={`text-xs font-medium truncate ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {title}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
            {badge}
          </span>
        )}
        {completed ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/12 text-green-600 dark:text-green-400">
            ✓ Done
          </span>
        ) : (
          <Link
            to={href}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-500 hover:bg-violet-500/25 transition-colors duration-150"
            aria-label={`Go to ${label.toLowerCase()}`}
          >
            {label === "Today's Lesson" ? 'Continue' : 'Solve'}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  )
}

export const DailyTasksCard = memo(function DailyTasksCard({
  data,
  dailyChallenge,
  continueLearning,
  isLoading,
}: DailyTasksCardProps) {
  // Resolve coding challenge — prefer /dashboard/daily-tasks, fall back to /coding/daily
  const codingChallenge = data?.codingChallenge ?? (dailyChallenge
    ? {
        id: dailyChallenge.id,
        title: dailyChallenge.problem.title,
        slug: dailyChallenge.problem.slug,
        difficulty: dailyChallenge.problem.difficulty as 'Easy' | 'Medium' | 'Hard',
        completed: dailyChallenge.isSolved ?? false,
      }
    : null)

  const lesson = data?.lesson ?? (continueLearning?.lesson
    ? { id: continueLearning.lesson.id, title: continueLearning.lesson.title, completed: false }
    : null)

  const allDone = (codingChallenge?.completed ?? false) && (lesson?.completed ?? false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.14 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full w-full bg-card border border-border shadow-sm"
      role="region"
      aria-label="Daily tasks"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Daily Tasks
          </span>
        </div>
        {!isLoading && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            allDone
              ? 'bg-green-500/12 text-green-600 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            {allDone ? 'All done 🎉' : 'Today'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted" />
          ))}
        </div>
      ) : allDone ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-medium text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {codingChallenge ? (
            <TaskRow
              icon={Code2}
              label="Today's Coding Question"
              title={codingChallenge.title}
              badge={codingChallenge.difficulty}
              badgeClass={difficultyClass[codingChallenge.difficulty] ?? ''}
              href={`/dashboard/coding/problems/${codingChallenge.slug}`}
              completed={codingChallenge.completed}
            />
          ) : (
            <TaskRow icon={Code2} label="Today's Coding Question" title="Daily Challenge" href="/dashboard/coding/daily" />
          )}
          {lesson ? (
            <TaskRow
              icon={BookOpen}
              label="Today's Lesson"
              title={lesson.title}
              href={`/dashboard/learning/lesson/${lesson.id}`}
              completed={lesson.completed}
            />
          ) : (
            <TaskRow icon={BookOpen} label="Today's Lesson" title="Continue Learning" href="/dashboard/learning/continue" />
          )}
        </div>
      )}
    </motion.div>
  )
})
