import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Code2 } from 'lucide-react'
import type { LearningStats } from '@/shared/types/learning'
import type { CodingAnalyticsSummary } from '@/shared/types/analytics'

// ── Active Progress Card ──────────────────────────────────────────────────────
interface ActiveCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  progress?: number
  stat?: string
  href: string
  buttonLabel: string
  accentClass: string   // Tailwind bg colour for progress bar e.g. 'bg-violet-500'
  accentColor: string   // hex for icon bg tint & link colour
  delay?: number
}

function ActiveCard({
  icon,
  title,
  subtitle,
  progress,
  stat,
  href,
  buttonLabel,
  accentClass,
  accentColor,
  delay = 0,
}: ActiveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-[18px] p-5 flex flex-col gap-3 bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
      role="region"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}20` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Title + subtitle */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs mt-0.5 text-muted-foreground truncate">{subtitle}</p>
      </div>

      {/* Progress bar */}
      {typeof progress === 'number' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Progress</span>
            <span className="text-[10px] font-bold" style={{ color: accentColor }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.15 }}
              className={`h-full rounded-full ${accentClass}`}
            />
          </div>
        </div>
      )}

      {/* Optional stat (e.g. problems solved) */}
      {stat && (
        <p className="text-xs text-muted-foreground">{stat}</p>
      )}

      {/* CTA */}
      <Link
        to={href}
        className="mt-auto flex items-center gap-1.5 text-xs font-semibold w-fit transition-colors duration-200"
        style={{ color: accentColor }}
        aria-label={buttonLabel}
      >
        {buttonLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  )
}

// ── Coming Soon Card ──────────────────────────────────────────────────────────
function ComingSoonProgressCard({ icon, title, delay = 0 }: { icon: string; title: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[18px] p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] bg-muted/40 border border-border/50"
      role="region"
      aria-label={`${title} — coming soon`}
    >
      <span className="text-3xl opacity-30" aria-hidden="true">{icon}</span>
      <p className="text-sm font-semibold text-muted-foreground/60">{title}</p>
      <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
        🚧 Coming Soon
      </span>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-[18px] h-44 animate-pulse bg-muted border border-border/50" />
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
interface LearningProgressCardsProps {
  learningStats?: LearningStats
  codingStats?: CodingAnalyticsSummary
  continueLearning?: {
    roadmap?: { title: string } | null
    progress?: number
  }
  isLoading?: boolean
}

export const LearningProgressCards = memo(function LearningProgressCards({
  learningStats,
  codingStats,
  continueLearning,
  isLoading,
}: LearningProgressCardsProps) {
  const learningProgress = continueLearning?.progress ?? 0
  const roadmapName = continueLearning?.roadmap?.title ?? 'Start a roadmap'
  const problemsSolved = codingStats?.totalSolved ?? 0
  const currentStreak = codingStats?.currentStreak ?? 0

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Learning — real progress from /learning/continue */}
      <ActiveCard
        icon={<BookOpen className="h-5 w-5" style={{ color: '#7C5CFC' }} />}
        title="Learning"
        subtitle={roadmapName}
        progress={learningProgress}
        href="/dashboard/learning/continue"
        buttonLabel="Continue Learning"
        accentClass="bg-violet-500"
        accentColor="#7C5CFC"
        delay={0.44}
      />

      {/* Coding — real stats from /coding/analytics */}
      <ActiveCard
        icon={<Code2 className="h-5 w-5" style={{ color: '#22C55E' }} />}
        title="Coding"
        subtitle={problemsSolved > 0 ? `${problemsSolved} problems solved` : "Start solving problems"}
        stat={currentStreak > 0 ? `🔥 ${currentStreak}-day coding streak` : undefined}
        href="/dashboard/coding"
        buttonLabel="Go to Coding →"
        accentClass="bg-green-500"
        accentColor="#22C55E"
        delay={0.48}
      />

      {/* Projects — Coming Soon */}
      <ComingSoonProgressCard icon="📁" title="Projects" delay={0.52} />

      {/* Placement — Coming Soon */}
      <ComingSoonProgressCard icon="🏢" title="Placement" delay={0.56} />
    </div>
  )
})
