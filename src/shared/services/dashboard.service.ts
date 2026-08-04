import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'

export interface LeaderboardEntry {
  rank: number
  userId: string
  fullName: string
  xp: number
  profileImage?: string
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  currentUserRank: number
  currentUserXp: number
  totalUsers: number
}

export interface DailyTasksResponse {
  codingChallenge: {
    id: string
    title: string
    slug: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    completed: boolean
  } | null
  lesson: {
    id: string
    title: string
    roadmapSlug?: string
    completed: boolean
  } | null
}

export interface DashboardActivityDay {
  date: string
  count: number
}

export const dashboardService = {
  getLeaderboard: () =>
    axiosInstance.get<ApiResponse<LeaderboardResponse>>('/leaderboard'),

  getDailyTasks: () =>
    axiosInstance.get<ApiResponse<DailyTasksResponse>>('/dashboard/daily-tasks'),

  getActivityHeatmap: (year?: number) =>
    axiosInstance.get<ApiResponse<DashboardActivityDay[]>>('/dashboard/activity', {
      params: year ? { year } : undefined,
    }),
}
