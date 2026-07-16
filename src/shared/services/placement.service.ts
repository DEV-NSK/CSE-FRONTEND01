import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  Company,
  CompanyListItem,
  Job,
  JobListItem,
  Application,
  ApplicationStatus,
  JobFilters,
  CompanyFilters,
  PlacementStats,
} from '@/shared/types/placement'

export const placementService = {
  // ─── Stats ────────────────────────────────────────────────────────────────
  getStats: () =>
    axiosInstance.get<ApiResponse<PlacementStats>>('/placement/stats'),

  // ─── Companies ────────────────────────────────────────────────────────────
  getCompanies: (filters?: Partial<CompanyFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<CompanyListItem>>>('/placement/companies', {
      params: filters,
    }),

  getCompanyById: (id: string) =>
    axiosInstance.get<ApiResponse<Company>>(`/placement/companies/${id}`),

  // ─── Jobs ─────────────────────────────────────────────────────────────────
  getJobs: (filters?: Partial<JobFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<JobListItem>>>('/placement/jobs', {
      params: filters,
    }),

  getJobById: (id: string) =>
    axiosInstance.get<ApiResponse<Job>>(`/placement/jobs/${id}`),

  saveJob: (jobId: string) =>
    axiosInstance.post<ApiResponse<{ isSaved: boolean }>>(`/placement/jobs/${jobId}/save`),

  unsaveJob: (jobId: string) =>
    axiosInstance.delete<ApiResponse<{ isSaved: boolean }>>(`/placement/jobs/${jobId}/save`),

  applyJob: (jobId: string, data?: { notes?: string }) =>
    axiosInstance.post<ApiResponse<Application>>(`/placement/jobs/${jobId}/apply`, data),

  // ─── Applications ─────────────────────────────────────────────────────────
  getApplications: (params?: { page?: number; limit?: number; status?: ApplicationStatus }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Application>>>('/placement/applications', {
      params,
    }),

  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) =>
    axiosInstance.patch<ApiResponse<Application>>(`/placement/applications/${id}`, {
      status,
      notes,
    }),

  deleteApplication: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/placement/applications/${id}`),

  getRecommendedJobs: (limit = 6) =>
    axiosInstance.get<ApiResponse<JobListItem[]>>('/placement/jobs/recommended', {
      params: { limit },
    }),
}
