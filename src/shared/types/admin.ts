// ─── Admin Types (FPRD-05) ────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number
  totalRoadmaps: number
  totalProblems: number
  totalProjects: number
  totalTeams: number
  totalJobs: number
  totalEvents: number
  newUsersThisMonth: number
  activeUsersToday: number
}

export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'admin' | 'instructor'
  college?: string
  isVerified: boolean
  createdAt: string
  lastActiveAt?: string
}

export interface AdminReport {
  id: string
  type: string
  generatedBy: string
  createdAt: string
  data: Record<string, unknown>
}

export interface PlatformSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  maxUploadSize: number
  supportEmail: string
  platformName: string
  featuredBanner?: string
}
