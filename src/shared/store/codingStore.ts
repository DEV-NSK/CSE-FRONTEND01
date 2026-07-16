import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language, ProblemDifficulty, SubmissionStatus } from '@/shared/types/coding'

// ─── Coding UI / Editor State ─────────────────────────────────────────────────

export type ProblemsViewMode = 'table' | 'card'
export type EditorTheme = 'vs-dark' | 'light' | 'hc-black'

interface ProblemFiltersState {
  search: string
  difficulty: ProblemDifficulty | 'all'
  categoryId: string | 'all'
  tagIds: string[]
  companyId: string | 'all'
  status: 'all' | 'solved' | 'unsolved'
}

interface SubmissionFiltersState {
  search: string
  status: SubmissionStatus | 'all'
  language: Language | 'all'
}

interface FavoriteFiltersState {
  search: string
  difficulty: ProblemDifficulty | 'all'
}

interface EditorSettings {
  language: Language
  fontSize: number
  wordWrap: 'on' | 'off'
  minimap: boolean
  theme: EditorTheme
}

interface CodingStore {
  // Problem list
  problemsViewMode: ProblemsViewMode
  problemFilters: ProblemFiltersState
  problemsPage: number

  // Submission filters
  submissionFilters: SubmissionFiltersState
  submissionsPage: number

  // Favorites
  favoriteFilters: FavoriteFiltersState
  favoritesPage: number
  favoritesViewMode: 'grid' | 'list'

  // Editor settings (persisted per user preference)
  editorSettings: EditorSettings

  // Draft code keyed by problemId-language
  drafts: Record<string, string>

  // Right panel tab in problem solver
  rightPanelTab: 'testcases' | 'output' | 'submissions'

  // Actions
  setProblemsViewMode: (mode: ProblemsViewMode) => void
  setProblemFilters: (filters: Partial<ProblemFiltersState>) => void
  resetProblemFilters: () => void
  setProblemsPage: (page: number) => void

  setSubmissionFilters: (filters: Partial<SubmissionFiltersState>) => void
  resetSubmissionFilters: () => void
  setSubmissionsPage: (page: number) => void

  setFavoriteFilters: (filters: Partial<FavoriteFiltersState>) => void
  setFavoritesPage: (page: number) => void
  setFavoritesViewMode: (mode: 'grid' | 'list') => void

  setEditorLanguage: (language: Language) => void
  setEditorSettings: (settings: Partial<EditorSettings>) => void

  saveDraft: (key: string, code: string) => void
  getDraft: (key: string) => string | undefined
  clearDraft: (key: string) => void

  setRightPanelTab: (tab: 'testcases' | 'output' | 'submissions') => void
}

const defaultProblemFilters: ProblemFiltersState = {
  search: '',
  difficulty: 'all',
  categoryId: 'all',
  tagIds: [],
  companyId: 'all',
  status: 'all',
}

const defaultEditorSettings: EditorSettings = {
  language: 'javascript',
  fontSize: 14,
  wordWrap: 'on',
  minimap: false,
  theme: 'vs-dark',
}

export const useCodingStore = create<CodingStore>()(
  persist(
    (set, get) => ({
      problemsViewMode: 'table',
      problemFilters: defaultProblemFilters,
      problemsPage: 1,

      submissionFilters: { search: '', status: 'all', language: 'all' },
      submissionsPage: 1,

      favoriteFilters: { search: '', difficulty: 'all' },
      favoritesPage: 1,
      favoritesViewMode: 'grid',

      editorSettings: defaultEditorSettings,
      drafts: {},
      rightPanelTab: 'testcases',

      setProblemsViewMode: (mode) => set({ problemsViewMode: mode }),
      setProblemFilters: (filters) =>
        set((s) => ({ problemFilters: { ...s.problemFilters, ...filters }, problemsPage: 1 })),
      resetProblemFilters: () => set({ problemFilters: defaultProblemFilters, problemsPage: 1 }),
      setProblemsPage: (page) => set({ problemsPage: page }),

      setSubmissionFilters: (filters) =>
        set((s) => ({
          submissionFilters: { ...s.submissionFilters, ...filters },
          submissionsPage: 1,
        })),
      resetSubmissionFilters: () =>
        set({ submissionFilters: { search: '', status: 'all', language: 'all' }, submissionsPage: 1 }),
      setSubmissionsPage: (page) => set({ submissionsPage: page }),

      setFavoriteFilters: (filters) =>
        set((s) => ({ favoriteFilters: { ...s.favoriteFilters, ...filters }, favoritesPage: 1 })),
      setFavoritesPage: (page) => set({ favoritesPage: page }),
      setFavoritesViewMode: (mode) => set({ favoritesViewMode: mode }),

      setEditorLanguage: (language) =>
        set((s) => ({ editorSettings: { ...s.editorSettings, language } })),
      setEditorSettings: (settings) =>
        set((s) => ({ editorSettings: { ...s.editorSettings, ...settings } })),

      saveDraft: (key, code) =>
        set((s) => ({ drafts: { ...s.drafts, [key]: code } })),
      getDraft: (key) => get().drafts[key],
      clearDraft: (key) =>
        set((s) => {
          const drafts = { ...s.drafts }
          delete drafts[key]
          return { drafts }
        }),

      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
    }),
    {
      name: 'coding-ui-storage',
      partialize: (state) => ({
        problemsViewMode: state.problemsViewMode,
        editorSettings: state.editorSettings,
        drafts: state.drafts,
        favoritesViewMode: state.favoritesViewMode,
      }),
    }
  )
)
