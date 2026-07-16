import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types'

interface ThemeStore {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: resolveTheme('system'),

      setTheme: (theme) => {
        const resolvedTheme = resolveTheme(theme)
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(resolvedTheme)
        set({ theme, resolvedTheme })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme)
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(resolved)
          state.resolvedTheme = resolved
        }
      },
    }
  )
)
