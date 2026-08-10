import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminLearningService } from '@/shared/services/admin-learning.service'
import type {
  AdminLearningContentFilters,
  LearningContentStatus,
  LearningLevelFormData,
  LearningContentFormData,
  NoteImageReorderData,
} from '@/shared/types/learning-cms'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const adminLearningKeys = {
  all: ['admin-learning'] as const,
  dashboard: () => [...adminLearningKeys.all, 'dashboard'] as const,
  levels: (params?: object) => [...adminLearningKeys.all, 'levels', params] as const,
  level: (id: string) => [...adminLearningKeys.all, 'level', id] as const,
  content: (filters?: AdminLearningContentFilters) =>
    [...adminLearningKeys.all, 'content', filters] as const,
  contentItem: (id: string) => [...adminLearningKeys.all, 'content-item', id] as const,
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useAdminLearningDashboard() {
  return useQuery({
    queryKey: adminLearningKeys.dashboard(),
    queryFn: () => adminLearningService.getDashboardStats().then((r) => r.data.data),
    staleTime: 60 * 1000,
  })
}

// ─── Levels ──────────────────────────────────────────────────────────────────

export function useAdminLearningLevels(params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: adminLearningKeys.levels(params),
    queryFn: () => adminLearningService.getLevels(params).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminLearningLevel(id: string) {
  return useQuery({
    queryKey: adminLearningKeys.level(id),
    queryFn: () => adminLearningService.getLevelById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateLearningLevel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LearningLevelFormData) => adminLearningService.createLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.levels() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useUpdateLearningLevel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LearningLevelFormData> }) =>
      adminLearningService.updateLevel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.level(id) })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.levels() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useDeleteLearningLevel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLearningService.deleteLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.levels() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
    },
  })
}

// ─── Content ─────────────────────────────────────────────────────────────────

export function useAdminLearningContent(filters?: AdminLearningContentFilters) {
  return useQuery({
    queryKey: adminLearningKeys.content(filters),
    queryFn: () => adminLearningService.getContentList(filters).then((r) => r.data.data),
    staleTime: 30 * 1000,
  })
}

export function useAdminLearningContentItem(id: string) {
  return useQuery({
    queryKey: adminLearningKeys.contentItem(id),
    queryFn: () => adminLearningService.getContentById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LearningContentFormData) => adminLearningService.createContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useUpdateLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LearningContentFormData> }) =>
      adminLearningService.updateContent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(id) })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useDeleteLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLearningService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function usePublishLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLearningService.publishContent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(id) })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useUnpublishLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLearningService.unpublishContent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(id) })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useArchiveLearningContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminLearningService.archiveContent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(id) })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useBulkUpdateContentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: LearningContentStatus }) =>
      adminLearningService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

export function useBulkDeleteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => adminLearningService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.content() })
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.dashboard() })
    },
  })
}

// ─── Notes Upload ────────────────────────────────────────────────────────────

export function useUploadNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, formData }: { contentId: string; formData: FormData }) =>
      adminLearningService.uploadNotes(contentId, formData),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(contentId) })
    },
  })
}

export function useDeleteNoteImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, imageId }: { contentId: string; imageId: string }) =>
      adminLearningService.deleteNoteImage(contentId, imageId),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(contentId) })
    },
  })
}

export function useReorderNoteImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      contentId,
      reorderData,
    }: {
      contentId: string
      reorderData: NoteImageReorderData[]
    }) => adminLearningService.reorderNoteImages(contentId, reorderData),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: adminLearningKeys.contentItem(contentId) })
    },
  })
}
