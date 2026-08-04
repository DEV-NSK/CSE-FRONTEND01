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
              aria-label="CAMPUSRANK — Home"
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-200">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm tracking-tight font-extrabold">CAMPUSRANK</span>
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
                <span className="text-sm tracking-tight font-extrabold">CAMPUS RANK</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A comprehensive platform for CSE students to learn, code, build projects, and prepare for placements.
              </p>
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
            <p>© {new Date().getFullYear()} CAMPUSRANK. All rights reserved.</p>
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
