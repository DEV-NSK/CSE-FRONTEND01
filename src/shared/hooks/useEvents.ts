import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/shared/services/events.service'
import type { EventFilters } from '@/shared/types/events'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const eventKeys = {
  all: ['events'] as const,
  list: (filters?: Partial<EventFilters>) => [...eventKeys.all, 'list', filters] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  featured: (limit?: number) => [...eventKeys.all, 'featured', limit] as const,
  registered: (params?: object) => [...eventKeys.all, 'registered', params] as const,
  upcoming: (limit?: number) => [...eventKeys.all, 'upcoming', limit] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useEvents(filters?: Partial<EventFilters>) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsService.getEvents(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsService.getEventById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFeaturedEvents(limit = 4) {
  return useQuery({
    queryKey: eventKeys.featured(limit),
    queryFn: () => eventsService.getFeaturedEvents(limit).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRegisteredEvents(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: eventKeys.registered(params),
    queryFn: () => eventsService.getRegisteredEvents(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: eventKeys.upcoming(limit),
    queryFn: () => eventsService.getUpcomingEvents(limit).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useRegisterEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.registerEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      queryClient.invalidateQueries({ queryKey: eventKeys.registered() })
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() })
    },
  })
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.unregisterEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      queryClient.invalidateQueries({ queryKey: eventKeys.registered() })
    },
  })
}
