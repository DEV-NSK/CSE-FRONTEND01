import { Menu, Bell, LogOut, User, Settings, ChevronDown, Shield, GraduationCap, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
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
import { getInitials, cn } from '@/shared/lib/utils'

// ─── Breadcrumb helpers ───────────────────────────────────────────────────────

interface BreadcrumbSegment {
  label: string
  href?: string
}

/**
 * Maps a URL path segment to a human-readable label.
 * Handles slugs like "python" → "Python Roadmap", "lesson" → "Lesson", etc.
 */
function segmentToLabel(segment: string, index: number, allSegments: string[]): string {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    learning: 'Learning',
    roadmaps: 'Roadmaps',
    lesson: 'Lesson',
    search: 'Search',
    bookmarks: 'Bookmarks',
    recent: 'Recently Viewed',
    coding: 'Coding',
    profile: 'Profile',
    edit: 'Edit Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    admin: 'Admin Panel',
    'question-bank': 'Question Bank',
    daily: 'Daily Challenge',
    contests: 'Contests',
    favorites: 'Favorites',
    discussions: 'Discussions',
    analytics: 'Analytics',
    'launching-soon': 'Coming Soon',
    projects: 'Projects',
    placement: 'Placement',
    events: 'Events',
    resume: 'Resume',
    u: 'Profile',
  }

  if (map[segment]) return map[segment]

  // If previous segment was "roadmaps", treat as a roadmap slug → "Python Roadmap"
  if (index > 0 && allSegments[index - 1] === 'roadmaps') {
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Roadmap'
  }

  // If previous segment was "lesson", it's a lesson ID — use a short label
  if (index > 0 && allSegments[index - 1] === 'lesson') {
    return 'Lesson'
  }

  // Default: capitalise each word of a kebab-case slug
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const location = useLocation()

  // Remove leading slash and split
  const parts = location.pathname.replace(/^\//, '').split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbSegment[] = []

  // Build cumulative paths and labels
  parts.forEach((segment, index) => {
    const href = '/' + parts.slice(0, index + 1).join('/')
    const label = segmentToLabel(segment, index, parts)

    // Skip UUIDs or very long random IDs (shown as previous segment label instead)
    const isUuid = /^[0-9a-f-]{20,}$/i.test(segment)
    if (isUuid) return

    const isLast = index === parts.length - 1
    breadcrumbs.push({ label, href: isLast ? undefined : href })
  })

  return breadcrumbs
}

// ─── Breadcrumb component ─────────────────────────────────────────────────────

function TopNavBreadcrumb() {
  const breadcrumbs = useBreadcrumbs()

  if (breadcrumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center">
      <ol className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast || !crumb.href ? (
                <span
                  className={cn(
                    'font-medium truncate max-w-[160px]',
                    isLast ? 'text-foreground' : 'text-muted-foreground',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-150 truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

export function TopNav() {
  const { toggleMobile } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    } finally {
      logout()
      queryClient.clear()
      navigate('/auth/login', { replace: true })
    }
  }

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-3 sm:px-4 gap-2 sticky top-0 z-30">
      {/* ── Left: hamburger + logo + breadcrumb ── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="lg:hidden shrink-0 h-9 w-9"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo — desktop only (sidebar already shows it) */}
        <Link
          to="/dashboard"
          className="hidden lg:flex items-center gap-2 shrink-0 group"
          aria-label="CAMPUSRANK — Go to Dashboard"
        >
          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary text-primary-foreground transition-opacity duration-150 group-hover:opacity-80">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm text-foreground">CAMPUSRANK</span>
        </Link>

        {/* Mobile: small logo text */}
        <Link
          to="/dashboard"
          className="lg:hidden flex items-center gap-1.5 shrink-0"
          aria-label="CAMPUSRANK"
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-xs text-foreground">CAMPUSRANK</span>
        </Link>

        {/* Divider between logo and breadcrumb */}
        <span className="hidden lg:block h-4 w-px bg-border" aria-hidden="true" />

        {/* Breadcrumb */}
        <TopNavBreadcrumb />
      </div>

      {/* ── Right: theme toggle, notifications, user dropdown ── */}
      <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
        <ThemeToggle />

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Link to="/dashboard/notifications" className="relative">
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"
                aria-hidden="true"
              />
            )}
          </Link>
        </Button>

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 px-1.5 sm:px-2 h-9"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7 ring-2 ring-border">
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium truncate max-w-[100px]">
                  {user.fullName?.split(' ')[0]}
                </span>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
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

              {user.role === 'SUPER_ADMIN' && (
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
