import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { AdminStats, AdminUser, AdminReport, PlatformSettings } from '@/shared/types/admin'

export const adminService = {
  // ─── Dashboard (FPRD-09 real data) ───────────────────────────────────────
  getDashboard: () =>
    axiosInstance.get<ApiResponse<unknown>>('/admin/dashboard'),

  // ─── Stats (legacy) ───────────────────────────────────────────────────────
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

  // ─── Super Admin: User Management ────────────────────────────────────────
  getSuperAdminUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/users', { params }),

  getSuperAdminUserById: (id: string) =>
    axiosInstance.get<ApiResponse<AdminUser>>(`/admin/users/${id}`),

  updateSuperAdminUser: (id: string, data: { fullName?: string; isVerified?: boolean }) =>
    axiosInstance.patch<ApiResponse<AdminUser>>(`/admin/users/${id}`, data),

  deleteSuperAdminUser: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/users/${id}`),

  promoteUser: (id: string, reason?: string, modules?: Record<string, boolean>) =>
    axiosInstance.post<ApiResponse<AdminUser>>(`/admin/users/${id}/promote`, { reason, modules }),

  demoteUser: (id: string, reason?: string) =>
    axiosInstance.post<ApiResponse<AdminUser>>(`/admin/users/${id}/demote`, { reason }),

  // ─── Super Admin: Manager Management ─────────────────────────────────────
  getManagers: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/managers', { params }),

  getManagerById: (id: string) =>
    axiosInstance.get<ApiResponse<AdminUser>>(`/admin/managers/${id}`),

  updateManagerPermissions: (id: string, permissions: Record<string, boolean>) =>
    axiosInstance.put<ApiResponse<unknown>>(`/admin/managers/${id}/permissions`, permissions),

  // ─── Super Admin: Audit Logs ──────────────────────────────────────────────
  getAuditLogs: (params?: { role?: string; action?: string; module?: string; userId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<unknown>>('/admin/audit', { params }),

  // ─── Super Admin: System Logs ─────────────────────────────────────────────
  getSystemLogs: (params?: { level?: string; module?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<unknown>>('/admin/system-logs', { params }),

  // ─── Super Admin: Invitations ────────────────────────────────────────────
  sendManagerInvitation: (email: string) =>
    axiosInstance.post<ApiResponse<unknown>>('/admin/invitations', { email }),
}
