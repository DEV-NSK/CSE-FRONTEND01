// ─── FPRD-09: Admin Analytics Service ────────────────────────────────────────

import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  DashboardOverview,
  UserAnalyticsData,
  ChartsData,
  UsageAnalytics,
  ApiAnalytics,
  DatabaseAnalytics,
  SystemHealth,
  ManagerAnalytics,
  LiveActivityItem,
} from '@/shared/types/admin-analytics'

const BASE = '/admin/analytics'

export const adminAnalyticsService = {
  getDashboard: () =>
    axiosInstance.get<ApiResponse<DashboardOverview>>(`${BASE}/dashboard`),

  getUsers: () =>
    axiosInstance.get<ApiResponse<UserAnalyticsData>>(`${BASE}/users`),

  getCharts: (period?: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
    axiosInstance.get<ApiResponse<ChartsData>>(`${BASE}/charts`, { params: { period } }),

  getUsage: () =>
    axiosInstance.get<ApiResponse<UsageAnalytics>>(`${BASE}/usage`),

  getApi: () =>
    axiosInstance.get<ApiResponse<ApiAnalytics>>(`${BASE}/api`),

  getDatabase: () =>
    axiosInstance.get<ApiResponse<DatabaseAnalytics>>(`${BASE}/database`),

  getSystem: () =>
    axiosInstance.get<ApiResponse<SystemHealth>>(`${BASE}/system`),

  getManagers: () =>
    axiosInstance.get<ApiResponse<ManagerAnalytics>>(`${BASE}/managers`),

  getLive: (limit?: number) =>
    axiosInstance.get<ApiResponse<LiveActivityItem[]>>(`${BASE}/live`, { params: { limit } }),
}
