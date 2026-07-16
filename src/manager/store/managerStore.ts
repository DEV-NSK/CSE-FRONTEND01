import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ManagerUIState {
  sidebarCollapsed: boolean
  activeSection: string
  breadcrumbs: { label: string; href?: string }[]
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setActiveSection: (section: string) => void
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void
}

export const useManagerStore = create<ManagerUIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeSection: 'dashboard',
      breadcrumbs: [],
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveSection: (activeSection) => set({ activeSection }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    }),
    {
      name: 'manager-ui-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
