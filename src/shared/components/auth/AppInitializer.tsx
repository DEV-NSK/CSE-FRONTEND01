import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/shared/store/authStore'

/**
 * PRD-08: AppInitializer
 *
 * Mounts once at app startup. If a token exists in localStorage,
 * calls GET /auth/me to fetch the LATEST user + role from the database.
 *
 * This ensures:
 * - Page refresh preserves login (tokens are read from localStorage)
 * - Role changes in the DB take effect after the next login or page refresh
 * - Stale JWT roles are never used for routing decisions
 * - Expired tokens trigger logout automatically via the axios 401 interceptor
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { tokens, refreshUser, setLoading } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (tokens?.accessToken) {
      // Fetch latest user from DB on every app load
      refreshUser()
    } else {
      // No token — mark loading done immediately
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
