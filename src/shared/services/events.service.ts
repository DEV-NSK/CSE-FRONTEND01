import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Event, EventListItem, EventFilters } from '@/shared/types/events'

export const eventsService = {
  getEvents: (filters?: Partial<EventFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<EventListItem>>>('/events', {
      params: filters,
    }),

  getEventById: (id: string) =>
    axiosInstance.get<ApiResponse<Event>>(`/events/${id}`),

  getFeaturedEvents: (limit = 4) =>
    axiosInstance.get<ApiResponse<EventListItem[]>>('/events/featured', { params: { limit } }),

  getRegisteredEvents: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<EventListItem>>>('/events/registered', {
      params,
    }),

  getUpcomingEvents: (limit = 5) =>
    axiosInstance.get<ApiResponse<EventListItem[]>>('/events/upcoming', { params: { limit } }),

  registerEvent: (id: string) =>
    axiosInstance.post<ApiResponse<{ isRegistered: boolean }>>(`/events/${id}/register`),

  unregisterEvent: (id: string) =>
    axiosInstance.delete<ApiResponse<{ isRegistered: boolean }>>(`/events/${id}/register`),
}
