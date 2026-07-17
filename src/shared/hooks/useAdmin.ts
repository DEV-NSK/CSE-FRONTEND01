import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/shared/services/admin.service'
import type { PlatformSettings } from '@/shared/types/admin'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: (params?: object) => [...adminKeys.all, 'users', params] as const,
  userById: (id: string) => [...adminKeys.all, 'user', id] as const,
  managers: (params?: object) => [...adminKeys.all, 'managers', params] as const,
  resource: (name: string, params?: object) => [...adminKeys.all, name, params] as const,
  reports: (params?: object) => [...adminKeys.all, 'reports', params] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  auditLogs: (params?: object) => [...adminKeys.all, 'auditLogs', params] as const,
  systemLogs: (params?: object) => [...adminKeys.all, 'systemLogs', params] as const,
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
    queryFn: () => adminService.getSuperAdminUsers(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useAdminUserById(id: string) {
  return useQuery({
    queryKey: adminKeys.userById(id),
    queryFn: () => adminService.getSuperAdminUserById(id).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  })
}

export function useAdminManagers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.managers(params),
    queryFn: () => adminService.getManagers(params).then((r) => r.data.data),
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

export function useAdminAuditLogs(params?: {
  role?: string; action?: string; module?: string;
  userId?: string; startDate?: string; endDate?: string;
  page?: number; limit?: number
}) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params).then((r) => r.data.data) as Promise<{
      data: {
        id: string; action: string; role: string; module: string | null;
        entity: string | null; ipAddress: string | null; createdAt: string;
        performer?: { id: string; fullName: string; email: string; role: string }
      }[];
      total: number; page: number; limit: number
    }>,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    placeholderData: (prev) => prev,
  })
}

export function useAdminSystemLogs(params?: {
  level?: string; module?: string; startDate?: string; endDate?: string;
  page?: number; limit?: number
}) {
  return useQuery({
    queryKey: adminKeys.systemLogs(params),
    queryFn: () => adminService.getSystemLogs(params).then((r) => r.data.data) as Promise<{
      data: { id: string; level: string; module: string; message: string; createdAt: string }[];
      total: number; page: number; limit: number
    }>,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    placeholderData: (prev) => prev,
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

export function usePromoteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason, modules }: { id: string; reason?: string; modules?: Record<string, boolean> }) =>
      adminService.promoteUser(id, reason, modules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.managers() })
    },
  })
}

export function useDemoteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.demoteUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.managers() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteSuperAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useUpdateManagerPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: Record<string, boolean> }) =>
      adminService.updateManagerPermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.managers() })
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

export function useSendManagerInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => adminService.sendManagerInvitation(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.managers() })
    },
  })
}
