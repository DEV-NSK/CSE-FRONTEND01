import { useEffect, useState } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { PageLoader } from '@/shared/components/feedback/LoadingSpinner'

type InitStatus = 'loading' | 'done' | 'error'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { tokens, logout, login } = useAuthStore()
  const [status, setStatus] = useState<InitStatus>('loading')

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      const refreshToken = tokens?.refreshToken

      if (!refreshToken) {
        if (!cancelled) setStatus('done')
        return
      }

      try {
        const { default: axiosInstance } = await import('@/shared/lib/axios')

        const refreshRes = await axiosInstance.post('/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data

        const meRes = await axiosInstance.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const user = meRes.data.data

        if (!cancelled) {
          login(user, { accessToken, refreshToken: newRefreshToken })
          setStatus('done')
        }
      } catch {
        if (!cancelled) {
          logout()
          window.location.href = '/auth/login'
        }
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return <PageLoader />
  }

  return <>{children}</>
}
