import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { getDashboardPath } from '@/types'

interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * PRD-08: PublicRoute
 * Authenticated users cannot visit login/register pages.
 * Redirects to the correct dashboard based on their role.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return <>{children}</>
}
