// ─── FPRD-09: Admin Analytics Hooks ──────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { adminAnalyticsService } from '@/shared/services/admin-analytics.service'

export const adminAnalyticsKeys = {
  all: ['adminAnalytics'] as const,
  dashboard: () => [...adminAnalyticsKeys.all, 'dashboard'] as const,
  users: () => [...adminAnalyticsKeys.all, 'users'] as const,
  charts: (period?: string) => [...adminAnalyticsKeys.all, 'charts', period] as const,
  usage: () => [...adminAnalyticsKeys.all, 'usage'] as const,
  api: () => [...adminAnalyticsKeys.all, 'api'] as const,
  database: () => [...adminAnalyticsKeys.all, 'database'] as const,
  system: () => [...adminAnalyticsKeys.all, 'system'] as const,
  managers: () => [...adminAnalyticsKeys.all, 'managers'] as const,
  live: () => [...adminAnalyticsKeys.all, 'live'] as const,
}

/** Auto-refreshes every 30 seconds */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminAnalyticsKeys.dashboard(),
    queryFn: () => adminAnalyticsService.getDashboard().then((r) => r.data.data),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  })
}

export function useAdminUserAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.users(),
    queryFn: () => adminAnalyticsService.getUsers().then((r) => r.data.data),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  })
}

export function useAdminCharts(period?: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  return useQuery({
    queryKey: adminAnalyticsKeys.charts(period),
    queryFn: () => adminAnalyticsService.getCharts(period).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminUsage() {
  return useQuery({
    queryKey: adminAnalyticsKeys.usage(),
    queryFn: () => adminAnalyticsService.getUsage().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminApiAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.api(),
    queryFn: () => adminAnalyticsService.getApi().then((r) => r.data.data),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  })
}

export function useAdminDatabase() {
  return useQuery({
    queryKey: adminAnalyticsKeys.database(),
    queryFn: () => adminAnalyticsService.getDatabase().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

/** Auto-refreshes every 15 seconds for live system health */
export function useAdminSystemHealth() {
  return useQuery({
    queryKey: adminAnalyticsKeys.system(),
    queryFn: () => adminAnalyticsService.getSystem().then((r) => r.data.data),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
  })
}

export function useAdminManagerAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.managers(),
    queryFn: () => adminAnalyticsService.getManagers().then((r) => r.data.data),
    staleTime: 1000 * 60,
  })
}

/** Auto-refreshes every 10 seconds for live feed */
export function useAdminLiveActivity() {
  return useQuery({
    queryKey: adminAnalyticsKeys.live(),
    queryFn: () => adminAnalyticsService.getLive(30).then((r) => r.data.data),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  })
}
