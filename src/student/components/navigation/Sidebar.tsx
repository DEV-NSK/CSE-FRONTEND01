import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Code2, FolderKanban, Briefcase,
  Calendar, BarChart3, Bell, User, Settings, ChevronLeft, X,
  GraduationCap, ChevronDown, Library, Trophy, Star,
  MessageSquare, BarChart2, Zap,
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

// ─── Nav structure ────────────────────────────────────────────────────────────

const codingSubItems = [
  { label: 'Overview',       href: '/dashboard/coding',               exact: true },
  { label: 'Question Bank',  href: '/dashboard/coding/question-bank', icon: Library },
  { label: 'Daily Challenge',href: '/dashboard/coding/daily',         icon: Calendar },
  { label: 'Contests',       href: '/dashboard/coding/contests',      icon: Trophy },
  { label: 'Favorites',      href: '/dashboard/coding/favorites',     icon: Star },
  { label: 'Discussions',    href: '/dashboard/coding/discussions',   icon: MessageSquare },
  { label: 'Analytics',      href: '/dashboard/coding/analytics',     icon: BarChart2 },
]

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: boolean
  launchingSoon?: boolean
  subItems?: typeof codingSubItems
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Learning',  href: '/dashboard/learning', icon: BookOpen },
  { label: 'Coding',    href: '/dashboard/coding',   icon: Code2, subItems: codingSubItems },
]

const comingSoonItems: NavItem[] = [
  { label: 'Projects',   href: '/dashboard/launching-soon/projects',  icon: FolderKanban, launchingSoon: true },
  { label: 'Placement',  href: '/dashboard/launching-soon/placement', icon: Briefcase,    launchingSoon: true },
  { label: 'Events',     href: '/dashboard/launching-soon/events',    icon: Calendar,     launchingSoon: true },
  { label: 'Analytics',  href: '/dashboard/launching-soon/analytics', icon: BarChart3,    launchingSoon: true },
]

const bottomNavItems: NavItem[] = [
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell,     badge: true },
  { label: 'Profile',       href: '/dashboard/profile',       icon: User },
  { label: 'Settings',      href: '/dashboard/settings',      icon: Settings },
]

// ─── Single nav row ───────────────────────────────────────────────────────────

interface NavRowProps {
  item: NavItem
  collapsed: boolean
  unreadCount: number
  depth?: number
}

