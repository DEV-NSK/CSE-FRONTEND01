import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Code2, TrendingUp, CheckCircle2, ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/shared/components/common/ThemeToggle'

const highlights = [
  { icon: BookOpen,   text: 'Structured Python & DSA roadmaps' },
  { icon: Code2,      text: '500+ coding problems with solutions' },
  { icon: TrendingUp, text: 'Progress tracking & analytics' },
  { icon: CheckCircle2, text: 'Placement prep & mock interviews' },
]

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-700">
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-white/5 -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-white/3 -translate-x-1/2 -translate-y-1/2" />
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 w-fit group">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 text-white backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-none tracking-tight">CSE Ground</p>
            <p className="text-white/60 text-[11px] leading-none mt-0.5">Student Platform</p>
          </div>
        </Link>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative space-y-8"
        >
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Accelerate your <br />tech career
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              The all-in-one platform to learn, practice, and land your dream job in tech.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-sm text-white/85 font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Quote */}
        <div className="relative">
          <blockquote className="border-l-2 border-white/30 pl-4 text-white/70 text-sm italic leading-relaxed">
            "CSE Ground helped me crack my Google interview. The structured roadmaps made everything clear."
          </blockquote>
          <p className="mt-2 text-white/50 text-xs pl-4">— Aditya S., SDE at Google</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            to="/"
            className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-sm text-foreground">CSE Ground</span>
            </div>

            <Outlet />
          </motion.div>
        </main>

        <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} CSE Ground · All rights reserved.
        </footer>
      </div>
    </div>
  )
}
