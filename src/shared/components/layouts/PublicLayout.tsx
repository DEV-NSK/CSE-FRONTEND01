import { Outlet, Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/shared/components/common/ThemeToggle'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/shared/store/authStore'
import { cn } from '@/shared/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export function PublicLayout() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="hidden sm:block">CSE Platform</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Public navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/auth/login')}>
                      Login
                    </Button>
                    <Button onClick={() => navigate('/auth/register')}>Get Started</Button>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              className="md:hidden border-t border-border overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-2" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <Button className="w-full" onClick={() => { navigate('/dashboard'); setMenuOpen(false) }}>
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" onClick={() => { navigate('/auth/login'); setMenuOpen(false) }}>
                        Login
                      </Button>
                      <Button className="w-full" onClick={() => { navigate('/auth/register'); setMenuOpen(false) }}>
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <motion.div
          key="public-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-bold">CSE Platform</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A comprehensive platform for CSE students to learn, code, build projects, and prepare for placements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth/login" className="hover:text-foreground transition-colors">Login</Link></li>
                <li><Link to="/auth/register" className="hover:text-foreground transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CSE Student Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
