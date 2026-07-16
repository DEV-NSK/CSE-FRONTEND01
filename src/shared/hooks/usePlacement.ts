import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { placementService } from '@/shared/services/placement.service'
import type { JobFilters, CompanyFilters, ApplicationStatus } from '@/shared/types/placement'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const placementKeys = {
  all: ['placement'] as const,
  stats: () => [...placementKeys.all, 'stats'] as const,
  companies: (filters?: Partial<CompanyFilters>) =>
    [...placementKeys.all, 'companies', filters] as const,
  company: (id: string) => [...placementKeys.all, 'company', id] as const,
  jobs: (filters?: Partial<JobFilters>) => [...placementKeys.all, 'jobs', filters] as const,
  job: (id: string) => [...placementKeys.all, 'job', id] as const,
  applications: (params?: object) => [...placementKeys.all, 'applications', params] as const,
  recommendedJobs: (limit?: number) =>
    [...placementKeys.all, 'recommendedJobs', limit] as const,
}

// ─── Placement Stats ──────────────────────────────────────────────────────────

export function usePlacementStats() {
  return useQuery({
    queryKey: placementKeys.stats(),
    queryFn: () => placementService.getStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Companies ────────────────────────────────────────────────────────────────

export function useCompanies(filters?: Partial<CompanyFilters>) {
  return useQuery({
    queryKey: placementKeys.companies(filters),
    queryFn: () => placementService.getCompanies(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: placementKeys.company(id),
    queryFn: () => placementService.getCompanyById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function useJobs(filters?: Partial<JobFilters>) {
  return useQuery({
    queryKey: placementKeys.jobs(filters),
    queryFn: () => placementService.getJobs(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: placementKeys.job(id),
    queryFn: () => placementService.getJobById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecommendedJobs(limit = 6) {
  return useQuery({
    queryKey: placementKeys.recommendedJobs(limit),
    queryFn: () => placementService.getRecommendedJobs(limit).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useSaveJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => placementService.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placementKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: placementKeys.applications() })
      queryClient.invalidateQueries({ queryKey: placementKeys.stats() })
    },
  })
}

export function useUnsaveJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => placementService.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placementKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: placementKeys.applications() })
      queryClient.invalidateQueries({ queryKey: placementKeys.stats() })
    },
  })
}

export function useApplyJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, notes }: { jobId: string; notes?: string }) =>
      placementService.applyJob(jobId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placementKeys.applications() })
      queryClient.invalidateQueries({ queryKey: placementKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: placementKeys.stats() })
    },
  })
}

// ─── Applications ─────────────────────────────────────────────────────────────

export function useApplications(params?: {
  page?: number
  limit?: number
  status?: ApplicationStatus
}) {
  return useQuery({
    queryKey: placementKeys.applications(params),
    queryFn: () => placementService.getApplications(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string
      status: ApplicationStatus
      notes?: string
    }) => placementService.updateApplicationStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placementKeys.applications() })
      queryClient.invalidateQueries({ queryKey: placementKeys.stats() })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => placementService.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placementKeys.applications() })
      queryClient.invalidateQueries({ queryKey: placementKeys.stats() })
    },
  })
}