function NavRow({ item, collapsed, unreadCount, depth = 0 }: NavRowProps) {
  const location   = useLocation()
  const [open, setOpen] = useState(() =>
    location.pathname.startsWith(item.href + '/') || location.pathname === item.href,
  )
  const hasChildren = !!item.subItems?.length

  const isActive =
    item.href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname === item.href ||
        location.pathname.startsWith(item.href + '/')

  const isGroupActive = hasChildren && location.pathname.startsWith(item.href)

  const Icon = item.icon

  const baseClasses = cn(
    'group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150 select-none',
    depth === 0 ? 'px-3 py-2.5' : 'px-2.5 py-1.5 ml-3 text-[12px]',
    collapsed && 'justify-center px-0 py-2.5',
    // Active state
    isActive && !hasChildren
      ? 'bg-primary/12 text-primary'
      : isGroupActive && hasChildren
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
    item.launchingSoon && !isActive && 'opacity-50',
  )

  const linkContent = (
    <>
      {/* Active pill indicator */}
      {isActive && !hasChildren && !collapsed && (
        <motion.span
          layoutId="active-pill"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <span className={cn(
        'shrink-0 flex items-center justify-center rounded-lg transition-colors duration-150',
        depth === 0 ? 'h-8 w-8' : 'h-6 w-6',
        isActive && !hasChildren
          ? 'bg-primary/15 text-primary'
          : isGroupActive && hasChildren
          ? 'text-primary'
          : 'text-muted-foreground group-hover:text-foreground',
      )}>
        <Icon className={depth === 0 ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5'} aria-hidden="true" />
      </span>

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badges / Soon / chevron */}
      {!collapsed && (
        <>
          {item.launchingSoon && (
            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 shrink-0">
              Soon
            </span>
          )}
          {item.badge && unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto text-[10px] h-4 min-w-[1rem] px-1 shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {hasChildren && (
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto shrink-0 text-muted-foreground/50"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </>
      )}

      {/* Collapsed: notification dot */}
      {collapsed && item.badge && unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
      )}
    </>
  )

  const wrapWithTooltip = (node: React.ReactNode) => {
    if (!collapsed) return <>{node}</>
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{node as React.ReactElement}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
            {item.launchingSoon && <span className="ml-1.5 opacity-60">· Soon</span>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (hasChildren) {
    return (
      <li>
        {wrapWithTooltip(
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={cn(baseClasses, 'w-full text-left')}
            aria-expanded={open}
          >
            {linkContent}
          </button>,
        )}
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden mt-0.5 space-y-0.5 border-l border-border/50 ml-6"
            >
              {item.subItems!.map(sub => {
                const SubIcon = sub.icon
                const subActive = sub.exact
                  ? location.pathname === sub.href
                  : location.pathname.startsWith(sub.href)
                return (
                  <li key={sub.href}>
                    <Link
                      to={sub.href}
                      className={cn(
                        'relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 ml-2',
                        subActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                      )}
                      aria-current={subActive ? 'page' : undefined}
                    >
                      {subActive && (
                        <motion.span
                          layoutId="sub-active-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          aria-hidden="true"
                        />
                      )}
                      {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
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

  return (
    <li>
      {wrapWithTooltip(
        <Link to={item.href} className={baseClasses} aria-current={isActive ? 'page' : undefined}>
          {linkContent}
        </Link>,
      )}
    </li>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SidebarSection({
  label,
  collapsed,
  children,
}: {
  label: string
  collapsed: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mt-4 first:mt-0">
      {!collapsed && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {label}
        </p>
      )}
      {collapsed && <div className="mx-3 mb-1 h-px bg-border/60" />}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

// ─── SidebarContent ───────────────────────────────────────────────────────────

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { user }        = useAuthStore()
  const { unreadCount } = useNotificationStore()

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-border',
        collapsed && 'justify-center px-2',
      )}>
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm"
        >
          <GraduationCap className="h-5 w-5" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-foreground text-sm tracking-tight leading-none">CAMPUSRANK</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Student Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav aria-label="Main navigation" className="space-y-0">
          {/* Main */}
          <SidebarSection label="Menu" collapsed={collapsed}>
            {mainNavItems.map(item => (
              <NavRow key={item.href} item={item} collapsed={collapsed} unreadCount={unreadCount} />
            ))}
          </SidebarSection>

          {/* Coming soon */}
          <SidebarSection label="Coming Soon" collapsed={collapsed}>
            {comingSoonItems.map(item => (
              <NavRow key={item.href} item={item} collapsed={collapsed} unreadCount={0} />
            ))}
          </SidebarSection>

          {/* Account */}
          <SidebarSection label="Account" collapsed={collapsed}>
            {bottomNavItems.map(item => (
              <NavRow key={item.href} item={item} collapsed={collapsed} unreadCount={unreadCount} />
            ))}
          </SidebarSection>
        </nav>
      </ScrollArea>

      {/* ── User footer ──────────────────────────────────────────────────── */}
      {user && (
        <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
          <Link
            to="/dashboard/profile"
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/70 transition-all duration-150 group',
              collapsed && 'justify-center',
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 ring-2 ring-border group-hover:ring-primary/40 transition-all duration-150">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              {/* Online dot */}
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"
                aria-hidden="true"
              />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden min-w-0 flex-1"
                >
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Zap className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" aria-hidden="true" />
            )}
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar shell ────────────────────────────────────────────────────────────

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore()

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: isCollapsed ? 68 : 256 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full bg-card border-r border-border relative shrink-0 overflow-hidden"
        aria-label="Sidebar"
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCollapsed}
          className="absolute -right-3 top-[76px] h-6 w-6 rounded-full border border-border bg-background shadow-sm z-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.28 }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.span>
        </motion.button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border lg:hidden flex flex-col"
              aria-label="Mobile sidebar"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
