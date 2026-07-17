import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Code2, FolderKanban, Briefcase,
  CalendarDays, Bell, BarChart3, User, Settings, ChevronLeft,
  ChevronRight, Layers, GraduationCap, Image, HelpCircle, Star,
  HardDrive, Search, Clock, ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useManagerStore } from '@/manager/store/managerStore'
import { useAuthStore } from '@/shared/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
  collapsible?: boolean
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',      href: '/manager/dashboard',      icon: LayoutDashboard },
      { label: 'Search',         href: '/manager/search',          icon: Search },
      { label: 'Activity',       href: '/manager/activity',        icon: Clock },
    ],
  },
  {
    label: 'Content',
    collapsible: true,
    items: [
      { label: 'Learning',       href: '/manager/learning',        icon: BookOpen,      permission: 'learning' },
      { label: 'Coding',         href: '/manager/coding',          icon: Code2,         permission: 'coding' },
      { label: 'Projects',       href: '/manager/projects',        icon: FolderKanban,  permission: 'projects' },
      { label: 'Placements',     href: '/manager/placements',      icon: Briefcase,     permission: 'placements' },
      { label: 'Events',         href: '/manager/events',          icon: CalendarDays,  permission: 'events' },
    ],
  },
  {
    label: 'Site',
    collapsible: true,
    items: [
      { label: 'Banners',        href: '/manager/banners',         icon: Image },
      { label: 'FAQs',           href: '/manager/faq',             icon: HelpCircle },
      { label: 'Testimonials',   href: '/manager/testimonials',    icon: Star },
      { label: 'Media Library',  href: '/manager/media',           icon: HardDrive },
    ],
  },
  {
    label: 'Engage',
    items: [
      { label: 'Notifications',  href: '/manager/notifications',   icon: Bell,          permission: 'notifications' },
      { label: 'Reports',        href: '/manager/reports',         icon: BarChart3,     permission: 'reports' },
    ],
  },
]

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Profile',   href: '/manager/profile',   icon: User },
  { label: 'Settings',  href: '/manager/settings',  icon: Settings },
]

function NavGroupSection({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const location = useLocation()
  const { user } = useAuthStore()
  const permissions = user?.permissions ?? []
  const [open, setOpen] = useState(true)

  // Filter items by permission
  const visibleItems = group.items.filter((item) => !item.permission || permissions.includes(item.permission.toUpperCase()) || (user?.role === 'SUPER_ADMIN'))

  if (visibleItems.length === 0) return null

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => group.collapsible && setOpen((o) => !o)}
          className={cn(
            'w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest',
            group.collapsible ? 'text-slate-500 hover:text-slate-300 cursor-pointer' : 'text-slate-600 cursor-default'
          )}
        >
          <span>{group.label}</span>
          {group.collapsible && (
            <ChevronDown className={cn('w-3 h-3 transition-transform', !open && '-rotate-90')} />
          )}
        </button>
      )}
      {(!group.collapsible || open) && (
        <div className="space-y-0.5">
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href || (href !== '/manager/dashboard' && href !== '/manager/search' && href !== '/manager/activity' && location.pathname.startsWith(href))
            return (
              <NavLink
                key={href} to={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative',
                  isActive
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="whitespace-nowrap font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId={`manager-active-${href}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-r"
                  />
                )}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ManagerSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useManagerStore()
  const { user } = useAuthStore()
  const location = useLocation()

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MG'

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-slate-900 border-r border-slate-800 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-slate-800',
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-semibold text-white whitespace-nowrap">Manager Console</span>
                <p className="text-xs text-slate-500 whitespace-nowrap">Enterprise CMS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0">
        {NAV_GROUPS.map((group) => (
          <NavGroupSection key={group.label} group={group} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-slate-800 py-3 px-2 space-y-0.5">
        {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href
          return (
            <NavLink
              key={href} to={href}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150',
                isActive ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="whitespace-nowrap font-medium">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}

        {/* User card */}
        <div className={cn(
          'flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-lg bg-slate-800/50',
          sidebarCollapsed ? 'justify-center' : ''
        )}>
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-violet-700 text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.fullName || 'Manager'}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Manager'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-4 -right-3 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10 shadow-md"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
