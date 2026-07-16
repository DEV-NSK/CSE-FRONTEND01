import { useLocation } from 'react-router-dom'
import { Bell, Search, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/shared/store/authStore'
import { authService } from '@/shared/services/auth.service'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

const ROUTE_LABELS: Record<string, string> = {
  '/manager/dashboard': 'Dashboard',
  '/manager/learning': 'Learning Management',
  '/manager/coding': 'Coding Management',
  '/manager/projects': 'Project Management',
  '/manager/placements': 'Placement Management',
  '/manager/events': 'Event Management',
  '/manager/notifications': 'Notifications',
  '/manager/reports': 'Reports',
  '/manager/profile': 'Profile',
  '/manager/settings': 'Settings',
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = [{ label: 'Console', href: '/manager/dashboard' }]
  let path = ''
  for (const seg of segments) {
    path += `/${seg}`
    const label = ROUTE_LABELS[path] || seg.charAt(0).toUpperCase() + seg.slice(1)
    crumbs.push({ label, href: path })
  }
  return crumbs
}

export function ManagerHeader() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const breadcrumbs = getBreadcrumbs(location.pathname)
  const currentPage = ROUTE_LABELS[location.pathname] || 'Console'

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MG'

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-500'}>
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800" aria-label="Search">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="User menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-violet-600 text-white text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.fullName?.split(' ')[0] || 'Manager'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate('/manager/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/manager/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
