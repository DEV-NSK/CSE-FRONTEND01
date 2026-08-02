// ─── FPRD-16: Question Bank Service ──────────────────────────────────────────

import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type { QuestionBankTopic, QuestionBankTopicDetail } from '@/shared/types/questionBank'

export const questionBankService = {
  /** GET /coding/topics — all active topics with problem counts */
  getTopics: () =>
    axiosInstance.get<ApiResponse<QuestionBankTopic[]>>('/coding/topics'),

  /** GET /coding/topics/:slug — topic detail with problems grouped by difficulty */
  getTopicBySlug: (
    slug: string,
    params?: {
      search?: string
      companyId?: string
      tagId?: string
      page?: number
      limit?: number
    },
  ) =>
    axiosInstance.get<ApiResponse<QuestionBankTopicDetail>>(`/coding/topics/${slug}`, {
      params,
    }),
}
