import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  BarChart3,
  Settings,
  FileSearch,
  Monitor,
  Sliders,
  User,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Activity,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAdminStore } from '@/admin/store/adminStore'
import { useAuthStore } from '@/shared/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Managers', href: '/admin/managers', icon: UserCog },
  { label: 'Permissions', href: '/admin/permissions', icon: Shield },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Platform', href: '/admin/platform', icon: Sliders },
  { label: 'Audit Logs', href: '/admin/audit', icon: FileSearch },
  { label: 'System Monitor', href: '/admin/system', icon: Monitor },
]

const bottomItems = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Profile', href: '/admin/profile', icon: User },
]

export function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAdminStore()
  const { user } = useAuthStore()
  const location = useLocation()

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA'

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-slate-950 border-r border-slate-800 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-4 border-b border-slate-800',
        sidebarCollapsed ? 'justify-center' : ''
      )}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Hexagon className="w-4 h-4 text-white" />
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
              <span className="text-sm font-bold text-white whitespace-nowrap tracking-tight">Super Admin</span>
              <p className="text-[10px] text-slate-500 whitespace-nowrap tracking-wide uppercase">Enterprise Console</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href || (href !== '/admin/dashboard' && location.pathname.startsWith(href))
          return (
            <NavLink
              key={href}
              to={href}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative',
                isActive
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} aria-hidden="true" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap font-medium text-sm"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="admin-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r"
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
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
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
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

        {/* User chip */}
        <div className={cn(
          'flex items-center gap-2.5 px-2.5 py-2 mt-1.5 rounded-lg',
          sidebarCollapsed ? 'justify-center' : ''
        )}>
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-blue-700 text-white text-[10px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-xs font-medium text-slate-300 truncate">{user?.fullName || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-600 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-500" aria-hidden="true" />
                  Online
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
        className="absolute top-4 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10 shadow-md"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
