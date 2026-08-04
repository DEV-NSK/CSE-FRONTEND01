export type Theme = 'light' | 'dark' | 'system'

/**
 * PRD-08: Role enum matches backend exactly (UPPERCASE).
 */
export type UserRole = 'STUDENT' | 'MANAGER' | 'SUPER_ADMIN'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  profileImage?: string
  bio?: string
  collegeName?: string
  branch?: string
  currentYear?: number
  phoneNumber?: string
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  isVerified: boolean
  profileCompletion?: number
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  /** PRD-08: Module-level permissions for MANAGER role */
  permissions?: string[]
  // FPRD-23: New profile fields
  username?: string
  headline?: string
  twitterUrl?: string
  youtubeUrl?: string
  leetcodeUrl?: string
  codechefUrl?: string
  hackerrankUrl?: string
  codeforcesUrl?: string
  gfgUrl?: string
  mediumUrl?: string
  resumeUrl?: string
  resumeFileName?: string
  resumeUploadedAt?: string
  profileVisibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  lastSeen?: string
}

/** FPRD-23: Public profile (no PII) */
export interface PublicProfile {
  username: string | null
  fullName: string
  headline: string | null
  bio: string | null
  profileImage: string | null
  isVerified: boolean
  branch: string | null
  collegeName: string | null
  currentYear: number | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  leetcodeUrl: string | null
  codechefUrl: string | null
  hackerrankUrl: string | null
  codeforcesUrl: string | null
  gfgUrl: string | null
  mediumUrl: string | null
  profileVisibility: string | null
  createdAt: string
}

/** FPRD-23: Profile completion detail */
export interface ProfileCompletionDetail {
  label: string
  filled: boolean
  weight: number
}

export interface ProfileCompletion {
  percentage: number
  details: ProfileCompletionDetail[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

// ── PRD-08: Role helpers ──────────────────────────────────────────────────────

export function isStudent(role?: UserRole | string): boolean {
  return role === 'STUDENT'
}

export function isManager(role?: UserRole | string): boolean {
  return role === 'MANAGER'
}

export function isSuperAdmin(role?: UserRole | string): boolean {
  return role === 'SUPER_ADMIN'
}

export function getDashboardPath(role?: UserRole | string): string {
  if (isSuperAdmin(role)) return '/admin/dashboard'
  if (isManager(role)) return '/manager/dashboard'
  return '/dashboard'
}
