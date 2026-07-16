import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/shared/components/common/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>CSE Platform</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CSE Student Platform · All rights reserved.
      </footer>
    </div>
  )
}
