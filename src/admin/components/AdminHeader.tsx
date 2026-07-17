import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, Search, Activity } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/shared/store/authStore'
import { authService } from '@/shared/services/auth.service'
import { queryClient } from '@/shared/lib/queryClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useAdminDashboard } from '@/shared/hooks/useAdminAnalytics'
import { cn } from '@/shared/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/admin':             'Admin',
  '/admin/dashboard':   'Dashboard',
  '/admin/users':       'User Management',
  '/admin/managers':    'Manager Management',
  '/admin/permissions': 'Permission Management',
  '/admin/analytics':   'Platform Analytics',
  '/admin/platform':    'Platform Settings',
  '/admin/audit':       'Audit Logs',
  '/admin/system':      'System Monitor',
  '/admin/settings':    'Settings',
  '/admin/profile':     'Profile',
}

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [{ label: 'Admin', href: '/admin/dashboard' }]
  const label = ROUTE_LABELS[pathname]
  if (label && pathname !== '/admin' && pathname !== '/admin/dashboard') {
    crumbs.push({ label, href: pathname })
  }
  return crumbs
}

export function AdminHeader() {
  const location      = useLocation()
  const { user, logout } = useAuthStore()
  const navigate      = useNavigate()
  const breadcrumbs   = getBreadcrumbs(location.pathname)

  // Live data from dashboard — unread notifications + active users
  const { data: overview } = useAdminDashboard()
  const unreadCount   = overview?.notifications?.unread ?? 0
  const activeToday   = overview?.activity?.onlineToday ?? 0

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA'

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout()
    queryClient.clear()
    navigate('/auth/login', { replace: true })
  }

  return (
    <header
      className="border-b border-slate-800 bg-slate-900 flex items-center justify-between px-5 flex-shrink-0"
      style={{ height: '52px' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Live active users pill */}
        {activeToday > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/20 border border-emerald-700/20 rounded-full">
            <Activity className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            <span className="text-[10px] font-medium text-emerald-400">
              {activeToday.toLocaleString()} online today
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Bell with live unread badge */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-200 hover:bg-slate-800 relative"
          aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold leading-none',
                unreadCount > 9 ? 'text-[8px] w-4 h-4' : 'w-3.5 h-3.5 text-[9px]',
              )}
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount > 9 ? unreadCount : unreadCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="User menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={(user as unknown as Record<string, string>)?.profileImage ?? undefined} />
                <AvatarFallback className="bg-blue-700 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {user?.fullName?.split(' ')[0] || 'Admin'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-slate-900 border-slate-700 text-slate-200">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              {overview && (
                <p className="text-[10px] text-slate-600 mt-1">
                  {overview.users.total.toLocaleString()} total users
                </p>
              )}
            </div>
            <DropdownMenuItem
              className="focus:bg-slate-800 focus:text-slate-200"
              onClick={() => navigate('/admin/profile')}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-slate-800 focus:text-slate-200"
              onClick={() => navigate('/admin/settings')}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 focus:text-red-400 focus:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
