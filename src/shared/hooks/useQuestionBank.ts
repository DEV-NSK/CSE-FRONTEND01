// ─── FPRD-16: Question Bank React Query Hooks ────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { questionBankService } from '@/shared/services/questionBank.service'
import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'

export const questionBankKeys = {
  all: ['questionBank'] as const,
  topics: () => [...questionBankKeys.all, 'topics'] as const,
  topic: (slug: string, params?: object) =>
    [...questionBankKeys.all, 'topic', slug, params] as const,
  progress: () => [...questionBankKeys.all, 'progress'] as const,
  topicProgress: (slug: string) => [...questionBankKeys.all, 'progress', slug] as const,
}

export interface TopicProgress {
  id: string
  name: string
  slug: string
  totalProblems: number
  totalEasy: number
  totalMedium: number
  totalHard: number
  solved: number
  solvedEasy: number
  solvedMedium: number
  solvedHard: number
  attempted: number
  bookmarked: number
  completionPct: number
  avgRuntime: number
}

/** Fetches all active topics with problem counts */
export function useQuestionBankTopics() {
  return useQuery({
    queryKey: questionBankKeys.topics(),
    queryFn: async () => {
      const r = await questionBankService.getTopics()
      const raw = r.data?.data
      if (Array.isArray(raw)) return raw
      return [] as any[]
    },
    staleTime: 1000 * 60 * 10,
  })
}

/** Fetches a single topic detail with problems grouped by difficulty */
export function useQuestionBankTopic(
  slug: string,
  params?: { search?: string; companyId?: string; tagId?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: questionBankKeys.topic(slug, params),
    queryFn: async () => {
      const r = await questionBankService.getTopicBySlug(slug, params)
      return r.data?.data
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

/** Fetches user's progress across all topics (authenticated) */
export function useQuestionBankProgress() {
  return useQuery({
    queryKey: questionBankKeys.progress(),
    queryFn: async () => {
      const r = await axiosInstance.get<ApiResponse<TopicProgress[]>>('/questions/progress')
      const raw = r.data?.data
      if (Array.isArray(raw)) return raw
      return [] as TopicProgress[]
    },
    staleTime: 1000 * 60 * 2, // 2 min — progress changes frequently
    retry: false, // Don't retry if user is not authenticated
  })
}

/** Fetches user's progress for a single topic (authenticated) */
export function useTopicProgress(slug: string) {
  return useQuery({
    queryKey: questionBankKeys.topicProgress(slug),
    queryFn: async () => {
      const r = await axiosInstance.get<ApiResponse<any>>(`/questions/progress/${slug}`)
      return r.data?.data
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })
}
