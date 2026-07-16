import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { AppNotification, NotificationFilters } from '@/shared/types/notifications'

export const notificationsService = {
  getNotifications: (filters?: Partial<NotificationFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<AppNotification>>>('/notifications', {
      params: filters,
    }),

  getUnreadCount: () =>
    axiosInstance.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    axiosInstance.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.patch<ApiResponse<void>>('/notifications/read-all'),

  deleteNotification: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/notifications/${id}`),

  deleteAllRead: () =>
    axiosInstance.delete<ApiResponse<void>>('/notifications/read'),
}
