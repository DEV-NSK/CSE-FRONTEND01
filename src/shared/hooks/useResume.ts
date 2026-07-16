import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resumeService } from '@/shared/services/resume.service'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const resumeKeys = {
  all: ['resume'] as const,
  list: () => [...resumeKeys.all, 'list'] as const,
  detail: (id: string) => [...resumeKeys.all, 'detail', id] as const,
  sections: (resumeId: string) => [...resumeKeys.all, 'sections', resumeId] as const,
  templates: () => [...resumeKeys.all, 'templates'] as const,
  atsScore: (resumeId: string) => [...resumeKeys.all, 'atsScore', resumeId] as const,
}

// ─── Resumes ──────────────────────────────────────────────────────────────────

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.list(),
    queryFn: () => resumeService.getResumes().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => resumeService.getResumeById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; template: string }) => resumeService.createResume(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list() })
    },
  })
}

export function useUpdateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<{ title: string; template: string; isDefault: boolean }>
    }) => resumeService.updateResume(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: resumeKeys.list() })
    },
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list() })
    },
  })
}

export function useSetDefaultResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list() })
    },
  })
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export function useResumeSections(resumeId: string) {
  return useQuery({
    queryKey: resumeKeys.sections(resumeId),
    queryFn: () => resumeService.getSections(resumeId).then((r) => r.data.data),
    enabled: !!resumeId,
    staleTime: 1000 * 60 * 1,
  })
}

export function useAddResumeSection(resumeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      type: string
      title: string
      content: Record<string, unknown>
      order: number
    }) => resumeService.addSection(resumeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.sections(resumeId) })
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(resumeId) })
    },
  })
}

export function useUpdateResumeSection(resumeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string
      data: Partial<{ title: string; content: Record<string, unknown>; order: number }>
    }) => resumeService.updateSection(resumeId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.sections(resumeId) })
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(resumeId) })
    },
  })
}

export function useDeleteResumeSection(resumeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sectionId: string) => resumeService.deleteSection(resumeId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.sections(resumeId) })
    },
  })
}

export function useReorderResumeSections(resumeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sectionOrders: { id: string; order: number }[]) =>
      resumeService.reorderSections(resumeId, sectionOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.sections(resumeId) })
    },
  })
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function useResumeTemplates() {
  return useQuery({
    queryKey: resumeKeys.templates(),
    queryFn: () => resumeService.getTemplates().then((r) => r.data.data),
    staleTime: 1000 * 60 * 60,
  })
}

// ─── ATS Score ────────────────────────────────────────────────────────────────

export function useAtsScore(resumeId: string) {
  return useQuery({
    queryKey: resumeKeys.atsScore(resumeId),
    queryFn: () => resumeService.getAtsScore(resumeId).then((r) => r.data.data),
    enabled: !!resumeId,
    staleTime: 1000 * 60 * 5,
  })
}
