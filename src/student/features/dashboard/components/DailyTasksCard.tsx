import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, BookOpen, Code2, ArrowRight } from 'lucide-react'
import type { DailyTasksResponse } from '@/shared/services/dashboard.service'
import type { DailyChallenge } from '@/shared/types/coding'

interface DailyTasksCardProps {
  data?: DailyTasksResponse
  /** Optional fallback from the /coding/daily endpoint */
  dailyChallenge?: DailyChallenge
  continueLearning?: { lesson?: { id: string; title: string } | null; roadmap?: { title: string } | null; progress?: number }
  isLoading?: boolean
}

const difficultyColor: Record<string, string> = {
  Easy: '#22C55E',
  Medium: '#FACC15',
  Hard: '#EF4444',
}

function TaskRow({
  icon: Icon,
  label,
  title,
  badge,
  badgeColor,
  href,
  completed,
}: {
  icon: typeof BookOpen
  label: string
  title: string
  badge?: string
  badgeColor?: string
  href: string
  completed?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: completed ? 'rgba(34,197,94,0.15)' : 'rgba(124,92,252,0.12)' }}
          aria-hidden="true"
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4" style={{ color: '#22C55E' }} />
          ) : (
            <Icon className="h-4 w-4" style={{ color: '#7C5CFC' }} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {label}
          </p>
          <p className="text-xs font-medium truncate" style={{ color: completed ? 'rgba(255,255,255,0.45)' : '#fff' }}>
            {title}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: `${badgeColor}18`, color: badgeColor }}
          >
            {badge}
          </span>
        )}
        {completed ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
            ✓ Done
          </span>
        ) : (
          <Link
            to={href}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(124,92,252,0.15)', color: '#9377FF' }}
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

  // Resolve today's lesson
  const lesson = data?.lesson ?? (continueLearning?.lesson
    ? {
        id: continueLearning.lesson.id,
        title: continueLearning.lesson.title,
        completed: false,
      }
    : null)

  const allDone = (codingChallenge?.completed ?? false) && (lesson?.completed ?? false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.14 }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      role="region"
      aria-label="Daily tasks"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Daily Tasks
          </span>
        </div>
        {!isLoading && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: allDone ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
              color: allDone ? '#22C55E' : 'rgba(255,255,255,0.4)',
            }}
          >
            {allDone ? 'All done 🎉' : 'Today'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </div>
      ) : allDone ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {codingChallenge ? (
            <TaskRow
              icon={Code2}
              label="Today's Coding Question"
              title={codingChallenge.title}
              badge={codingChallenge.difficulty}
              badgeColor={difficultyColor[codingChallenge.difficulty]}
              href={`/dashboard/coding/problems/${codingChallenge.slug}`}
              completed={codingChallenge.completed}
            />
          ) : (
            <TaskRow
              icon={Code2}
              label="Today's Coding Question"
              title="Daily Challenge"
              href="/dashboard/coding/daily"
            />
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
            <TaskRow
              icon={BookOpen}
              label="Today's Lesson"
              title="Continue Learning"
              href="/dashboard/learning/continue"
            />
          )}
        </div>
      )}
    </motion.div>
  )
})
