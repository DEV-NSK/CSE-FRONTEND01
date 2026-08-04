/**
 * FPRD-23: Profile Service
 * All profile API endpoints — avatar, socials, privacy, completion, activity, analytics
 */
import axiosInstance from '@/shared/lib/axios'
import type { User, ApiResponse, PublicProfile, ProfileCompletion } from '@/types'

export interface UpdateProfilePayload {
  // Basic
  name?: string
  fullName?: string
  bio?: string
  headline?: string
  // Academic
  college?: string
  collegeName?: string
  branch?: string
  year?: number
  currentYear?: number
  semester?: number
  phone?: string
  phoneNumber?: string
  // Social
  github?: string
  githubUrl?: string
  linkedin?: string
  linkedinUrl?: string
  website?: string
  portfolioUrl?: string
  // FPRD-23 new fields
  username?: string
  twitter?: string
  twitterUrl?: string
  youtube?: string
  youtubeUrl?: string
  leetcode?: string
  leetcodeUrl?: string
  codechef?: string
  codechefUrl?: string
  hackerrank?: string
  hackerrankUrl?: string
  codeforces?: string
  codeforcesUrl?: string
  gfg?: string
  gfgUrl?: string
  medium?: string
  mediumUrl?: string
  profileVisibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
}

export interface ActivityItem {
  type: string
  label: string
  time: string
  icon: string
}

export interface ProfileAnalytics {
  totalSubmissions: number
  accepted: number
  rejected: number
  acceptanceRate: number
  lessonsCompleted: number
  teamsJoined: number
}

export interface ProfileProject {
  id: string
  title: string
  description: string | null
  slug: string
  difficulty: string
  githubRepository: string | null
  liveDemo: string | null
  role: string
  technologies: string[]
}

export interface ProfileAchievement {
  id: number
  name: string
  icon: string
  earned: boolean
  earnedAt?: string
}

export const profileService = {
  /** GET /api/profile — own profile */
  getProfile: () =>
    axiosInstance.get<ApiResponse<User>>('/profile'),

  /** PUT /api/profile — update all profile fields */
  updateProfile: (payload: UpdateProfilePayload) =>
    axiosInstance.put<ApiResponse<User>>('/profile', payload),

  /** PATCH /api/profile/avatar — upload profile photo */
  uploadAvatar: (file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return axiosInstance.patch<ApiResponse<{ avatarUrl: string }>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
  },

  /** DELETE /api/profile/avatar — remove profile photo */
  deleteAvatar: () =>
    axiosInstance.delete<ApiResponse<{ avatarUrl: null }>>('/profile/avatar'),

  /** PATCH /api/profile/socials — update social links only */
  updateSocials: (links: Partial<UpdateProfilePayload>) =>
    axiosInstance.patch<ApiResponse<User>>('/profile/socials', links),

  /** PATCH /api/profile/privacy — update visibility */
  updatePrivacy: (visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') =>
    axiosInstance.patch<ApiResponse<User>>('/profile/privacy', { visibility }),

  /** GET /api/profile/completion — completion % and details */
  getCompletion: () =>
    axiosInstance.get<ApiResponse<ProfileCompletion>>('/profile/completion'),

  /** GET /api/profile/activity — recent activity timeline */
  getActivity: () =>
    axiosInstance.get<ApiResponse<ActivityItem[]>>('/profile/activity'),

  /** GET /api/profile/analytics — coding & learning stats */
  getAnalytics: () =>
    axiosInstance.get<ApiResponse<ProfileAnalytics>>('/profile/analytics'),

  /** GET /api/profile/projects — user's projects */
  getProjects: () =>
    axiosInstance.get<ApiResponse<ProfileProject[]>>('/profile/projects'),

  /** GET /api/profile/achievements — user's achievements */
  getAchievements: () =>
    axiosInstance.get<ApiResponse<ProfileAchievement[]>>('/profile/achievements'),

  /** GET /api/profile/:username — public profile (no auth required) */
  getPublicProfile: (username: string) =>
    axiosInstance.get<ApiResponse<PublicProfile>>(`/profile/${username}`),

  /** PUT /api/profile/change-password */
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    axiosInstance.put<ApiResponse<null>>('/profile/change-password', payload),

  /** Helper: get shareable profile URL */
  getShareableUrl: (user: User): string => {
    const handle = user.username ?? user.fullName.toLowerCase().replace(/\s+/g, '')
    return `${window.location.origin}/u/${handle}`
  },

  /** Helper: validate URL */
  isValidUrl: (url: string): boolean => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
}
