import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Code2, FolderKanban, Briefcase, ArrowRight,
  Zap, TrendingUp, CheckCircle2, Sparkles,
  GraduationCap, Shield, Globe, ChevronRight,
  Target, Brain, Rocket, BarChart3, Quote,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description: 'Curated roadmaps from fundamentals to advanced — progress tracked step by step with real lesson content.',
    accent: '#3b82f6',
  },
  {
    icon: Code2,
    title: 'Coding Practice',
    description: 'Solve 500+ DSA problems in an integrated editor with live test cases and instant verdict.',
    accent: '#8b5cf6',
  },
  {
    icon: FolderKanban,
    title: 'Project Showcase',
    description: 'Build, track and showcase real projects to demonstrate skills beyond the classroom.',
    accent: '#f59e0b',
  },
  {
    icon: Briefcase,
    title: 'Placement Prep',
    description: 'Resume uploads, mock interview prep, and a profile that speaks louder than a transcript.',
    accent: '#10b981',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Know your streaks, lessons done, problems solved — every metric in one clean dashboard.',
    accent: '#ec4899',
  },
  {
    icon: Zap,
    title: 'Fast & Focused',
    description: 'Zero clutter. Built for students who want results, not distractions.',
    accent: '#eab308',
  },
]

const stats = [
  { value: '500+', label: 'Coding Problems', accent: '#3b82f6' },
  { value: '50+', label: 'Learning Modules', accent: '#8b5cf6' },
  { value: 'Free', label: 'Forever Plan', accent: '#10b981' },
  { value: 'Beta', label: 'Early Access', accent: '#f59e0b' },
]

const howItWorks = [
  { step: '01', icon: Target, title: 'Create Account', description: 'Sign up free in seconds — no card required. Your dashboard is live instantly.', color: '#3b82f6' },
  { step: '02', icon: Brain, title: 'Follow a Roadmap', description: 'Pick Python, DSA, Web Dev and work through structured lessons at your pace.', color: '#8b5cf6' },
  { step: '03', icon: BarChart3, title: 'Practice & Track', description: 'Solve real problems, complete lessons, watch your stats grow in real time.', color: '#10b981' },
  { step: '04', icon: Rocket, title: 'Prep for Placement', description: 'Build your profile, sharpen your skills, and walk into interviews confident.', color: '#f59e0b' },
]

const whyUs = [
  { icon: Target, title: 'Built for CSE Students', description: 'Every feature is purpose-built for computer science undergrads — not generic learners.', color: '#3b82f6' },
  { icon: Brain, title: 'Structured Paths', description: 'No guessing what to study. Clear milestones, ordered content, no dead ends.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Real-Time Tracking', description: 'Live dashboard showing lessons done, problems solved, streak, XP — everything.', color: '#10b981' },
  { icon: Rocket, title: 'Practice That Counts', description: 'Problems mirror real interviews. Code editor, test cases, editorial — all built in.', color: '#f59e0b' },
]

/* ─── Dot-matrix background — navy dark / light slate light ──────────────── */
function DotBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base layer: dark navy in dark mode, very light slate in light mode */}
      <div className="absolute inset-0
        bg-[#0a1628]
        dark:bg-[#060d1a]
        [.light_&]:bg-[#f0f4ff]
      " />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage: 'radial-gradient(circle, #7cb9e8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Radial vignette — hides dots at edges */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(6,13,26,0.97) 100%)',
        }}
      />
      {/* Accent glows */}
      <div className="absolute left-1/4 top-1/3 w-[700px] h-[400px] rounded-full blur-[120px]
        bg-blue-600/20 dark:bg-blue-500/15" />
      <div className="absolute right-1/4 top-1/2 w-[500px] h-[300px] rounded-full blur-[100px]
        bg-indigo-500/15 dark:bg-indigo-400/10" />
    </div>
  )
}

