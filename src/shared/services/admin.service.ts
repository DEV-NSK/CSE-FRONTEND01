import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { AdminStats, AdminUser, AdminReport, PlatformSettings } from '@/shared/types/admin'

export const adminService = {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  getStats: () =>
    axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats'),

  // ─── Users ────────────────────────────────────────────────────────────────
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/users', { params }),

  updateUserRole: (id: string, role: string) =>
    axiosInstance.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role }),

  deleteUser: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/users/${id}`),

  // ─── Generic resource management ──────────────────────────────────────────
  getAdminResource: <T>(resource: string, params?: Record<string, unknown>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<T>>>(`/admin/${resource}`, { params }),

  createAdminResource: <T>(resource: string, data: Record<string, unknown>) =>
    axiosInstance.post<ApiResponse<T>>(`/admin/${resource}`, data),

  updateAdminResource: <T>(resource: string, id: string, data: Record<string, unknown>) =>
    axiosInstance.put<ApiResponse<T>>(`/admin/${resource}/${id}`, data),

  deleteAdminResource: (resource: string, id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/${resource}/${id}`),

  bulkDeleteAdminResource: (resource: string, ids: string[]) =>
    axiosInstance.post<ApiResponse<void>>(`/admin/${resource}/bulk-delete`, { ids }),

  // ─── Reports ──────────────────────────────────────────────────────────────
  getReports: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<AdminReport>>>('/admin/reports', { params }),

  generateReport: (type: string) =>
    axiosInstance.post<ApiResponse<AdminReport>>('/admin/reports', { type }),

  // ─── Platform Settings ────────────────────────────────────────────────────
  getPlatformSettings: () =>
    axiosInstance.get<ApiResponse<PlatformSettings>>('/admin/settings'),

  updatePlatformSettings: (data: Partial<PlatformSettings>) =>
    axiosInstance.put<ApiResponse<PlatformSettings>>('/admin/settings', data),
}
