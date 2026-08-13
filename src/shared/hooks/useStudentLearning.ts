import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentLearningService } from '@/shared/services/student-learning.service'
import { useAuthStore } from '@/shared/store/authStore'
import type { LearningProgressStatus } from '@/shared/types/learning-cms'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const studentLearningKeys = {
  all: ['student-learning'] as const,
  dashboard: () => [...studentLearningKeys.all, 'dashboard'] as const,
  roadmap: () => [...studentLearningKeys.all, 'roadmap'] as const,
  content: (id: string) => [...studentLearningKeys.all, 'content', id] as const,
  continueLearning: () => [...studentLearningKeys.all, 'continue'] as const,
  progress: (contentId: string) =>
    [...studentLearningKeys.all, 'progress', contentId] as const,
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useStudentLearningDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: studentLearningKeys.dashboard(),
    queryFn: () => studentLearningService.getDashboard().then((r) => r.data.data),
    staleTime: 30 * 1000,
    enabled: isAuthenticated,
  })
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export function useStudentRoadmap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: studentLearningKeys.roadmap(),
    queryFn: () => studentLearningService.getRoadmap().then((r) => r.data.data),
    staleTime: 60 * 1000,
    enabled: isAuthenticated,
  })
}

// ─── Content / Lesson Detail ─────────────────────────────────────────────────

export function useStudentLearningContent(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: studentLearningKeys.content(id),
    queryFn: () => studentLearningService.getContentById(id).then((r) => r.data.data),
    enabled: isAuthenticated && !!id,
  })
}

// ─── Start Lesson ────────────────────────────────────────────────────────────

export function useStartLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) => studentLearningService.startLesson(contentId),
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.content(contentId) })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.roadmap() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.continueLearning() })
    },
  })
}

// ─── Complete Lesson ─────────────────────────────────────────────────────────

export function useCompleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) => studentLearningService.completeLesson(contentId),
    onSuccess: () => {
      // PRD-FINAL-01 §70: invalidate only related queries
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.roadmap() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.continueLearning() })
      // Also invalidate legacy stats since /learning/stats reads from lesson_progress
      queryClient.invalidateQueries({ queryKey: ['learning', 'stats'] })
      // Invalidate profile analytics so Lessons Done count updates on profile page
      queryClient.invalidateQueries({ queryKey: ['profile', 'analytics'] })
    },
  })
}

// ─── Update Progress Status ──────────────────────────────────────────────────

export function useUpdateProgressStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      contentId,
      status,
    }: {
      contentId: string
      status: LearningProgressStatus
    }) => studentLearningService.updateProgressStatus(contentId, status),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.content(contentId) })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.roadmap() })
      queryClient.invalidateQueries({ queryKey: studentLearningKeys.continueLearning() })
    },
  })
}

// ─── Continue Learning ───────────────────────────────────────────────────────

export function useStudentContinueLearning() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: studentLearningKeys.continueLearning(),
    queryFn: () => studentLearningService.getContinueLearning().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  })
}
