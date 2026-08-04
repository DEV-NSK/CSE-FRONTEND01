import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Code2, FolderKanban, Briefcase, GraduationCap, FileText } from 'lucide-react'

interface QuickCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  accentColor: string
  delay?: number
  comingSoon?: boolean
}

function QuickCard({
  icon,
  title,
  description,
  href,
  accentColor,
  delay = 0,
  comingSoon,
}: QuickCardProps) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={comingSoon ? {} : { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      whileTap={comingSoon ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-[18px] p-5 flex flex-col gap-3 h-full cursor-pointer relative overflow-hidden"
      style={{
        background: '#0F1629',
        border: `1px solid ${comingSoon ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: comingSoon ? 'none' : '0 4px 24px rgba(0,0,0,0.25)',
        opacity: comingSoon ? 0.45 : 1,
      }}
    >
      {comingSoon && (
        <div
          className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
          aria-label="Coming soon"
        >
          🚧
        </div>
      )}

      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accentColor}18` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold" style={{ color: comingSoon ? 'rgba(255,255,255,0.4)' : '#fff' }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {comingSoon ? 'Coming Soon' : description}
        </p>
      </div>

      {!comingSoon && (
        <div
          className="flex items-center gap-1 text-xs font-semibold mt-auto"
          style={{ color: accentColor }}
        >
          Go <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </motion.div>
  )

  if (comingSoon) {
    return <div className="h-full" aria-label={`${title} — coming soon`}>{inner}</div>
  }

  return (
    <Link to={href} className="h-full block" aria-label={title}>
      {inner}
    </Link>
  )
}

export const QuickAccessCards = memo(function QuickAccessCards() {
  const cards: QuickCardProps[] = [
    {
      icon: <BookOpen className="h-5 w-5" style={{ color: '#7C5CFC' }} />,
      title: 'Learning',
      description: 'Continue your roadmap',
      href: '/dashboard/learning',
      accentColor: '#7C5CFC',
      delay: 0.6,
    },
    {
      icon: <Code2 className="h-5 w-5" style={{ color: '#22C55E' }} />,
      title: 'Coding',
      description: "Today's challenge",
      href: '/dashboard/coding',
      accentColor: '#22C55E',
      delay: 0.62,
    },
    {
      icon: <FolderKanban className="h-5 w-5" style={{ color: '#FACC15' }} />,
      title: 'Projects',
      description: 'Build real projects',
      href: '/dashboard/launching-soon/projects',
      accentColor: '#FACC15',
      delay: 0.64,
      comingSoon: true,
    },
    {
      icon: <Briefcase className="h-5 w-5" style={{ color: '#EF4444' }} />,
      title: 'Placement',
      description: 'Interview prep',
      href: '/dashboard/launching-soon/placement',
      accentColor: '#EF4444',
      delay: 0.66,
      comingSoon: true,
    },
    {
      icon: <GraduationCap className="h-5 w-5" style={{ color: '#A78BFA' }} />,
      title: 'Core Subjects',
      description: 'CS fundamentals',
      href: '/dashboard/launching-soon/core-subjects',
      accentColor: '#A78BFA',
      delay: 0.68,
      comingSoon: true,
    },
    {
      icon: <FileText className="h-5 w-5" style={{ color: '#38BDF8' }} />,
      title: 'Resume',
      description: 'Build your resume',
      href: '/dashboard/launching-soon/placement',
      accentColor: '#38BDF8',
      delay: 0.7,
      comingSoon: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" role="list" aria-label="Quick access">
      {cards.map((card) => (
        <div key={card.title} role="listitem">
          <QuickCard {...card} />
        </div>
      ))}
    </div>
  )
})
