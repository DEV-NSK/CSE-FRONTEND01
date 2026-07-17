import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { PageLoader } from '@/shared/components/feedback/LoadingSpinner'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** If provided, only users with one of these roles can access the route */
  allowedRoles?: UserRole[]
}

/**
 * PRD-08: ProtectedRoute
 *
 * - No token → redirect to /auth/login (preserves intended destination)
 * - Wrong role → redirect to /403 (not to dashboard)
 * - Loading (refreshUser in progress) → show PageLoader
 * - Role is always read from the store which was hydrated via /auth/me
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // PRD-08: Role guard — wrong role gets 403 page, not a dashboard redirect
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
