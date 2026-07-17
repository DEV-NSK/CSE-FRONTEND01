/**
 * PRD-08: Single source of truth for all types.
 * Re-export everything from @/types so no duplicate type definitions exist.
 */
export type {
  Theme,
  UserRole,
  User,
  AuthTokens,
  AuthState,
  ApiResponse,
  PaginatedResponse,
  Notification,
  BreadcrumbItem,
  NavItem,
} from '@/types'

export { isStudent, isManager, isSuperAdmin, isMentor, getDashboardPath } from '@/types'
