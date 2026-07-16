export type Theme = 'light' | 'dark' | 'system'

export type UserRole = 'student' | 'admin' | 'instructor'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  avatar?: string
  profileImage?: string
  bio?: string
  college?: string
  branch?: string
  year?: number
  phone?: string
  phoneNumber?: string
  github?: string
  linkedin?: string
  website?: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
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
