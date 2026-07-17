import axiosInstance from '@/shared/lib/axios'
import type { User, ApiResponse } from '@/types'

// ── Request payload types ─────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
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

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfilePayload {
  fullName?: string
  phoneNumber?: string
  bio?: string
  collegeName?: string
  branch?: string
  currentYear?: number
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
}

// ── Response types ────────────────────────────────────────────────────────────

export interface AuthResponseData {
  user: User
  accessToken: string
  refreshToken: string
}

export interface TokenRefreshData {
  accessToken: string
  refreshToken: string
}

// ── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /** POST /auth/login — returns user + tokens */
  login: (payload: LoginPayload) =>
    axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/login', payload),

  /** POST /auth/register — creates account + immediate login (no email confirmation) */
  register: (payload: RegisterPayload) =>
    axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/register', payload),

  /** POST /auth/logout — invalidates refresh token */
  logout: (refreshToken?: string) =>
    axiosInstance.post('/auth/logout', refreshToken ? { refreshToken } : {}),

  /** POST /auth/forgot-password — sends OTP to email */
  forgotPassword: (payload: ForgotPasswordPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', payload),

  /** POST /auth/reset-password — resets password using OTP */
  resetPassword: (payload: ResetPasswordPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/reset-password', payload),

  /** POST /auth/verify-email — verifies email using OTP (legacy flow) */
  verifyEmail: (payload: VerifyEmailPayload) =>
    axiosInstance.post<ApiResponse<null>>('/auth/verify-email', payload),

  /** POST /auth/resend-verification — resends email verification OTP */
  resendVerification: (email: string) =>
    axiosInstance.post<ApiResponse<null>>('/auth/resend-verification', { email }),

  /**
   * PRD-08: GET /auth/me
   * Always fetches the latest user data (including role) from the database.
   * Call this on every page reload — never rely on cached role.
   */
  getMe: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),

  /**
   * PRD-08: POST /auth/refresh
   * Rotate the access token using the refresh token.
   */
  refreshTokens: (refreshToken: string) =>
    axiosInstance.post<ApiResponse<TokenRefreshData>>('/auth/refresh', { refreshToken }),

  /**
   * PRD-08: PATCH /auth/change-password
   * Change password for authenticated user.
   */
  changePassword: (payload: ChangePasswordPayload) =>
    axiosInstance.patch<ApiResponse<null>>('/auth/change-password', payload),

  /**
   * PRD-08: PATCH /auth/update-profile
   * Update profile fields for authenticated user.
   */
  updateProfile: (payload: UpdateProfilePayload) =>
    axiosInstance.patch<ApiResponse<User>>('/auth/update-profile', payload),
}
