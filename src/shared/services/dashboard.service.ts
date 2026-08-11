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

// PRD-FINAL-01 §36-37: Aggregated dashboard response
export interface AggregatedDashboard {
  user: {
    id: string
    fullName: string
    profileImage: string | null
    profileCompletion: number
    role: string
  } | null
  learningSummary: {
    completedLessons: number
    totalLessons: number
    progressPercentage: number
  }
  continueLearning: {
    contentId: string
    topicName: string
    slug: string
    courseId: string
    progressStatus: string
  } | null
  dailyTasks: DailyTasksResponse
  codingAnalytics: {
    totalSubmissions: number
    acceptedSubmissions: number
    submissionsToday: number
    acceptanceRate: number
  }
  leaderboard: {
    entries: LeaderboardEntry[]
    currentUserRank: number
    currentUserXp: number
  }
}

export const dashboardService = {
  /** PRD-FINAL-01 §36: Single aggregated request instead of 10 individual ones */
  getAggregated: () =>
    axiosInstance.get<ApiResponse<AggregatedDashboard>>('/dashboard'),

  getLeaderboard: () =>
    axiosInstance.get<ApiResponse<LeaderboardResponse>>('/leaderboard'),

  getDailyTasks: () =>
    axiosInstance.get<ApiResponse<DailyTasksResponse>>('/dashboard/daily-tasks'),

  getActivityHeatmap: (year?: number) =>
    axiosInstance.get<ApiResponse<DashboardActivityDay[]>>('/dashboard/activity', {
      params: year ? { year } : undefined,
    }),
}
