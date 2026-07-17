export type Theme = 'light' | 'dark' | 'system'

/**
 * PRD-08: Role enum matches backend exactly (UPPERCASE).
 * The backend Role enum is: STUDENT | MENTOR | MANAGER | SUPER_ADMIN
 * ADMIN role is removed — SUPER_ADMIN is the single platform owner.
 */
export type UserRole = 'STUDENT' | 'MANAGER' | 'SUPER_ADMIN' | 'MENTOR'

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
  /** PRD-08: Module-level permissions for MANAGER role, included in JWT and /me response */
  permissions?: string[]
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

// ── PRD-08: Role helpers — always use these, never raw string comparison ───────

/**
 * Returns true if the user is a STUDENT.
 */
export function isStudent(role?: UserRole | string): boolean {
  return role === 'STUDENT'
}

/**
 * Returns true if the user is a MANAGER.
 */
export function isManager(role?: UserRole | string): boolean {
  return role === 'MANAGER'
}

/**
 * Returns true if the user is a SUPER_ADMIN (the single platform owner).
 */
export function isSuperAdmin(role?: UserRole | string): boolean {
  return role === 'SUPER_ADMIN'
}

/**
 * Returns true if the user is a MENTOR (read-only dashboard, future implementation).
 */
export function isMentor(role?: UserRole | string): boolean {
  return role === 'MENTOR'
}

/**
 * Returns the correct dashboard path for a given role.
 * PRD-08: Backend decides the role, frontend just routes accordingly.
 */
export function getDashboardPath(role?: UserRole | string): string {
  if (isSuperAdmin(role)) return '/admin/dashboard'
  if (isManager(role)) return '/manager/dashboard'
  if (isMentor(role)) return '/mentor/dashboard'
  return '/dashboard'
}
