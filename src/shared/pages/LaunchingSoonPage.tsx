import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Rocket, ArrowLeft, BookOpen, Sparkles,
  FolderKanban, Briefcase, Calendar, BarChart3, Bell,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

// ─── Module metadata ──────────────────────────────────────────────────────────

const MODULE_META: Record<
  string,
  {
    icon: React.ElementType
    label: string
    description: string
    gradient: string
    accentColor: string
  }
> = {
  projects: {
    icon: FolderKanban,
    label: 'Projects',
    description:
      'Collaborate with teammates, manage tasks, track milestones, and build real-world projects — all in one place.',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    accentColor: 'text-violet-500',
  },
  placement: {
    icon: Briefcase,
    label: 'Placement',
    description:
      'Browse curated job listings, track your applications, build your resume, and prepare for interviews with industry-ready tools.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accentColor: 'text-emerald-500',
  },
  events: {
    icon: Calendar,
    label: 'Events',
    description:
      'Discover hackathons, workshops, webinars, and career fairs. Register, network, and grow your professional community.',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    accentColor: 'text-pink-500',
  },
  analytics: {
    icon: BarChart3,
    label: 'Analytics',
    description:
      'Deep-dive insights across your learning journey, coding performance, and placement progress with rich visual dashboards.',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    accentColor: 'text-amber-500',
  },
  notifications: {
    icon: Bell,
    label: 'Notifications',
    description:
      'Stay informed about your activity, team updates, job alerts, and platform announcements in real time.',
    gradient: 'from-blue-500 via-sky-500 to-cyan-400',
    accentColor: 'text-blue-500',
  },
}

const DEFAULT_META = {
  icon: Rocket,
  label: 'Feature',
  description:
    "We're building something amazing here. This feature is currently under development and will be available in an upcoming release.",
  gradient: 'from-primary via-primary/80 to-secondary',
  accentColor: 'text-primary',
}

// ─── Floating particle dots ────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  delay: Math.random() * 2,
  duration: Math.random() * 4 + 3,
}))

// ─── Component ────────────────────────────────────────────────────────────────

export function LaunchingSoonPage() {
  const { module } = useParams<{ module?: string }>()
  const meta = (module && MODULE_META[module]) ?? DEFAULT_META
  const ModuleIcon = meta.icon

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Radial gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-[0.06] pointer-events-none`}
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full bg-gradient-to-br ${meta.gradient} opacity-20`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* Icon blob */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${meta.gradient} blur-xl opacity-30 scale-150`}
              aria-hidden="true"
            />
            <div
              className={`relative h-28 w-28 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-2xl`}
            >
              <ModuleIcon className="h-14 w-14 text-white" aria-hidden="true" />
            </div>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <Badge
            variant="secondary"
            className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Coming Soon
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4"
        >
          {meta.label} — Launching Soon
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-base leading-relaxed mb-3 max-w-md mx-auto"
        >
          {meta.description}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-muted-foreground/70 mb-10"
        >
          We're building something amazing. This feature is currently under development and will
          be available in an upcoming release.{' '}
          <span className="font-medium text-foreground/60">
            Thank you for being an early user of the CSE Platform.
          </span>
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="mb-10 mx-auto max-w-xs origin-left"
        >
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Development Progress</span>
            <span>60%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
            />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="gap-2 w-full sm:w-auto shadow-lg">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link to="/dashboard/learning">
              <BookOpen className="h-4 w-4" />
              Continue Learning
            </Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            disabled
            className="gap-2 w-full sm:w-auto text-muted-foreground cursor-not-allowed"
            aria-label="Notify me — coming soon"
          >
            <Bell className="h-4 w-4" />
            Notify Me
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
