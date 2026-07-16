import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { isManager, isSuperAdmin } from '@/types'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    if (isSuperAdmin(user.role)) return <Navigate to="/admin/dashboard" replace />
    if (isManager(user.role)) return <Navigate to="/manager/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
