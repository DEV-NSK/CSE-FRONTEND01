import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkMode, JobType, ExperienceLevel, ApplicationStatus } from '@/shared/types/placement'

interface JobFiltersState {
  search: string
  company: string
  workMode: WorkMode | 'all'
  jobType: JobType | 'all'
  experienceLevel: ExperienceLevel | 'all'
  location: string
  status: ApplicationStatus | 'all'
}

interface CompanyFiltersState {
  search: string
  industry: string
  isVerified: boolean | null
}

interface PlacementStore {
  // Jobs
  jobFilters: JobFiltersState
  jobsPage: number
  jobsViewMode: 'grid' | 'list'
  // Companies
  companyFilters: CompanyFiltersState
  companiesPage: number
  companiesViewMode: 'grid' | 'list'
  // Applications
  applicationsViewMode: 'kanban' | 'table'

  setJobFilters: (f: Partial<JobFiltersState>) => void
  resetJobFilters: () => void
  setJobsPage: (p: number) => void
  setJobsViewMode: (m: 'grid' | 'list') => void

  setCompanyFilters: (f: Partial<CompanyFiltersState>) => void
  resetCompanyFilters: () => void
  setCompaniesPage: (p: number) => void
  setCompaniesViewMode: (m: 'grid' | 'list') => void

  setApplicationsViewMode: (m: 'kanban' | 'table') => void
}

const defaultJobFilters: JobFiltersState = {
  search: '',
  company: '',
  workMode: 'all',
  jobType: 'all',
  experienceLevel: 'all',
  location: '',
  status: 'all',
}

const defaultCompanyFilters: CompanyFiltersState = {
  search: '',
  industry: '',
  isVerified: null,
}

export const usePlacementStore = create<PlacementStore>()(
  persist(
    (set) => ({
      jobFilters: defaultJobFilters,
      jobsPage: 1,
      jobsViewMode: 'list',
      companyFilters: defaultCompanyFilters,
      companiesPage: 1,
      companiesViewMode: 'grid',
      applicationsViewMode: 'kanban',

      setJobFilters: (f) =>
        set((s) => ({ jobFilters: { ...s.jobFilters, ...f }, jobsPage: 1 })),
      resetJobFilters: () => set({ jobFilters: defaultJobFilters, jobsPage: 1 }),
      setJobsPage: (p) => set({ jobsPage: p }),
      setJobsViewMode: (m) => set({ jobsViewMode: m }),

      setCompanyFilters: (f) =>
        set((s) => ({ companyFilters: { ...s.companyFilters, ...f }, companiesPage: 1 })),
      resetCompanyFilters: () => set({ companyFilters: defaultCompanyFilters, companiesPage: 1 }),
      setCompaniesPage: (p) => set({ companiesPage: p }),
      setCompaniesViewMode: (m) => set({ companiesViewMode: m }),

      setApplicationsViewMode: (m) => set({ applicationsViewMode: m }),
    }),
    {
      name: 'placement-ui-storage',
      partialize: (s) => ({
        jobsViewMode: s.jobsViewMode,
        companiesViewMode: s.companiesViewMode,
        applicationsViewMode: s.applicationsViewMode,
      }),
    }
  )
)
