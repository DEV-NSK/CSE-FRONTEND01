import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursePdfService } from '@/shared/services/course-pdf.service'
import { useAuthStore } from '@/shared/store/authStore'
import { toast } from '@/shared/hooks/useToast'

export const pdfKeys = {
  all:       ['course-pdfs'] as const,
  published: () => [...pdfKeys.all, 'published'] as const,
  admin:     () => [...pdfKeys.all, 'admin'] as const,
}

// ── Student: published PDFs ───────────────────────────────────────────────────

export function usePublishedPdfs() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: pdfKeys.published(),
    queryFn: () => coursePdfService.getPublishedPdfs().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  })
}

// ── Admin: all PDFs ───────────────────────────────────────────────────────────

export function useAdminPdfs() {
  return useQuery({
    queryKey: pdfKeys.admin(),
    queryFn: () => coursePdfService.adminGetAllPdfs().then((r) => r.data.data),
    staleTime: 1000 * 30,
  })
}

export function useAdminUploadPdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file, title, description, onProgress,
    }: {
      file: File
      title: string
      description: string
      onProgress?: (pct: number) => void
    }) => coursePdfService.adminUploadPdf(file, title, description, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKeys.all })
      toast({ title: 'PDF uploaded successfully' })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Upload failed', variant: 'destructive' })
    },
  })
}

export function useAdminUpdatePdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id, ...data
    }: {
      id: string
      title?: string
      description?: string
      isPublished?: boolean
      displayOrder?: number
    }) => coursePdfService.adminUpdatePdf(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKeys.all })
      toast({ title: 'PDF updated' })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Update failed', variant: 'destructive' })
    },
  })
}

export function useAdminDeletePdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursePdfService.adminDeletePdf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKeys.all })
      toast({ title: 'PDF deleted' })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Delete failed', variant: 'destructive' })
    },
  })
}