/* ─── Section dot background (lighter, for body sections) ───────────────── */
function SectionDots({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 -z-10 overflow-hidden pointer-events-none', className)} aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  )
}

/* ─── Dashboard 3D preview mockup ────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block"
      style={{ perspective: '1200px' }}
    >
      {/* Outer glow halo */}
      <div className="absolute -inset-6 rounded-3xl blur-2xl
        bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-600/20
        dark:from-blue-400/20 dark:via-indigo-400/15 dark:to-purple-500/15" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)]
        border border-white/10 dark:border-white/5
        bg-[#0f172a] dark:bg-[#080e1a]"
        style={{ transform: 'rotateX(3deg) rotateY(-2deg)', transformStyle: 'preserve-3d' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-3 h-5 rounded-md bg-white/8 flex items-center px-3 gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400/60" />
            <span className="text-[10px] text-white/40 font-mono">campusrank.app/dashboard</span>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-4 space-y-3 w-[400px]">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-white/15" />
              <div className="h-2.5 w-20 rounded bg-white/8" />
            </div>
            <div className="h-8 w-28 rounded-full bg-blue-500/30 border border-blue-400/20" />
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-white/8">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Lessons', val: '5', c: '#3b82f6' },
              { label: 'Problems', val: '2', c: '#8b5cf6' },
              { label: 'Streak', val: '1d', c: '#f59e0b' },
              { label: 'XP', val: '40', c: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-2.5 bg-white/5 border border-white/8 text-center">
                <div className="text-sm font-bold mb-0.5" style={{ color: s.c }}>{s.val}</div>
                <div className="text-[9px] text-white/40">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Module rows */}
          <div className="space-y-2 pt-1">
            {[
              { name: 'Python Roadmap', pct: 9, c: '#3b82f6' },
              { name: 'Coding Practice', pct: 0, c: '#8b5cf6' },
              { name: 'Placement Prep', pct: 0, c: '#10b981' },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg shrink-0" style={{ background: `${m.c}22`, border: `1px solid ${m.c}33` }}>
                  <div className="h-full w-full rounded-lg flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: `${m.c}88` }} />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <div className="h-2.5 rounded bg-white/20" style={{ width: '60%' }} />
                    <span className="text-[9px]" style={{ color: `${m.c}cc` }}>{m.pct}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.c }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Quote Section ──────────────────────────────────────────────────────── */
function QuoteSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <SectionDots />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/8 via-indigo-600/5 to-purple-600/8 dark:from-blue-500/10 dark:via-indigo-500/6 dark:to-purple-500/10" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <Quote className="h-10 w-10 mx-auto mb-6 text-blue-500/40 dark:text-blue-400/30" />
        <blockquote className="text-2xl sm:text-3xl font-semibold leading-snug text-foreground tracking-tight">
          "The students who make it aren't always the smartest —
          they're the ones who show up{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
            consistently, with the right tools.
          </span>"
        </blockquote>
        <p className="mt-5 text-sm text-muted-foreground font-medium">
          — The idea behind CAMPUSRANK
        </p>
      </motion.div>
    </section>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-24 px-4 sm:px-6 lg:px-8">
        <DotBackground />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">

              {/* Badge */}
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                  bg-blue-500/10 border border-blue-400/20
                  text-blue-400 dark:text-blue-300 text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>India's Campus Tech Platform</span>
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Beta</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp} className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.07] tracking-tight text-white dark:text-white">
                  Rank Higher.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Grow Faster.
                  </span>
                  {' '}Land Better.
                </h1>
                <p className="text-lg text-white/60 dark:text-white/55 max-w-xl leading-relaxed">
                  CAMPUSRANK is the all-in-one platform built for CSE students —
                  structured learning, coding practice, and placement prep in one place.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="xl"
                  onClick={() => navigate('/auth/register')}
                  className="gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white border-0
                    shadow-[0_0_32px_rgba(59,130,246,0.4)] hover:shadow-[0_0_48px_rgba(59,130,246,0.5)]
                    transition-all active:scale-[0.98]"
                >
                  Start for Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="rounded-full border-white/15 text-white/80 hover:bg-white/8 hover:border-white/25 hover:text-white transition-all"
                >
                  Sign In
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 text-sm text-white/45">
                {[
                  { icon: Shield, text: 'No credit card required' },
                  { icon: GraduationCap, text: 'Free forever plan' },
                  { icon: Globe, text: 'Early access now' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: dashboard preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ══ QUOTE ═════════════════════════════════════════════════════════════ */}
      <QuoteSection />

      {/* ══ STATS BAR ═════════════════════════════════════════════════════════ */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-border/40 overflow-hidden">
        <SectionDots />
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map(({ value, label, accent }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div
                  className="inline-flex items-center justify-center h-11 w-11 rounded-xl mb-3 mx-auto"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ background: accent }} />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <SectionDots />
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">Everything you need</Badge>
              <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">
                Features built for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                  campus success
                </span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                From your first year to final placement — every tool you need, nothing you don't.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="group relative rounded-2xl p-6 overflow-hidden cursor-default
                    border border-border/50 bg-card/60 backdrop-blur-sm
                    hover:border-border hover:shadow-lg transition-all duration-200"
                >
                  {/* Hover accent glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 60% 40% at 30% 30%, ${f.accent}12, transparent)` }}
                  />
                  <div className="relative space-y-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: f.accent }} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    <div
                      className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1"
                      style={{ color: f.accent }}
                    >
                      Explore <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-y border-border/40">
        <div className="absolute inset-0 -z-10
          bg-gradient-to-br from-slate-50/80 via-background to-slate-50/60
          dark:from-[#070d1a]/90 dark:via-background dark:to-[#070d1a]/80" />
        <SectionDots />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">Simple process</Badge>
            <h2 className="text-4xl font-extrabold tracking-tight mb-3 text-foreground">
              How CAMPUSRANK works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four steps from zero to placement-ready.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {howItWorks.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  className="relative rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-6 space-y-4"
                >
                  {/* Connector arrow */}
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-9 -right-2.5 z-10 items-center justify-center
                      h-5 w-5 rounded-full bg-border/60 border border-border/30">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-4xl font-black text-muted-foreground/10 select-none">{item.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ WHY CAMPUSRANK ════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <SectionDots />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="secondary" className="px-3 py-1 text-sm">Why CAMPUSRANK</Badge>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                Built by students,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  for students
                </span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                CAMPUSRANK was born from one simple frustration — every useful tool was scattered across
                dozens of different platforms. We built the single destination that covers your full journey:
                learn, code, build, and land your first role.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Whether you're in your first year or final semester,
                CAMPUSRANK adapts to your pace. No fluff, no gatekeeping — just focused preparation.
              </p>
              <div className="flex gap-6 pt-2">
                {[
                  { val: '50+', sub: 'Learning modules', c: '#3b82f6' },
                  { val: '500+', sub: 'Coding problems', c: '#8b5cf6' },
                  { val: 'Free', sub: 'Forever plan', c: '#10b981' },
                ].map(({ val, sub, c }) => (
                  <div key={sub} className="space-y-0.5">
                    <p className="text-2xl font-extrabold" style={{ color: c }}>{val}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline" onClick={() => navigate('/about')}
                className="gap-2 rounded-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                Learn more about us <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Right: 2x2 benefit cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              {whyUs.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/50 bg-card/70 p-5 space-y-3
                    hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dark navy dot background for CTA */}
        <div className="absolute inset-0 -z-10
          bg-[#07101f]
          dark:bg-[#050c18]" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(circle, #7cb9e8 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(59,130,246,0.15),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mx-auto
            bg-blue-500/15 border border-blue-400/20">
            <GraduationCap className="h-8 w-8 text-blue-400" />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Ready to claim your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                campus rank?
              </span>
            </h2>
            <p className="text-lg text-white/55 max-w-xl mx-auto">
              Start for free — structured roadmaps, coding practice, and placement prep all waiting for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              onClick={() => navigate('/auth/register')}
              className="gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white border-0
                shadow-[0_0_48px_rgba(59,130,246,0.45)] hover:shadow-[0_0_64px_rgba(59,130,246,0.55)]
                transition-all active:scale-[0.98] min-w-[200px]"
            >
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/about')}
              className="rounded-full border-white/15 text-white/70 hover:bg-white/8 hover:border-white/25 hover:text-white transition-all"
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/35 pt-2">
            {[
              { icon: Shield, text: 'Secure & Private' },
              { icon: CheckCircle2, text: 'No Credit Card' },
              { icon: Globe, text: 'Access Anywhere' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-emerald-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  )
}
