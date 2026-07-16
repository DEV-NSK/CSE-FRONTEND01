import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/shared/services/analytics.service'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const analyticsKeys = {
  all: ['analytics'] as const,
  overall: () => [...analyticsKeys.all, 'overall'] as const,
  heatmap: (year?: number) => [...analyticsKeys.all, 'heatmap', year] as const,
  learning: () => [...analyticsKeys.all, 'learning'] as const,
  coding: () => [...analyticsKeys.all, 'coding'] as const,
  projects: () => [...analyticsKeys.all, 'projects'] as const,
  placement: () => [...analyticsKeys.all, 'placement'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useOverallAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.overall(),
    queryFn: () => analyticsService.getOverallAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useHeatmap(year?: number) {
  return useQuery({
    queryKey: analyticsKeys.heatmap(year),
    queryFn: () => analyticsService.getHeatmap(year).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useLearningAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.learning(),
    queryFn: () => analyticsService.getLearningAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCodingAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.coding(),
    queryFn: () => analyticsService.getCodingAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProjectAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.projects(),
    queryFn: () => analyticsService.getProjectAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlacementAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.placement(),
    queryFn: () => analyticsService.getPlacementAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}
