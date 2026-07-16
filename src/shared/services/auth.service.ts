import axiosInstance from '@/shared/lib/axios'
import type { User, ApiResponse } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  college?: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

export interface VerifyEmailPayload {
  email: string
  otp: string
}

export interface AuthResponseData {
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/register', payload),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/reset-password', payload),

  verifyEmail: (payload: VerifyEmailPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/verify-email', payload),

  resendVerification: (email: string) =>
    axiosInstance.post<ApiResponse<null>>('/auth/resend-verification', { email }),

  getMe: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),
}
