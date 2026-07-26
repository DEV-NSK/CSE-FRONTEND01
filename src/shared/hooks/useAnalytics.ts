import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { analyticsService } from '@/shared/services/analytics.service'
import type { OverallAnalytics, LearningAnalytics, CodingAnalyticsSummary, ProjectAnalytics, PlacementAnalytics, HeatmapData } from '@/shared/types/analytics'

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

type QOptions<T> = Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useOverallAnalytics(options?: QOptions<OverallAnalytics>) {
  return useQuery({
    queryKey: analyticsKeys.overall(),
    queryFn: () => analyticsService.getOverallAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useHeatmap(year?: number, options?: QOptions<HeatmapData[]>) {
  return useQuery({
    queryKey: analyticsKeys.heatmap(year),
    queryFn: () => analyticsService.getHeatmap(year).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

export function useLearningAnalytics(options?: QOptions<LearningAnalytics>) {
  return useQuery({
    queryKey: analyticsKeys.learning(),
    queryFn: () => analyticsService.getLearningAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCodingAnalyticsSummary(options?: QOptions<CodingAnalyticsSummary>) {
  return useQuery({
    queryKey: analyticsKeys.coding(),
    queryFn: () => analyticsService.getCodingAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useProjectAnalytics(options?: QOptions<ProjectAnalytics>) {
  return useQuery({
    queryKey: analyticsKeys.projects(),
    queryFn: () => analyticsService.getProjectAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function usePlacementAnalytics(options?: QOptions<PlacementAnalytics>) {
  return useQuery({
    queryKey: analyticsKeys.placement(),
    queryFn: () => analyticsService.getPlacementAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
