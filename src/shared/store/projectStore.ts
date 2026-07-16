import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectFilters, TaskFilters, TaskStatus } from '@/shared/types/project'

type ViewMode = 'grid' | 'list'
type KanbanViewMode = 'kanban' | 'table' | 'calendar'

interface ProjectStore {
  // Explorer
  projectViewMode: ViewMode
  projectFilters: ProjectFilters
  setProjectViewMode: (mode: ViewMode) => void
  setProjectFilters: (filters: Partial<ProjectFilters>) => void
  resetProjectFilters: () => void

  // Task board
  taskViewMode: KanbanViewMode
  taskFilters: TaskFilters
  setTaskViewMode: (mode: KanbanViewMode) => void
  setTaskFilters: (filters: Partial<TaskFilters>) => void

  // File preview modal
  filePreviewUrl: string | null
  filePreviewTitle: string | null
  openFilePreview: (url: string, title: string) => void
  closeFilePreview: () => void

  // Sidebar collapse (team page sidebar)
  teamSidebarCollapsed: boolean
  setTeamSidebarCollapsed: (collapsed: boolean) => void

  // Kanban drag-and-drop optimistic state
  draggingTaskId: string | null
  setDraggingTaskId: (id: string | null) => void
  optimisticTaskStatuses: Record<string, TaskStatus>
  setOptimisticTaskStatus: (taskId: string, status: TaskStatus) => void
  clearOptimisticTaskStatus: (taskId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      // Explorer
      projectViewMode: 'grid',
      projectFilters: { page: 1, limit: 12 },
      setProjectViewMode: (mode) => set({ projectViewMode: mode }),
      setProjectFilters: (filters) =>
        set((s) => ({ projectFilters: { ...s.projectFilters, ...filters, page: 1 } })),
      resetProjectFilters: () => set({ projectFilters: { page: 1, limit: 12 } }),

      // Task board
      taskViewMode: 'kanban',
      taskFilters: {},
      setTaskViewMode: (mode) => set({ taskViewMode: mode }),
      setTaskFilters: (filters) =>
        set((s) => ({ taskFilters: { ...s.taskFilters, ...filters } })),

      // File preview
      filePreviewUrl: null,
      filePreviewTitle: null,
      openFilePreview: (url, title) =>
        set({ filePreviewUrl: url, filePreviewTitle: title }),
      closeFilePreview: () => set({ filePreviewUrl: null, filePreviewTitle: null }),

      // Sidebar
      teamSidebarCollapsed: false,
      setTeamSidebarCollapsed: (collapsed) => set({ teamSidebarCollapsed: collapsed }),

      // Drag-and-drop
      draggingTaskId: null,
      setDraggingTaskId: (id) => set({ draggingTaskId: id }),
      optimisticTaskStatuses: {},
      setOptimisticTaskStatus: (taskId, status) =>
        set((s) => ({ optimisticTaskStatuses: { ...s.optimisticTaskStatuses, [taskId]: status } })),
      clearOptimisticTaskStatus: (taskId) =>
        set((s) => {
          const next = { ...s.optimisticTaskStatuses }
          delete next[taskId]
          return { optimisticTaskStatuses: next }
        }),
    }),
    {
      name: 'project-store',
      partialize: (s) => ({
        projectViewMode: s.projectViewMode,
        taskViewMode: s.taskViewMode,
        teamSidebarCollapsed: s.teamSidebarCollapsed,
      }),
    }
  )
)
