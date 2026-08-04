import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Code2, FolderKanban, Briefcase, ArrowRight,
  Zap, TrendingUp, CheckCircle2, Sparkles, Users, Star,
  GraduationCap, Shield, Globe, ChevronRight,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description: 'Follow curated roadmaps designed specifically for CSE students with hands-on exercises and progress tracking.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: Code2,
    title: 'Coding Practice',
    description: 'Solve algorithmic problems with an integrated editor, real-time test cases, and detailed editorial solutions.',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/10',
  },
  {
    icon: FolderKanban,
    title: 'Project Showcase',
    description: 'Build real-world projects, track your progress, and showcase your portfolio to top recruiters.',
    color: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-500/10',
  },
  {
    icon: Briefcase,
    title: 'Placement Prep',
    description: 'Ace interviews with aptitude tests, resume builder, mock interviews, and company-specific preparation.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Detailed insights into your learning journey with actionable, AI-powered recommendations.',
    color: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-500/10',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description: 'A blazing-fast experience on any device — mobile, tablet, or desktop — with offline support.',
    color: 'from-yellow-500/20 to-yellow-600/10',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-500/10',
  },
]

const stats = [
  { value: '10k+', label: 'Students Enrolled', icon: Users },
  { value: '500+', label: 'Coding Problems', icon: Code2 },
  { value: '50+', label: 'Learning Modules', icon: BookOpen },
  { value: '4.9★', label: 'Average Rating', icon: Star },
]

const testimonials = [
  {
    quote: 'CAMPUSRANK completely transformed how I approach coding interviews. The structured roadmaps made everything click.',
    name: 'Aditya Sharma',
    title: 'SDE at Google',
    initials: 'AS',
    color: 'bg-blue-500',
  },
  {
    quote: 'The Python roadmap is hands-down the best structured learning path I have followed. Clear, practical, and effective.',
    name: 'Priya Nair',
    title: 'Software Engineer at Amazon',
    initials: 'PN',
    color: 'bg-purple-500',
  },
  {
    quote: 'From zero to landing my dream job — this platform guided every step with real problems and instant feedback.',
    name: 'Rahul Verma',
    title: 'Full-Stack Developer at Swiggy',
    initials: 'RV',
    color: 'bg-emerald-500',
  },
]

const trustBadges = [
  { icon: Shield, text: 'No credit card required' },
  { icon: GraduationCap, text: 'Free forever plan' },
  { icon: Globe, text: 'Early access now' },
]

/* ─── Floating Orb Decoration ────────────────────────────────────────────── */
function HeroOrbs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute left-1/4 top-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[80px] -translate-y-1/2" />
      <div className="absolute right-1/4 bottom-0 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[80px] translate-y-1/3" />
      <div className="absolute left-3/4 top-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/6 blur-[60px]" />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  )
}

/* ─── Dashboard mockup visual ─────────────────────────────────────────────── */
function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      className="relative hidden lg:block"
    >
      <div className="animate-float relative">
        {/* Outer glow ring */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 blur-xl" />
        {/* Card */}
        <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/40">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 mx-2 h-4 rounded bg-border/60 text-[10px] text-muted-foreground flex items-center px-2">
              cseground.dev/dashboard
            </div>
          </div>
          {/* Mockup body */}
          <div className="p-5 space-y-4 w-[340px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-28 rounded bg-foreground/10 mb-1.5" />
                <div className="h-3 w-20 rounded bg-muted-foreground/20" />
              </div>
              <div className="h-9 w-24 rounded-full bg-primary/20" />
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-primary to-purple-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Learning', 'Coding', 'Projects'].map((t, i) => (
                <div key={t} className={cn('rounded-xl p-3 text-center', i === 0 ? 'bg-blue-500/10' : i === 1 ? 'bg-purple-500/10' : 'bg-orange-500/10')}>
                  <div className="h-6 w-6 rounded-full bg-current opacity-20 mx-auto mb-1.5" />
                  <div className="text-[10px] font-medium text-muted-foreground">{t}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              {[70, 45, 85].map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className={`h-2.5 rounded bg-muted-foreground/20`} style={{ width: `${w}%` }} />
                    <div className="h-2 w-16 rounded bg-muted-foreground/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-24 px-4 sm:px-6 lg:px-8">
        <HeroOrbs />
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left column */}
            <motion.div
              className="space-y-8"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp} className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Built for CSE Students</span>
                  <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1.5 ml-0.5 font-semibold rounded-full">Beta</Badge>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-5">
                <h1 className="text-display text-foreground">
                  Your Complete Platform for{' '}
                  <span className="gradient-text">Tech Success</span>
                </h1>
                <p className="text-body-lg text-muted-foreground max-w-xl">
                  Learn, code, build projects, and land your dream job — all in one place.
                  The ultimate platform for Computer Science Engineering students.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="xl"
                  onClick={() => navigate('/auth/register')}
                  className="gap-2 rounded-full btn-glow shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                {trustBadges.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right column — dashboard visual */}
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-border/50 bg-card/40 px-4 sm:px-6 lg:px-8" aria-label="Platform statistics">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 mx-auto mb-3">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" aria-label="Features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">Everything you need</Badge>
              <h2 className="text-heading-1 mb-4">Features built for students</h2>
              <p className="text-body text-muted-foreground">
                From your first year to placement, we've got every step covered with tools that actually work.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.18 }}
                  className="group relative rounded-2xl border border-border/60 bg-card p-6 card-elevated cursor-default overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br', feature.color)} />
                  <div className="relative space-y-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', feature.iconBg)}>
                      <Icon className={cn('h-6 w-6', feature.iconColor)} aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1">
                      Learn more <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50" aria-label="Testimonials">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">Student Stories</Badge>
            <h2 className="text-heading-1 mb-3">What our students say</h2>
            <p className="text-muted-foreground text-body max-w-xl mx-auto">
              Real stories from real students who transformed their careers with CAMPUSRANK.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="rounded-2xl bg-card border border-border/60 p-6 card-elevated space-y-4"
              >
                <div className="flex gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground leading-relaxed italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3 pt-1">
                  <div className={cn('h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0', t.color)}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-label="Call to action">
        {/* Background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/8 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
            <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h2 className="text-heading-1 text-foreground">
              Ready to start your{' '}
              <span className="gradient-text">journey?</span>
            </h2>
            <p className="text-body text-muted-foreground max-w-xl mx-auto">
              Join thousands of CSE students who are accelerating their careers. Free to get started, no credit card needed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              onClick={() => navigate('/auth/register')}
              className="gap-2 rounded-full btn-glow shadow-xl shadow-primary/30 hover:opacity-95 active:scale-[0.98] transition-all min-w-[200px]"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/about')}
              className="rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
            {[
              { icon: Shield, text: 'Secure & Private' },
              { icon: CheckCircle2, text: 'No Credit Card' },
              { icon: Globe, text: 'Access Anywhere' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-success" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  )
}
