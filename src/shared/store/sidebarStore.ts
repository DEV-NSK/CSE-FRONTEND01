import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
  toggleMobile: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,

      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
)
