import { Menu, Bell, LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ThemeToggle } from '@/shared/components/common/ThemeToggle'
import { useSidebarStore } from '@/shared/store/sidebarStore'
import { useAuthStore } from '@/shared/store/authStore'
import { useNotificationStore } from '@/shared/store/notificationStore'
import { authService } from '@/shared/services/auth.service'
import { queryClient } from '@/shared/lib/queryClient'
import { getInitials } from '@/shared/lib/utils'

export function TopNav() {
  const { toggleMobile } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore errors on logout
    } finally {
      logout()
      queryClient.clear()
      navigate('/auth/login', { replace: true })
    }
  }

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      {/* Left: menu toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" asChild aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
          <Link to="/dashboard/notifications" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
            )}
          </Link>
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 focus-visible:ring-offset-0"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                  <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {user.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/admin" className="gap-2 text-primary">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
