// ─── FPRD-16: Question Bank React Query Hooks ────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { questionBankService } from '@/shared/services/questionBank.service'

export const questionBankKeys = {
  all: ['questionBank'] as const,
  topics: () => [...questionBankKeys.all, 'topics'] as const,
  topic: (slug: string, params?: object) =>
    [...questionBankKeys.all, 'topic', slug, params] as const,
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
