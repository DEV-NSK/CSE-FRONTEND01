import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'
import { queryClient } from '@/shared/lib/queryClient'

interface AuthStore {
  user: User | null
  tokens: AuthTokens | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void

  login: (user: User, tokens: AuthTokens) => void

  logout: () => void

  updateUser: (updates: Partial<User>) => void

  refreshUser: () => Promise<void>

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

      logout: () => {
        localStorage.removeItem('auth-storage')
        sessionStorage.clear()
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
        })

        set({
          user: null,
          tokens: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        })

        queryClient.clear()

        window.location.href = '/auth/login'
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          permissions: updates.permissions ?? state.user?.permissions ?? [],
        })),

      refreshUser: async () => {
        const { tokens } = get()
        if (!tokens?.accessToken) return

        set({ isLoading: true })
        try {
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
          set({
            user: null,
            tokens: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

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
