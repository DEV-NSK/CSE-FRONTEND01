import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/shared/store/authStore'
import { authService } from '@/shared/services/auth.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/managers': 'Manager Management',
  '/admin/permissions': 'Permission Management',
  '/admin/analytics': 'Platform Analytics',
  '/admin/platform': 'Platform Settings',
  '/admin/audit': 'Audit Logs',
  '/admin/system': 'System Monitor',
  '/admin/settings': 'Settings',
  '/admin/profile': 'Profile',
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
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA'

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="h-13 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-5 flex-shrink-0" style={{ height: '52px' }}>
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-200 hover:bg-slate-800" aria-label="Search">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-200 hover:bg-slate-800 relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="User menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-700 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700 text-slate-200">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200" onClick={() => navigate('/admin/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200" onClick={() => navigate('/admin/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-slate-800">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
