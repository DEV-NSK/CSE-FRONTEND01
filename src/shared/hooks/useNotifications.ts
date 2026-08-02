import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { notificationsService } from "@/shared/services/notifications.service";
import type {
  NotificationFilters,
  AppNotification,
} from "@/shared/types/notifications";
import type { PaginatedResponse } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filters?: Partial<NotificationFilters>) =>
    [...notificationKeys.all, "list", filters] as const,
  infinite: (filters?: Partial<NotificationFilters>) =>
    [...notificationKeys.all, "infinite", filters] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

type ListData = PaginatedResponse<AppNotification>;
type ListOptions = Omit<
  UseQueryOptions<ListData, Error, ListData, readonly unknown[]>,
  "queryKey" | "queryFn"
>;

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNotificationList(
  filters?: Partial<NotificationFilters>,
  options?: ListOptions,
) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () =>
      notificationsService.getNotifications(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 1,
    placeholderData: (prev) => prev,
    ...options,
  });
}

type InfiniteOptions = Omit<
  Parameters<
    typeof useInfiniteQuery<
      ListData,
      Error,
      ListData,
      readonly unknown[],
      number
    >
  >[0],
  "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
>;

export function useInfiniteNotifications(
  filters?: Omit<NotificationFilters, "page">,
  options?: InfiniteOptions,
) {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      notificationsService
        .getNotifications({ ...filters, page: pageParam as number, limit: 20 })
        .then((r) => r.data.data),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 30,
    ...options,
  });
}

export function useUnreadCount(
  options?: Omit<
    UseQueryOptions<number, Error, number, readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      try {
        return await notificationsService
          .getUnreadCount()
          .then((r) => r.data.data.count)
      } catch {
        // Endpoint may not be available — silently return 0 so the app keeps running
        return 0
      }
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    // Never let a failed unread-count call propagate as an error
    retry: false,
    ...options,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteAllReadNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
