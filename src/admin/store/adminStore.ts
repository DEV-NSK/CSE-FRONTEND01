import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUIState {
  sidebarCollapsed: boolean
  activeSection: string
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void
  breadcrumbs: { label: string; href?: string }[]
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setActiveSection: (section: string) => void
}

export const useAdminStore = create<AdminUIState>()(
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
      name: 'admin-ui-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
