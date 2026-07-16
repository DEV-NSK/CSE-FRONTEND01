import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { notificationsService } from '@/shared/services/notifications.service'
import type { NotificationFilters } from '@/shared/types/notifications'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: Partial<NotificationFilters>) =>
    [...notificationKeys.all, 'list', filters] as const,
  infinite: (filters?: Partial<NotificationFilters>) =>
    [...notificationKeys.all, 'infinite', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNotificationList(filters?: Partial<NotificationFilters>) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsService.getNotifications(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 1,
    placeholderData: (prev) => prev,
  })
}

export function useInfiniteNotifications(filters?: Omit<NotificationFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      notificationsService
        .getNotifications({ ...filters, page: pageParam as number, limit: 20 })
        .then((r) => r.data.data),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 30,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount().then((r) => r.data.data.count),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // poll every minute
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteAllReadNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
