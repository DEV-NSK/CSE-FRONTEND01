import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Code2, FolderKanban, Briefcase, GraduationCap, FileText } from 'lucide-react'

interface ActiveQuickCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  accentColor: string
  delay?: number
}

function ActiveQuickCard({ icon, title, description, href, accentColor, delay = 0 }: ActiveQuickCardProps) {
  return (
    <Link to={href} className="h-full block group" aria-label={title}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, delay }}
        className="rounded-[18px] p-5 flex flex-col gap-3 h-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}20` }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs mt-0.5 text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold mt-auto" style={{ color: accentColor }}>
          Go <ArrowRight className="h-3 w-3" />
        </div>
      </motion.div>
    </Link>
  )
}

interface ComingSoonQuickCardProps {
  icon: React.ReactNode
  title: string
  accentColor: string
  delay?: number
}

function ComingSoonQuickCard({ icon, title, accentColor, delay = 0 }: ComingSoonQuickCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[18px] p-5 flex flex-col items-center justify-center gap-2 min-h-[130px] bg-muted/40 border border-border/50"
      aria-label={`${title} — coming soon`}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center opacity-40"
        style={{ background: `${accentColor}15` }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-muted-foreground/60">{title}</p>
      <span className="text-[11px] text-muted-foreground/40">🚧 Coming Soon</span>
    </motion.div>
  )
}

export const QuickAccessCards = memo(function QuickAccessCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" role="list" aria-label="Quick access">
      {/* Active cards */}
      <div role="listitem">
        <ActiveQuickCard
          icon={<BookOpen className="h-5 w-5" style={{ color: '#7C5CFC' }} />}
          title="Learning"
          description="Continue your roadmap"
          href="/dashboard/learning"
          accentColor="#7C5CFC"
          delay={0.6}
        />
      </div>
      <div role="listitem">
        <ActiveQuickCard
          icon={<Code2 className="h-5 w-5" style={{ color: '#22C55E' }} />}
          title="Coding"
          description="Today's challenge"
          href="/dashboard/coding"
          accentColor="#22C55E"
          delay={0.62}
        />
      </div>

      {/* Coming Soon cards */}
      <div role="listitem">
        <ComingSoonQuickCard
          icon={<FolderKanban className="h-5 w-5" style={{ color: '#FACC15' }} />}
          title="Projects"
          accentColor="#FACC15"
          delay={0.64}
        />
      </div>
      <div role="listitem">
        <ComingSoonQuickCard
          icon={<Briefcase className="h-5 w-5" style={{ color: '#EF4444' }} />}
          title="Placement"
          accentColor="#EF4444"
          delay={0.66}
        />
      </div>
      <div role="listitem">
        <ComingSoonQuickCard
          icon={<GraduationCap className="h-5 w-5" style={{ color: '#A78BFA' }} />}
          title="Core Subjects"
          accentColor="#A78BFA"
          delay={0.68}
        />
      </div>
      <div role="listitem">
        <ComingSoonQuickCard
          icon={<FileText className="h-5 w-5" style={{ color: '#38BDF8' }} />}
          title="Resume"
          accentColor="#38BDF8"
          delay={0.7}
        />
      </div>
    </div>
  )
})
