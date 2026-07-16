import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  LearningCategory,
  Roadmap,
  RoadmapSection,
  Lesson,
  Resource,
  LearningProgress,
  LearningStats,
  Bookmark,
  RecentlyViewed,
  SearchResults,
  ContinueLearning,
  RoadmapFilters,
  BookmarkFilters,
} from '@/shared/types/learning'

// ─── Categories ──────────────────────────────────────────────────────────────

export const learningService = {
  // Categories
  getCategories: (params?: { search?: string; sort?: string }) =>
    axiosInstance.get<ApiResponse<LearningCategory[]>>('/learning/categories', { params }),

  getCategoryBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<LearningCategory>>(`/learning/categories/${slug}`),

  // Roadmaps
  getRoadmaps: (filters?: Partial<RoadmapFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Roadmap>>>('/learning/roadmaps', { params: filters }),

  getRoadmapBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Roadmap & { sections: RoadmapSection[] }>>(`/learning/roadmaps/${slug}`),

  getRoadmapsByCategory: (categoryId: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Roadmap>>>(`/learning/categories/${categoryId}/roadmaps`, { params }),

  // Lessons
  getLessonById: (id: string) =>
    axiosInstance.get<ApiResponse<Lesson>>(`/learning/lessons/${id}`),

  markLessonComplete: (id: string) =>
    axiosInstance.post<ApiResponse<LearningProgress>>(`/learning/lessons/${id}/complete`),

  markLessonStarted: (id: string) =>
    axiosInstance.post<ApiResponse<void>>(`/learning/lessons/${id}/start`),

  // Resources
  getResourceById: (id: string) =>
    axiosInstance.get<ApiResponse<Resource>>(`/learning/resources/${id}`),

  getResourcesByLesson: (lessonId: string) =>
    axiosInstance.get<ApiResponse<Resource[]>>(`/learning/lessons/${lessonId}/resources`),

  // Progress
  getRoadmapProgress: (roadmapId: string) =>
    axiosInstance.get<ApiResponse<LearningProgress>>(`/learning/roadmaps/${roadmapId}/progress`),

  getLearningStats: () =>
    axiosInstance.get<ApiResponse<LearningStats>>('/learning/stats'),

  // Continue Learning
  getContinueLearning: () =>
    axiosInstance.get<ApiResponse<ContinueLearning | null>>('/learning/continue'),

  // Bookmarks
  getBookmarks: (params?: Partial<BookmarkFilters>) =>
    axiosInstance.get<ApiResponse<Bookmark[]>>('/learning/bookmarks', { params }),

  addBookmark: (type: string, itemId: string) =>
    axiosInstance.post<ApiResponse<Bookmark>>('/learning/bookmarks', { type, itemId }),

  removeBookmark: (bookmarkId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/learning/bookmarks/${bookmarkId}`),

  toggleRoadmapBookmark: (roadmapId: string) =>
    axiosInstance.post<ApiResponse<{ isBookmarked: boolean }>>(`/learning/roadmaps/${roadmapId}/bookmark`),

  toggleLessonBookmark: (lessonId: string) =>
    axiosInstance.post<ApiResponse<{ isBookmarked: boolean }>>(`/learning/lessons/${lessonId}/bookmark`),

  // Recently Viewed
  getRecentlyViewed: (params?: { limit?: number }) =>
    axiosInstance.get<ApiResponse<RecentlyViewed[]>>('/learning/recent', { params }),

  // Search
  search: (query: string) =>
    axiosInstance.get<ApiResponse<SearchResults>>('/learning/search', { params: { q: query } }),
}
