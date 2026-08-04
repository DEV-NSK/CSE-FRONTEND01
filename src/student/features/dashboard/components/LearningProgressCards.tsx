import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import type { OverallAnalytics } from '@/shared/types/analytics'

interface ProgressCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  progress?: number
  href: string
  buttonLabel: string
  accentColor: string
  delay?: number
  comingSoon?: boolean
}

function ProgressCard({
  icon,
  title,
  subtitle,
  progress,
  href,
  buttonLabel,
  accentColor,
  delay = 0,
  comingSoon,
}: ProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={comingSoon ? {} : { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.2, delay }}
      className="rounded-[18px] p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        opacity: comingSoon ? 0.5 : 1,
      }}
      role="region"
      aria-label={title}
    >
      {comingSoon && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 rounded-[18px]"
          style={{ background: 'rgba(7,11,23,0.45)' }}
          aria-hidden="true"
        >
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
          >
            🚧 Coming Soon
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}18` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: '#fff' }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {subtitle}
        </p>
      </div>

      {/* Progress bar (if provided) */}
      {typeof progress === 'number' && !comingSoon && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Progress
            </span>
            <span className="text-[10px] font-bold" style={{ color: accentColor }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.15 }}
              className="h-full rounded-full"
              style={{ background: accentColor }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      {!comingSoon && (
        <Link
          to={href}
          className="mt-auto flex items-center gap-1.5 text-xs font-semibold w-fit transition-colors duration-200"
          style={{ color: accentColor }}
          aria-label={buttonLabel}
        >
          {buttonLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </motion.div>
  )
}

interface LearningProgressCardsProps {
  analytics?: OverallAnalytics
  continueLearning?: {
    roadmap?: { title: string } | null
    progress?: number
  }
  isLoading?: boolean
}

export const LearningProgressCards = memo(function LearningProgressCards({
  analytics,
  continueLearning,
  isLoading,
}: LearningProgressCardsProps) {
  const learningProgress = continueLearning?.progress ?? 0
  const roadmapName = continueLearning?.roadmap?.title ?? 'Python Roadmap'

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[18px] h-44 animate-pulse"
            style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Learning */}
      <ProgressCard
        icon={<BookOpen className="h-5 w-5" style={{ color: '#7C5CFC' }} />}
        title="Learning"
        subtitle={roadmapName}
        progress={learningProgress}
        href="/dashboard/learning/continue"
        buttonLabel="Continue Learning"
        accentColor="#7C5CFC"
        delay={0.44}
      />

      {/* Coding */}
      <ProgressCard
        icon={<span className="text-xl">💻</span>}
        title="Coding"
        subtitle="Today's Challenge"
        href="/dashboard/coding/daily"
        buttonLabel="Continue →"
        accentColor="#22C55E"
        delay={0.48}
      />

      {/* Projects — Coming Soon */}
      <ProgressCard
        icon={<span className="text-xl">📁</span>}
        title="Projects"
        subtitle="Build real-world projects"
        href="/dashboard/launching-soon/projects"
        buttonLabel="Coming Soon"
        accentColor="#FACC15"
        delay={0.52}
        comingSoon
      />

      {/* Placement — Coming Soon */}
      <ProgressCard
        icon={<span className="text-xl">🏢</span>}
        title="Placement"
        subtitle="Interview preparation"
        href="/dashboard/launching-soon/placement"
        buttonLabel="Coming Soon"
        accentColor="#EF4444"
        delay={0.56}
        comingSoon
      />
    </div>
  )
})
