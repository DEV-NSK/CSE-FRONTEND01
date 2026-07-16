import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/shared/services/admin.service'
import type { PlatformSettings } from '@/shared/types/admin'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: (params?: object) => [...adminKeys.all, 'users', params] as const,
  resource: (name: string, params?: object) => [...adminKeys.all, name, params] as const,
  reports: (params?: object) => [...adminKeys.all, 'reports', params] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useAdminResource<T>(resource: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: adminKeys.resource(resource, params),
    queryFn: () => adminService.getAdminResource<T>(resource, params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useAdminReports(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.reports(params),
    queryFn: () => adminService.getReports(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: () => adminService.getPlatformSettings().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useCreateAdminResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminService.createAdminResource(resource, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resource(resource) })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useUpdateAdminResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminService.updateAdminResource(resource, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resource(resource) })
    },
  })
}

export function useDeleteAdminResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdminResource(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resource(resource) })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useBulkDeleteAdminResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => adminService.bulkDeleteAdminResource(resource, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resource(resource) })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: string) => adminService.generateReport(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
    },
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) =>
      adminService.updatePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() })
    },
  })
}
