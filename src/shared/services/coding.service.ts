import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  Problem,
  ProblemListItem,
  CodingTag,
  CodingCompany,
  CodingCategory,
  TestCase,
  CodeTemplate,
  Submission,
  RunResult,
  FavoriteProblem,
  DailyChallenge,
  PreviousChallenge,
  Discussion,
  DiscussionReply,
  CodingAnalytics,
  ProblemFilters,
  SubmissionFilters,
  Language,
} from '@/shared/types/coding'

export const codingService = {
  // ─── Problems ──────────────────────────────────────────────────────────────

  getProblems: (filters?: Partial<ProblemFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<ProblemListItem>>>('/coding/problems', {
      params: filters,
    }),

  getProblemBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Problem>>(`/coding/problems/${slug}`),

  // ─── Categories / Tags / Companies ─────────────────────────────────────────

  getCategories: () =>
    axiosInstance.get<ApiResponse<CodingCategory[]>>('/coding/categories'),

  getTags: () =>
    axiosInstance.get<ApiResponse<CodingTag[]>>('/coding/tags'),

  getCompanies: () =>
    axiosInstance.get<ApiResponse<CodingCompany[]>>('/coding/companies'),

  // ─── Test Cases & Templates ─────────────────────────────────────────────────

  getTestCases: (problemId: string) =>
    axiosInstance.get<ApiResponse<TestCase[]>>(`/coding/problems/${problemId}/test-cases`),

  getTemplates: (problemId: string) =>
    axiosInstance.get<ApiResponse<CodeTemplate[]>>(`/coding/problems/${problemId}/templates`),

  // ─── Run & Submit ───────────────────────────────────────────────────────────

  runCode: (payload: {
    problemId: string
    language: Language
    code: string
    customInput?: string
  }) => axiosInstance.post<ApiResponse<{ submissionId: string }>>('/coding/run', payload),

  submitCode: (payload: {
    problemId: string
    language: Language
    code: string
  }) => axiosInstance.post<ApiResponse<{ submissionId: string }>>('/coding/submit', payload),

  getSubmissionResult: (submissionId: string) =>
    axiosInstance.get<ApiResponse<RunResult>>(`/coding/submissions/${submissionId}/result`),

  // ─── Submissions ────────────────────────────────────────────────────────────

  getSubmissions: (filters?: Partial<SubmissionFilters>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Submission>>>('/coding/submissions', {
      params: filters,
    }),

  getSubmissionById: (id: string) =>
    axiosInstance.get<ApiResponse<Submission>>(`/coding/submissions/${id}`),

  getSubmissionsByProblem: (problemSlug: string) =>
    axiosInstance.get<ApiResponse<Submission[]>>(`/coding/problems/${problemSlug}/submissions`),

  // ─── Favorites ──────────────────────────────────────────────────────────────

  getFavorites: (params?: { search?: string; difficulty?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<FavoriteProblem>>>('/coding/favorites', {
      params,
    }),

  toggleFavorite: (problemId: string) =>
    axiosInstance.post<ApiResponse<{ isFavorite: boolean }>>(
      `/coding/problems/${problemId}/favorite`
    ),

  // ─── Daily Challenge ────────────────────────────────────────────────────────

  getDailyChallenge: () =>
    axiosInstance.get<ApiResponse<DailyChallenge>>('/coding/daily'),

  getPreviousChallenges: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<PreviousChallenge>>>(
      '/coding/daily/previous',
      { params }
    ),

  // ─── Discussions ────────────────────────────────────────────────────────────

  getDiscussions: (problemId: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Discussion>>>(
      `/coding/problems/${problemId}/discussions`,
      { params }
    ),

  createDiscussion: (problemId: string, payload: { title: string; content: string }) =>
    axiosInstance.post<ApiResponse<Discussion>>(
      `/coding/problems/${problemId}/discussions`,
      payload
    ),

  updateDiscussion: (discussionId: string, payload: { title?: string; content?: string }) =>
    axiosInstance.put<ApiResponse<Discussion>>(
      `/coding/discussions/${discussionId}`,
      payload
    ),

  deleteDiscussion: (discussionId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/coding/discussions/${discussionId}`),

  addReply: (discussionId: string, payload: { content: string }) =>
    axiosInstance.post<ApiResponse<DiscussionReply>>(
      `/coding/discussions/${discussionId}/replies`,
      payload
    ),

  updateReply: (replyId: string, payload: { content: string }) =>
    axiosInstance.put<ApiResponse<DiscussionReply>>(`/coding/replies/${replyId}`, payload),

  deleteReply: (replyId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/coding/replies/${replyId}`),

  // ─── Analytics ──────────────────────────────────────────────────────────────

  getAnalytics: () =>
    axiosInstance.get<ApiResponse<CodingAnalytics>>('/coding/analytics'),

  // ─── Recommended / Recent ───────────────────────────────────────────────────

  getRecommendedProblems: (params?: { limit?: number }) =>
    axiosInstance.get<ApiResponse<ProblemListItem[]>>('/coding/recommended', { params }),

  getRecentlySolved: (params?: { limit?: number }) =>
    axiosInstance.get<ApiResponse<ProblemListItem[]>>('/coding/recently-solved', { params }),

  getContinueSolving: (params?: { limit?: number }) =>
    axiosInstance.get<ApiResponse<ProblemListItem[]>>('/coding/continue', { params }),
}
