import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/shared/components/common/ThemeToggle'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/shared/store/authStore'
import { getDashboardPath } from '@/types'
import { cn } from '@/shared/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

const footerLinks = {
  Product: [
    { label: 'Learning', href: '/dashboard/learning' },
    { label: 'Coding Practice', href: '/dashboard/coding' },
    { label: 'Python Roadmap', href: '/dashboard/learning/roadmaps/python' },
  ],
  Resources: [
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Account: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Create Account', href: '/auth/register' },
  ],
}

export function PublicLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const dashPath = getDashboardPath(user?.role)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'border-b border-border/50 glass shadow-sm shadow-black/5'
            : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 font-bold text-foreground group"
              aria-label="CSE Ground — Home"
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-200">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm tracking-tight">
                <span className="font-extrabold">CSE</span>
                <span className="font-medium text-muted-foreground"> Ground</span>
              </span>
            </Link>

            {/* Desktop nav — centered */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150',
                    isActive(link.href)
                      ? 'text-foreground bg-accent/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10',
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate(dashPath)}
                    className="gap-1.5 rounded-full h-9 px-5 text-sm"
                  >
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/auth/login')}
                      className="h-9 px-4 text-sm rounded-full"
                    >
                      Sign in
                    </Button>
                    <Button
                      onClick={() => navigate('/auth/register')}
                      className="h-9 px-5 text-sm rounded-full gap-1.5 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-lg"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={menuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="md:hidden border-t border-border/50 overflow-hidden glass"
            >
              <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/10',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  {isAuthenticated ? (
                    <Button
                      className="w-full rounded-xl gap-1.5"
                      onClick={() => navigate(dashPath)}
                    >
                      Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => navigate('/auth/login')}
                      >
                        Sign in
                      </Button>
                      <Button
                        className="w-full rounded-xl gap-1.5"
                        onClick={() => navigate('/auth/register')}
                      >
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-foreground w-fit">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-sm tracking-tight">
                  <span className="font-extrabold">CSE</span>
                  <span className="font-medium text-muted-foreground"> Ground</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A comprehensive platform for CSE students to learn, code, build projects, and prepare for placements.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {[
                  {
                    label: 'GitHub',
                    href: '#',
                    svg: (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'X (Twitter)',
                    href: '#',
                    svg: (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'LinkedIn',
                    href: '#',
                    svg: (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                ].map(({ label, href, svg }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors duration-150"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h4 className="font-semibold text-sm text-foreground mb-4">{group}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        to={href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CSE Ground. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/faq" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
