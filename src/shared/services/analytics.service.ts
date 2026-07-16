import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type { OverallAnalytics, HeatmapData } from '@/shared/types/analytics'

export const analyticsService = {
  getOverallAnalytics: () =>
    axiosInstance.get<ApiResponse<OverallAnalytics>>('/analytics'),

  getHeatmap: (year?: number) =>
    axiosInstance.get<ApiResponse<HeatmapData[]>>('/analytics/heatmap', {
      params: { year },
    }),

  getLearningAnalytics: () =>
    axiosInstance.get<ApiResponse<OverallAnalytics['learning']>>('/analytics/learning'),

  getCodingAnalytics: () =>
    axiosInstance.get<ApiResponse<OverallAnalytics['coding']>>('/analytics/coding'),

  getProjectAnalytics: () =>
    axiosInstance.get<ApiResponse<OverallAnalytics['projects']>>('/analytics/projects'),

  getPlacementAnalytics: () =>
    axiosInstance.get<ApiResponse<OverallAnalytics['placement']>>('/analytics/placement'),
}
