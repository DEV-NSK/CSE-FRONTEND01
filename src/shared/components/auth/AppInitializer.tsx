/**
 * AppInitializer — Session persistence guard
 *
 * On every page load / browser refresh:
 *   1. If no refresh token stored → user was never logged in, show app as guest.
 *   2. If refresh token exists → silently refresh access token + fetch fresh user.
 *      - SUCCESS  : update store with fresh tokens + user, let them in.
 *      - 401/403  : token is explicitly invalid/revoked → clear auth, go to login.
 *      - Network / 5xx / timeout : keep the cached user data, let them in.
 *        (Don't punish users for a backend restart or flaky connection.)
 *
 * This means users stay logged in until they explicitly logout, or until the
 * server explicitly rejects their refresh token (90-day expiry by default).
 */
import { useEffect, useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/shared/store/authStore'
import { PageLoader } from '@/shared/components/feedback/LoadingSpinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

type InitStatus = 'loading' | 'done'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { tokens, user, login, logout } = useAuthStore()
  const [status, setStatus] = useState<InitStatus>('loading')
  const initialized = useRef(false)

  useEffect(() => {
    // Guard against double-invoke in React Strict Mode
    if (initialized.current) return
    initialized.current = true

    async function initialize() {
      const refreshToken = tokens?.refreshToken

      // ── No stored session → just show the app (unauthenticated) ──────────
      if (!refreshToken) {
        setStatus('done')
        return
      }

      try {
        // Step 1: Exchange refresh token for a new access token
        const refreshRes = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { timeout: 10000 },
        )
        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = refreshRes.data.data

        // Step 2: Fetch the latest user record with the fresh access token
        const meRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        })
        const freshUser = meRes.data.data

        // All good — persist new tokens + user
        login(freshUser, { accessToken, refreshToken: newRefreshToken })
      } catch (err) {
        const axiosErr = err as AxiosError
        const status = axiosErr?.response?.status

        if (status === 401 || status === 403) {
          // ── Server explicitly rejected the token → must log out ───────────
          // This is the ONLY case we force the user back to login.
          logout()
          window.location.href = '/auth/login'
          return
        }

        // ── Network error / timeout / 5xx / server restart ────────────────
        // Keep the user logged in with their cached data.
        // The axios request interceptor will retry with the stored refresh
        // token on the next API call automatically.
        // No redirect, no logout — just let them use the app.
        console.warn('[AppInitializer] Could not refresh session (network/server issue) — using cached session.', axiosErr?.message)
      }

      setStatus('done')
    }

    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return <PageLoader />
  }

  return <>{children}</>
}
