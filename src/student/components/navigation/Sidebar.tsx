import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Code2, FolderKanban, Briefcase,
  Calendar, BarChart3, Bell, User, Settings, ChevronLeft, X,
  GraduationCap, ChevronDown, Library, Trophy, Star,
  MessageSquare, BarChart2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useSidebarStore } from '@/shared/store/sidebarStore'
import { useAuthStore } from '@/shared/store/authStore'
import { useNotificationStore } from '@/shared/store/notificationStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { getInitials } from '@/shared/lib/utils'

// ─── FPRD-16: Coding sub-nav (Phase 1) ────────────────────────────────────────
const codingSubItems = [
  { label: 'Home',            href: '/dashboard/coding',               exact: true },
  { label: 'Question Bank',   href: '/dashboard/coding/question-bank',             icon: Library },
  { label: 'Daily Challenge', href: '/dashboard/coding/daily',                     icon: Calendar },
  { label: 'Contests',        href: '/dashboard/coding/contests',                  icon: Trophy },
  { label: 'Favorites',       href: '/dashboard/coding/favorites',                 icon: Star },
  { label: 'Discussions',     href: '/dashboard/coding/discussions',               icon: MessageSquare },
  { label: 'Analytics',       href: '/dashboard/coding/analytics',                 icon: BarChart2 },
]

const baseNavItems = [
  { label: 'Dashboard',  href: '/dashboard',                          icon: LayoutDashboard },
  { label: 'Learning',   href: '/dashboard/learning',                 icon: BookOpen },
  { label: 'Coding',     href: '/dashboard/coding',                   icon: Code2 },
  { label: 'Projects',   href: '/dashboard/launching-soon/projects',  icon: FolderKanban, launchingSoon: true },
  { label: 'Placement',  href: '/dashboard/launching-soon/placement', icon: Briefcase,    launchingSoon: true },
  { label: 'Events',     href: '/dashboard/launching-soon/events',    icon: Calendar,     launchingSoon: true },
  { label: 'Analytics',  href: '/dashboard/launching-soon/analytics', icon: BarChart3,    launchingSoon: true },
  { label: 'Notifications', href: '/dashboard/notifications',         icon: Bell, badge: true },
  { label: 'Profile',    href: '/dashboard/profile',                  icon: User },
  { label: 'Settings',   href: '/dashboard/settings',                 icon: Settings },
]

interface SidebarContentProps {
  collapsed: boolean
}

function SidebarContent({ collapsed }: SidebarContentProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  // Keep coding sub-nav open whenever we're inside /dashboard/coding
  const isCodingActive = location.pathname.startsWith('/dashboard/coding')
  const [codingOpen, setCodingOpen] = useState(isCodingActive)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-border',
          collapsed && 'justify-center px-2',
        )}
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold text-foreground text-sm">CSE Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav aria-label="Main navigation">
          <ul className="space-y-1">
            {baseNavItems.map((item) => {
              const Icon = item.icon
              const isCoding = item.href === '/dashboard/coding'

              // Active logic
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href) &&
                    (location.pathname === item.href ||
                      location.pathname.startsWith(item.href + '/'))

              // ── Coding item: renders with collapsible sub-nav ─────────────
              if (isCoding && !collapsed) {
                return (
                  <li key={item.href}>
                    {/* Coding toggle row */}
                    <button
                      type="button"
                      onClick={() => setCodingOpen((v) => !v)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isCodingActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                      )}
                      aria-expanded={codingOpen}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">Coding</span>
                      <motion.div
                        animate={{ rotate: codingOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
                      </motion.div>
                    </button>

                    {/* Sub-nav */}
                    <AnimatePresence initial={false}>
                      {codingOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden ml-3 mt-0.5 pl-3 border-l border-border/60 space-y-0.5"
                        >
                          {codingSubItems.map((sub) => {
                            const subActive = sub.exact
                              ? location.pathname === sub.href
                              : location.pathname.startsWith(sub.href)
                            const SubIcon = sub.icon
                            return (
                              <li key={sub.href}>
                                <Link
                                  to={sub.href}
                                  className={cn(
                                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                    subActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                                  )}
                                  aria-current={subActive ? 'page' : undefined}
                                >
                                  {SubIcon && (
                                    <SubIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  )}
                                  {sub.label}
                                </Link>
                              </li>
                            )
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              }

              // ── Regular nav item ──────────────────────────────────────────
              const navLink = (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative group',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                    'launchingSoon' in item && item.launchingSoon && !isActive && 'opacity-70',
                    collapsed && 'justify-center px-2',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {'launchingSoon' in item && item.launchingSoon && !collapsed && (
                    <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/60 bg-muted/60 rounded px-1 py-0.5">
                      Soon
                    </span>
                  )}
                  {item.badge && unreadCount > 0 && !collapsed && (
                    <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                  {item.badge && unreadCount > 0 && collapsed && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              )

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                          {'launchingSoon' in item && item.launchingSoon && (
                            <span className="ml-1.5 text-[10px] opacity-70">· Soon</span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    navLink
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </ScrollArea>

      {/* User profile at bottom */}
      {user && (
        <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
          <Link
            to="/dashboard/profile"
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/10 transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.profileImage} alt={user.fullName} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden min-w-0"
                >
                  <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore()

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-full bg-card border-r border-border relative shrink-0"
        aria-label="Sidebar"
      >
        <SidebarContent collapsed={isCollapsed} />
        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full border bg-background shadow-sm z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.div>
        </Button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 h-full w-[260px] bg-card border-r border-border lg:hidden flex flex-col"
              aria-label="Mobile sidebar"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
