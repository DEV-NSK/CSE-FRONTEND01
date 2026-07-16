import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  FolderKanban,
  Briefcase,
  CalendarDays,
  Bell,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useManagerStore } from '@/manager/store/managerStore'
import { useAuthStore } from '@/shared/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

const navItems = [
  { label: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
  { label: 'Learning', href: '/manager/learning', icon: BookOpen },
  { label: 'Coding', href: '/manager/coding', icon: Code2 },
  { label: 'Projects', href: '/manager/projects', icon: FolderKanban },
  { label: 'Placements', href: '/manager/placements', icon: Briefcase },
  { label: 'Events', href: '/manager/events', icon: CalendarDays },
  { label: 'Notifications', href: '/manager/notifications', icon: Bell },
  { label: 'Reports', href: '/manager/reports', icon: BarChart3 },
]

const bottomItems = [
  { label: 'Profile', href: '/manager/profile', icon: User },
  { label: 'Settings', href: '/manager/settings', icon: Settings },
]

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
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-semibold text-white whitespace-nowrap">Manager Console</span>
                <p className="text-xs text-slate-500 whitespace-nowrap">Content Management</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href || (href !== '/manager/dashboard' && location.pathname.startsWith(href))
          return (
            <NavLink
              key={href}
              to={href}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative',
                isActive
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300')} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap font-medium"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="manager-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-r"
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Divider + bottom items */}
      <div className="border-t border-slate-800 py-3 px-2 space-y-0.5">
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href
          return (
            <NavLink
              key={href}
              to={href}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap font-medium"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}

        {/* User */}
        <div className={cn(
          'flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-lg bg-slate-800/50',
          sidebarCollapsed ? 'justify-center' : ''
        )}>
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-violet-700 text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-xs font-medium text-white truncate">{user?.fullName || 'Manager'}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Manager
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
