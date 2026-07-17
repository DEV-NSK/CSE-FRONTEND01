import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'

/**
 * PRD-08: Single authoritative auth store.
 * - No duplicate stores.
 * - Backend always decides role — frontend never calculates it.
 * - refreshUser() fetches /auth/me on every reload to get latest role.
 */
interface AuthStore {
  user: User | null
  tokens: AuthTokens | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void

  /** Called after successful login — sets user, tokens, marks authenticated */
  login: (user: User, tokens: AuthTokens) => void

  /** Called on logout — clears all auth state */
  logout: () => void

  /** Partially update user fields (e.g. after profile edit) */
  updateUser: (updates: Partial<User>) => void

  /**
   * PRD-08: refreshUser() — fetches /auth/me to get latest role from DB.
   * Called on every page reload. Never uses cached role alone.
   */
  refreshUser: () => Promise<void>

  /**
   * PRD-08: refreshToken() — calls /auth/refresh to rotate the access token.
   * Used by the axios interceptor automatically.
   */
  refreshToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          permissions: user?.permissions ?? [],
        }),

      setTokens: (tokens) => set({ tokens }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, tokens) =>
        set({
          user,
          tokens,
          permissions: user.permissions ?? [],
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          permissions: updates.permissions ?? state.user?.permissions ?? [],
        })),

      /**
       * PRD-08: Fetch /auth/me → update user with latest role from DB.
       * This is the primary mechanism to prevent stale role issues.
       * Import is dynamic to avoid circular dependency with axios instance.
       */
      refreshUser: async () => {
        const { tokens } = get()
        if (!tokens?.accessToken) return

        set({ isLoading: true })
        try {
          // Dynamic import to avoid circular dependency
          const { default: axiosInstance } = await import('@/shared/lib/axios')
          const response = await axiosInstance.get('/auth/me')
          const freshUser: User = response.data.data
          set({
            user: freshUser,
            permissions: freshUser.permissions ?? [],
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          // If /me fails (token expired / revoked), clear auth
          set({
            user: null,
            tokens: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      /**
       * PRD-08: Rotate the access token using the stored refresh token.
       * Returns the new access token or null if rotation failed.
       */
      refreshToken: async (): Promise<string | null> => {
        const { tokens } = get()
        if (!tokens?.refreshToken) return null

        try {
          const { default: axiosInstance } = await import('@/shared/lib/axios')
          const response = await axiosInstance.post('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          })
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          set((state) => ({
            tokens: state.tokens
              ? { accessToken, refreshToken: newRefreshToken }
              : null,
          }))
          return accessToken
        } catch {
          // Refresh failed — force logout
          set({
            user: null,
            tokens: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          })
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
