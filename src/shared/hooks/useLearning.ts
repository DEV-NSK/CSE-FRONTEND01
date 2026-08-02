import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { learningService } from '@/shared/services/learning.service'
import type { RoadmapFilters, BookmarkFilters } from '@/shared/types/learning'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const learningKeys = {
  all: ['learning'] as const,
  categories: (params?: object) => [...learningKeys.all, 'categories', params] as const,
  category: (slug: string) => [...learningKeys.all, 'category', slug] as const,
  roadmaps: (filters?: Partial<RoadmapFilters>) => [...learningKeys.all, 'roadmaps', filters] as const,
  roadmap: (slug: string) => [...learningKeys.all, 'roadmap', slug] as const,
  lesson: (id: string) => [...learningKeys.all, 'lesson', id] as const,
  lessonPractice: (lessonId: string) => [...learningKeys.all, 'lesson-practice', lessonId] as const,
  lessonQuiz: (lessonId: string) => [...learningKeys.all, 'lesson-quiz', lessonId] as const,
  lessonNotes: (lessonId: string) => [...learningKeys.all, 'lesson-notes', lessonId] as const,
  resource: (id: string) => [...learningKeys.all, 'resource', id] as const,
  stats: () => [...learningKeys.all, 'stats'] as const,
  continueLearning: () => [...learningKeys.all, 'continue'] as const,
  bookmarks: (filters?: Partial<BookmarkFilters>) => [...learningKeys.all, 'bookmarks', filters] as const,
  recentlyViewed: () => [...learningKeys.all, 'recent'] as const,
  search: (query: string) => [...learningKeys.all, 'search', query] as const,
}

// ─── Prefetch Utilities ──────────────────────────────────────────────────────

export async function prefetchLesson(lessonId: string): Promise<void> {
  if (!lessonId) return
  const queryClient = (await import('@/shared/lib/queryClient')).queryClient
  await queryClient.prefetchQuery({
    queryKey: learningKeys.lesson(lessonId),
    queryFn: () => learningService.getLessonById(lessonId).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories(params?: { search?: string; sort?: string }) {
  return useQuery({
    queryKey: learningKeys.categories(params),
    queryFn: () => learningService.getCategories(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: learningKeys.category(slug),
    queryFn: () => learningService.getCategoryBySlug(slug).then((r) => r.data.data),
    enabled: !!slug,
  })
}

// ─── Roadmaps ────────────────────────────────────────────────────────────────

export function useRoadmaps(filters?: Partial<RoadmapFilters>) {
  return useQuery({
    queryKey: learningKeys.roadmaps(filters),
    queryFn: () => learningService.getRoadmaps(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useRoadmap(slug: string) {
  return useQuery({
    queryKey: learningKeys.roadmap(slug),
    queryFn: () => learningService.getRoadmapBySlug(slug).then((r) => r.data.data),
    enabled: !!slug,
  })
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export function useLesson(id: string) {
  return useQuery({
    queryKey: learningKeys.lesson(id),
    queryFn: () => learningService.getLessonById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => learningService.markLessonComplete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lesson(id) })
      queryClient.invalidateQueries({ queryKey: learningKeys.all })
    },
  })
}

export function useMarkLessonStarted() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => learningService.markLessonStarted(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lesson(id) })
      queryClient.invalidateQueries({ queryKey: learningKeys.continueLearning() })
    },
  })
}

// ─── Resources ───────────────────────────────────────────────────────────────

export function useResource(id: string) {
  return useQuery({
    queryKey: learningKeys.resource(id),
    queryFn: () => learningService.getResourceById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function useLearningStats() {
  return useQuery({
    queryKey: learningKeys.stats(),
    queryFn: () => learningService.getLearningStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Continue Learning ───────────────────────────────────────────────────────

export function useContinueLearning() {
  return useQuery({
    queryKey: learningKeys.continueLearning(),
    queryFn: () => learningService.getContinueLearning().then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function useBookmarks(filters?: Partial<BookmarkFilters>) {
  return useQuery({
    queryKey: learningKeys.bookmarks(filters),
    queryFn: () => learningService.getBookmarks(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useToggleRoadmapBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roadmapId: string) => learningService.toggleRoadmapBookmark(roadmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.bookmarks() })
      queryClient.invalidateQueries({ queryKey: learningKeys.roadmaps() })
    },
  })
}

export function useToggleLessonBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => learningService.toggleLessonBookmark(lessonId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lesson(id) })
      queryClient.invalidateQueries({ queryKey: learningKeys.bookmarks() })
    },
  })
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookmarkId: string) => learningService.removeBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.bookmarks() })
    },
  })
}

// ─── Recently Viewed ─────────────────────────────────────────────────────────

export function useRecentlyViewed(limit?: number) {
  return useQuery({
    queryKey: learningKeys.recentlyViewed(),
    queryFn: () => learningService.getRecentlyViewed({ limit }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery({
    queryKey: learningKeys.search(query),
    queryFn: () => learningService.search(query).then((r) => r.data.data),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 30,
  })
}

// ─── Lesson Notes ────────────────────────────────────────────────────────────

export function useLessonNotes(lessonId: string) {
  return useQuery({
    queryKey: learningKeys.lessonNotes(lessonId),
    queryFn: () => learningService.getLessonNotes(lessonId).then((r) => r.data.data),
    enabled: !!lessonId,
    staleTime: 1000 * 60,
  })
}

export function useCreateLessonNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, content }: { lessonId: string; content: string }) =>
      learningService.createLessonNote(lessonId, content),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lessonNotes(lessonId) })
    },
  })
}

export function useUpdateLessonNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, noteId, content }: { lessonId: string; noteId: string; content: string }) =>
      learningService.updateLessonNote(lessonId, noteId, content),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lessonNotes(lessonId) })
    },
  })
}

export function useDeleteLessonNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, noteId }: { lessonId: string; noteId: string }) =>
      learningService.deleteLessonNote(lessonId, noteId),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lessonNotes(lessonId) })
    },
  })
}

// ─── Practice Questions ──────────────────────────────────────────────────────

export function useLessonPractice(lessonId: string) {
  return useQuery({
    queryKey: learningKeys.lessonPractice(lessonId),
    queryFn: () => learningService.getLessonPractice(lessonId).then((r) => r.data.data),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Quiz Questions ──────────────────────────────────────────────────────────

export function useLessonQuiz(lessonId: string) {
  return useQuery({
    queryKey: learningKeys.lessonQuiz(lessonId),
    queryFn: () => learningService.getLessonQuiz(lessonId).then((r) => r.data.data),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, answers }: { lessonId: string; answers: Record<string, number> }) =>
      learningService.submitQuiz(lessonId, answers),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.lesson(lessonId) })
      queryClient.invalidateQueries({ queryKey: learningKeys.all })
    },
  })
}
