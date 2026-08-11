import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/shared/services/dashboard.service'
import { analyticsService } from '@/shared/services/analytics.service'
import { useAuthStore } from '@/shared/store/authStore'
import type {
  LeaderboardResponse,
  DailyTasksResponse,
  DashboardActivityDay,
  AggregatedDashboard,
} from '@/shared/services/dashboard.service'
import type { OverallAnalytics, HeatmapData } from '@/shared/types/analytics'

export const dashboardKeys = {
  aggregated: () => ['dashboard', 'aggregated'] as const,
  leaderboard: () => ['dashboard', 'leaderboard'] as const,
  dailyTasks: () => ['dashboard', 'daily-tasks'] as const,
  activity: (year?: number) => ['dashboard', 'activity', year] as const,
  analytics: () => ['dashboard', 'analytics'] as const,
}

/**
 * PRD-FINAL-01 §36-37: Replaces 10 individual requests with one aggregated call.
 * Use this on the main student dashboard page.
 * Individual hooks below remain available for pages that navigate to specific widgets.
 */
export function useAggregatedDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<AggregatedDashboard>({
    queryKey: dashboardKeys.aggregated(),
    queryFn: () => dashboardService.getAggregated().then((r) => r.data.data),
    staleTime: 1000 * 60,   // 60 seconds — PRD §34
    enabled: isAuthenticated,
  })
}

export function useLeaderboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<LeaderboardResponse>({
    queryKey: dashboardKeys.leaderboard(),
    queryFn: () => dashboardService.getLeaderboard().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  })
}

export function useDailyTasks() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<DailyTasksResponse>({
    queryKey: dashboardKeys.dailyTasks(),
    queryFn: () => dashboardService.getDailyTasks().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  })
}

export function useDashboardActivity(year?: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<DashboardActivityDay[]>({
    queryKey: dashboardKeys.activity(year),
    queryFn: () =>
      dashboardService
        .getActivityHeatmap(year)
        .then((r) => r.data.data)
        // fall back to heatmap endpoint if dashboard/activity 404s
        .catch(() =>
          analyticsService
            .getHeatmap(year)
            .then((r) => (r.data.data as HeatmapData[]) ?? []),
        ),
    staleTime: 1000 * 60 * 10,
    enabled: isAuthenticated,
  })
}

export function useDashboardAnalytics() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<OverallAnalytics>({
    queryKey: dashboardKeys.analytics(),
    queryFn: () => analyticsService.getOverallAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  })
}
