import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'

export type ActivityType = 'lesson_completed' | 'quiz_passed' | 'roadmap_started'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  relatedId?: string
  relatedType?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface ActivityListParams {
  limit?: number
  page?: number
  type?: ActivityType
}

export const activityService = {
  getActivity: (params?: ActivityListParams) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<ActivityItem>>>('/activity', { params }),
}
