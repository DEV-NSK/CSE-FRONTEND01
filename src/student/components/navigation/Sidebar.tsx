import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Code2, FolderKanban, Briefcase,
  Calendar, BarChart3, Bell, User, Settings, ChevronLeft, X, GraduationCap, Shield,
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

const baseNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Learning', href: '/dashboard/learning', icon: BookOpen },
  { label: 'Coding', href: '/dashboard/coding', icon: Code2 },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Placement', href: '/dashboard/placement', icon: Briefcase },
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: true },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarContentProps {
  collapsed: boolean
}

function SidebarContent({ collapsed }: SidebarContentProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  // PRD-08: Sidebar shows only student pages — role-gated routes are enforced at the router level
  // Admin panel link removed: SUPER_ADMIN uses /admin/* layout, not /dashboard/admin
  const navItems = baseNavItems

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', collapsed && 'justify-center px-2')}>
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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href) &&
                    // Prevent /dashboard/learning from matching /dashboard/learning-something
                    (location.pathname === item.href || location.pathname.startsWith(item.href + '/'))

              const navLink = (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative group',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                    collapsed && 'justify-center px-2'
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
                        <TooltipContent side="right">{item.label}</TooltipContent>
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
              collapsed && 'justify-center'
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
