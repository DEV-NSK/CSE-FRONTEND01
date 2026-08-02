import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { activityService, type ActivityItem, type ActivityListParams } from '@/shared/services/activity.service'
import { useAuthStore } from '@/shared/store/authStore'
import type { PaginatedResponse } from '@/types'

export const activityKeys = {
  all: ['activity'] as const,
  list: (params?: ActivityListParams) => [...activityKeys.all, 'list', params] as const,
}

type QOptions<T> = Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useActivity(params?: ActivityListParams, options?: QOptions<PaginatedResponse<ActivityItem>>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activityService.getActivity(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
    ...options,
  })
}
