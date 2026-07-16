import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, ViewMode, BookmarkType } from '@/shared/types/learning'

// ─── Learning UI State (Zustand — UI only, server data stays in TanStack Query)

interface LearningFilters {
  search: string
  difficulty: Difficulty | 'all'
  categoryId: string | 'all'
  status: 'all' | 'completed' | 'in_progress' | 'not_started'
}

interface BookmarkUIFilters {
  search: string
  sort: 'newest' | 'oldest'
  type: BookmarkType | 'all'
}

interface LearningStore {
  // View modes
  roadmapsViewMode: ViewMode
  bookmarksViewMode: ViewMode

  // Roadmap filters
  roadmapFilters: LearningFilters

  // Lesson filters
  lessonSearch: string
  lessonStatus: 'all' | 'completed' | 'incomplete'

  // Bookmark filters
  bookmarkFilters: BookmarkUIFilters

  // Category sort
  categorySort: string
  categorySearch: string

  // Sidebar state for lesson viewer
  lessonSidebarOpen: boolean

  // Actions
  setRoadmapsViewMode: (mode: ViewMode) => void
  setBookmarksViewMode: (mode: ViewMode) => void
  setRoadmapFilters: (filters: Partial<LearningFilters>) => void
  resetRoadmapFilters: () => void
  setLessonSearch: (search: string) => void
  setLessonStatus: (status: 'all' | 'completed' | 'incomplete') => void
  setBookmarkFilters: (filters: Partial<BookmarkUIFilters>) => void
  setCategorySort: (sort: string) => void
  setCategorySearch: (search: string) => void
  setLessonSidebarOpen: (open: boolean) => void
}

const defaultRoadmapFilters: LearningFilters = {
  search: '',
  difficulty: 'all',
  categoryId: 'all',
  status: 'all',
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set) => ({
      roadmapsViewMode: 'grid',
      bookmarksViewMode: 'grid',
      roadmapFilters: defaultRoadmapFilters,
      lessonSearch: '',
      lessonStatus: 'all',
      bookmarkFilters: { search: '', sort: 'newest', type: 'all' },
      categorySort: 'name',
      categorySearch: '',
      lessonSidebarOpen: true,

      setRoadmapsViewMode: (mode) => set({ roadmapsViewMode: mode }),
      setBookmarksViewMode: (mode) => set({ bookmarksViewMode: mode }),
      setRoadmapFilters: (filters) =>
        set((s) => ({ roadmapFilters: { ...s.roadmapFilters, ...filters } })),
      resetRoadmapFilters: () => set({ roadmapFilters: defaultRoadmapFilters }),
      setLessonSearch: (search) => set({ lessonSearch: search }),
      setLessonStatus: (status) => set({ lessonStatus: status }),
      setBookmarkFilters: (filters) =>
        set((s) => ({ bookmarkFilters: { ...s.bookmarkFilters, ...filters } })),
      setCategorySort: (sort) => set({ categorySort: sort }),
      setCategorySearch: (search) => set({ categorySearch: search }),
      setLessonSidebarOpen: (open) => set({ lessonSidebarOpen: open }),
    }),
    {
      name: 'learning-ui-storage',
      partialize: (state) => ({
        roadmapsViewMode: state.roadmapsViewMode,
        bookmarksViewMode: state.bookmarksViewMode,
        lessonSidebarOpen: state.lessonSidebarOpen,
      }),
    }
  )
)
