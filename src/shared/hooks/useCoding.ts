import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { codingService } from '@/shared/services/coding.service'
import type { ProblemFilters, SubmissionFilters, Language } from '@/shared/types/coding'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const codingKeys = {
  all: ['coding'] as const,
  problems: (filters?: Partial<ProblemFilters>) =>
    [...codingKeys.all, 'problems', filters] as const,
  problem: (slug: string) => [...codingKeys.all, 'problem', slug] as const,
  categories: () => [...codingKeys.all, 'categories'] as const,
  tags: () => [...codingKeys.all, 'tags'] as const,
  companies: () => [...codingKeys.all, 'companies'] as const,
  testCases: (problemId: string) => [...codingKeys.all, 'testCases', problemId] as const,
  templates: (problemId: string) => [...codingKeys.all, 'templates', problemId] as const,
  submissions: (filters?: Partial<SubmissionFilters>) =>
    [...codingKeys.all, 'submissions', filters] as const,
  submission: (id: string) => [...codingKeys.all, 'submission', id] as const,
  submissionResult: (id: string) => [...codingKeys.all, 'submissionResult', id] as const,
  problemSubmissions: (slug: string) =>
    [...codingKeys.all, 'problemSubmissions', slug] as const,
  favorites: (params?: object) => [...codingKeys.all, 'favorites', params] as const,
  daily: () => [...codingKeys.all, 'daily'] as const,
  previousChallenges: (params?: object) =>
    [...codingKeys.all, 'previousChallenges', params] as const,
  discussions: (problemId: string, params?: object) =>
    [...codingKeys.all, 'discussions', problemId, params] as const,
  analytics: () => [...codingKeys.all, 'analytics'] as const,
  recommended: (params?: object) => [...codingKeys.all, 'recommended', params] as const,
  recentlySolved: (params?: object) => [...codingKeys.all, 'recentlySolved', params] as const,
  continueSolving: (params?: object) => [...codingKeys.all, 'continueSolving', params] as const,
}

// ─── Problems ─────────────────────────────────────────────────────────────────

export function useProblems(filters?: Partial<ProblemFilters>) {
  return useQuery({
    queryKey: codingKeys.problems(filters),
    queryFn: () => codingService.getProblems(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: codingKeys.problem(slug),
    queryFn: () => codingService.getProblemBySlug(slug).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export function useCodingCategories() {
  return useQuery({
    queryKey: codingKeys.categories(),
    queryFn: () => codingService.getCategories().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCodingTags() {
  return useQuery({
    queryKey: codingKeys.tags(),
    queryFn: () => codingService.getTags().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCodingCompanies() {
  return useQuery({
    queryKey: codingKeys.companies(),
    queryFn: () => codingService.getCompanies().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function useTestCases(problemId: string) {
  return useQuery({
    queryKey: codingKeys.testCases(problemId),
    queryFn: () => codingService.getTestCases(problemId).then((r) => r.data.data),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useCodeTemplates(problemId: string) {
  return useQuery({
    queryKey: codingKeys.templates(problemId),
    queryFn: () => codingService.getTemplates(problemId).then((r) => r.data.data),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 60,
  })
}

// ─── Run / Submit ─────────────────────────────────────────────────────────────

export function useRunCode() {
  return useMutation({
    mutationFn: codingService.runCode,
  })
}

export function useSubmitCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: codingService.submitCode,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: codingKeys.problemSubmissions(vars.problemId) })
      queryClient.invalidateQueries({ queryKey: codingKeys.submissions() })
      queryClient.invalidateQueries({ queryKey: codingKeys.analytics() })
    },
  })
}

export function useSubmissionResult(submissionId: string, enabled: boolean) {
  return useQuery({
    queryKey: codingKeys.submissionResult(submissionId),
    queryFn: () => codingService.getSubmissionResult(submissionId).then((r) => r.data.data),
    enabled: !!submissionId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 1500
      const done = data.status !== 'pending' && data.status !== 'running'
      return done ? false : 1500
    },
    staleTime: 0,
  })
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function useSubmissions(filters?: Partial<SubmissionFilters>) {
  return useQuery({
    queryKey: codingKeys.submissions(filters),
    queryFn: () => codingService.getSubmissions(filters).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: codingKeys.submission(id),
    queryFn: () => codingService.getSubmissionById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useProblemSubmissions(problemSlug: string) {
  return useQuery({
    queryKey: codingKeys.problemSubmissions(problemSlug),
    queryFn: () => codingService.getSubmissionsByProblem(problemSlug).then((r) => r.data.data),
    enabled: !!problemSlug,
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export function useFavorites(params?: { search?: string; difficulty?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: codingKeys.favorites(params),
    queryFn: () => codingService.getFavorites(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: codingService.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: codingKeys.favorites() })
      queryClient.invalidateQueries({ queryKey: codingKeys.problems() })
    },
  })
}

// ─── Daily Challenge ──────────────────────────────────────────────────────────

export function useDailyChallenge() {
  return useQuery({
    queryKey: codingKeys.daily(),
    queryFn: () => codingService.getDailyChallenge().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function usePreviousChallenges(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: codingKeys.previousChallenges(params),
    queryFn: () => codingService.getPreviousChallenges(params).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  })
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export function useDiscussions(problemId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: codingKeys.discussions(problemId, params),
    queryFn: () => codingService.getDiscussions(problemId, params).then((r) => r.data.data),
    enabled: !!problemId,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateDiscussion(problemId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; content: string }) =>
      codingService.createDiscussion(problemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: codingKeys.discussions(problemId) })
      queryClient.invalidateQueries({ queryKey: codingKeys.problem(problemId) })
    },
  })
}

export function useUpdateDiscussion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { title?: string; content?: string }
    }) => codingService.updateDiscussion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...codingKeys.all, 'discussions'] })
    },
  })
}

export function useDeleteDiscussion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: codingService.deleteDiscussion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...codingKeys.all, 'discussions'] })
    },
  })
}

export function useAddReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ discussionId, content }: { discussionId: string; content: string }) =>
      codingService.addReply(discussionId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...codingKeys.all, 'discussions'] })
    },
  })
}

export function useDeleteReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: codingService.deleteReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...codingKeys.all, 'discussions'] })
    },
  })
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useCodingAnalytics() {
  return useQuery({
    queryKey: codingKeys.analytics(),
    queryFn: () => codingService.getAnalytics().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export function useRecommendedProblems(limit = 6) {
  return useQuery({
    queryKey: codingKeys.recommended({ limit }),
    queryFn: () => codingService.getRecommendedProblems({ limit }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRecentlySolved(limit = 5) {
  return useQuery({
    queryKey: codingKeys.recentlySolved({ limit }),
    queryFn: () => codingService.getRecentlySolved({ limit }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useContinueSolving(limit = 3) {
  return useQuery({
    queryKey: codingKeys.continueSolving({ limit }),
    queryFn: () => codingService.getContinueSolving({ limit }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Language labels ──────────────────────────────────────────────────────────

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
}

export const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rust',
}
