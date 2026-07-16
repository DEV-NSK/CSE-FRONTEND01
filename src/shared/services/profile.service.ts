import axiosInstance from '@/shared/lib/axios'
import type { User, ApiResponse } from '@/types'

export interface UpdateProfilePayload {
  name?: string
  bio?: string
  college?: string
  branch?: string
  year?: number
  phone?: string
  github?: string
  linkedin?: string
  website?: string
}

export const profileService = {
  getProfile: () =>
    axiosInstance.get<ApiResponse<User>>('/profile'),

  updateProfile: (payload: UpdateProfilePayload) =>
    axiosInstance.put<ApiResponse<User>>('/profile', payload),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return axiosInstance.post<ApiResponse<{ avatarUrl: string }>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    axiosInstance.put<ApiResponse<null>>('/profile/change-password', payload),
}
