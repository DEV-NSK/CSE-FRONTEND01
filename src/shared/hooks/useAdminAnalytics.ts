// ─── FPRD-09: Admin Analytics Hooks ──────────────────────────────────────────
// PRD-FINAL-01 §25: Stale times aligned with backend Redis cache TTLs so the
// browser only fires a new network request after the backend cache has expired.

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

/** Backend cache: 60s. Refetch every 60s to match. */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminAnalyticsKeys.dashboard(),
    queryFn: () => adminAnalyticsService.getDashboard().then((r) => r.data.data),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  })
}

/** Backend cache: 60s. */
export function useAdminUserAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.users(),
    queryFn: () => adminAnalyticsService.getUsers().then((r) => r.data.data),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  })
}

/** Backend cache: 120s. No polling needed for historical charts. */
export function useAdminCharts(period?: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  return useQuery({
    queryKey: adminAnalyticsKeys.charts(period),
    queryFn: () => adminAnalyticsService.getCharts(period).then((r) => r.data.data),
    staleTime: 1000 * 120,
  })
}

/** Backend cache: 60s. */
export function useAdminUsage() {
  return useQuery({
    queryKey: adminAnalyticsKeys.usage(),
    queryFn: () => adminAnalyticsService.getUsage().then((r) => r.data.data),
    staleTime: 1000 * 60,
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
    staleTime: 1000 * 60,
  })
}

/** System health: no backend cache — lightweight DB + Redis ping. 15s is fine. */
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

/** Live feed: no backend cache. 10s poll is intentional for real-time. */
export function useAdminLiveActivity() {
  return useQuery({
    queryKey: adminAnalyticsKeys.live(),
    queryFn: () => adminAnalyticsService.getLive(30).then((r) => r.data.data),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  })
}
